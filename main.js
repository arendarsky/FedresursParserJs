process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios'),
    fs = require('fs'),
    mongoClient = require('mongodb').MongoClient,
    mongoUrl = 'mongodb://localhost:27017/',
    mongoDbName = 'fedResurs',
    baseUrl = 'https://fedresurs.ru/backend',
    publicationsResource = '/companies/publications',
    encumbranceResource = '/encumbrances',
    messageResource = '/sfactmessages/',
    companyResource = '/companies/',
    interval = 0,
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
    cookie = '_ym_uid=1548951109976200391; _ym_d=1548951109; _ym_uid=1548951109976200391; _ym_d=1565608103; fedresurscookie=8f5f3834a0625ad55e83acaf7c7d3cf2',
    publicationExample = {guid: "03201f77-8547-4fd9-bbed-c2b7e27cde63", startRowIndex: 0, searchSfactsMessage: true, searchSroAmMessage: true, searchTradeOrgMessage: true, searchAmReport: true, searchFirmBankruptMessage: true},
    client = new mongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });


// axios.post(url + companyResource, {
//     entitySearchFilter: {
//         startRowIndex: 0,
//         pageSize: 36134
//     }
// }).then(function(response){
//     console.log();
// });

Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

mongoClient.prototype.insert = async function(dbName, collectionName, newRecords){
    await this.connect((err, db) => {
        if (err) throw err;
        const dbo = db.db(dbName);
        dbo.collection(collectionName).insertMany(newRecords, (err, res) => {
            if (err) throw err;
            const message = res.insertedCount + ' записей добавлено в коллекцию: ' + collectionName;
            console.log(message);
            writeToFile(message);
        });
    });
};

mongoClient.prototype.drop = function(dbName, collectionName){
    this.connect((err, db) => {
        if (err) throw err;
        const dbo = db.db(dbName);
        dbo.collection(collectionName).drop((err, success) => {
            if (err) throw err;
            if(success) console.log(collectionName + " dropped");
            else console.log(collectionName + " drop failed");
        });
        this.close();
    });
};

const formatDate = function (date){
    const year = date.getFullYear();
    const month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1);
    const day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
    return year + "-" + month + "-" + day;
};




const writeToFile = function(record){
    fs.appendFile('message.txt', record + "\n", function (err) {
        if (err) throw err;
    });
};

const loadLeasingContracts = async function(startDate, endDate){
    let data = {found: 0, pageData: []};
    await axios.get(baseUrl + encumbranceResource, {
        params: {
            startIndex: 0,
            pageSize: 10000,
            additionalSearchFnp: true,
            searchString: 'инн',
            group: "Leasing",
            publishDateStart: formatDate(startDate),
            publishDateEnd: formatDate(endDate),
        },
        headers: {
            'Cookie': cookie,
            'User-Agent': userAgent
        }
    }).then(function(response){
        data = response.data;
    }).catch(function (err){
        throw err;
    });
    return data;
};

const loadDocumentDetailsByGuid = async function(guid, resource) {
    let document = null;
    await axios.get(baseUrl + resource + guid, {
        headers: {
            'Cookie': cookie,
            'User-Agent': userAgent
        }
    }).then(function(response){
        document = response.data;
    }).catch(function(err){
        console.log(err);
    });
    return document;
};

const loadLeasingContractsForPeriod = async function (endDateString, startDateString){
    let endDate = new Date(endDateString);
    let startDate = new Date(startDateString);
    while (endDate >= startDate){
        const currentStartDate = endDate.addDays(-interval);
        const leasingContracts = await loadLeasingContracts(currentStartDate, endDate);
        let message = "За " + formatDate(currentStartDate) + " - " + formatDate(endDate) + " найдено " + leasingContracts.found + " записей";
        console.log(message);
        writeToFile(message);
        if (leasingContracts.found > 10000){
            message = "C " + formatDate(endDate.addDays(-interval)) +  " по " + formatDate(endDate) + " найдено больше 10000 записей"
            console.log(message);
            writeToFile(message);
        }
        if (leasingContracts.found === 0){
            break;
        }
        const leasingContractsWithDetails = [];
        for (const lc of leasingContracts.pageData){
            console.log(lc.guid + " is loading...");
            const leasingContractWithDetails = await loadDocumentDetailsByGuid(lc.guid, messageResource);
            if (leasingContractWithDetails) leasingContractsWithDetails.push(leasingContractWithDetails);
            else{
                message = "Договор лизинга " + lc.guid + " не найден";
                console.log(message);
                writeToFile(message);
            }
        }
        console.log(formatDate(endDate.addDays(-interval)) + " - " + formatDate(endDate) + " :");
        await client.insert(mongoDbName, 'newLeasingContracts',leasingContractsWithDetails);
        endDate = endDate.addDays(-interval - 1);
    }
};

const loadContractors = async function(){
    let guid = "";
    await client.connect(async function(err, db) {
        if (err) throw err;
        const dbo = db.db(mongoDbName);
        let i = 6000;
        while (i <= 900000) {
            const contractors = [];
            const guidList = [];
            await dbo.collection("leasingContracts").find().skip(i).limit(1000).forEach(m => {
                for (const c of m.message.companies){
                    guidList.push(c.guid);
                }
            }).then(async function(){
                for (const g of guidList){
                    console.log(g + " is loading...");
                    const contractor = await loadDocumentDetailsByGuid(g, companyResource);
                    if (contractor != null) contractors.push(contractor)
                }
            }).then(async function(){
                dbo.collection("companies").insertMany(contractors, (err, res) => {
                    if (err) throw err;
                    const message = res.insertedCount + ' записей добавлено в коллекцию: companies';
                    console.log(message);
                    writeToFile(message);
                });
            });
            i += 10000;
        }
    });

};

(async function run () {
    fs.truncate('message.txt', 0, function(){console.log('clear file')});
    await loadContractors();
})();






