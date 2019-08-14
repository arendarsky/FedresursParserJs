const axios = require('axios'),
    baseUrl = 'https://fedresurs.ru/backend',
    companyResource = '/companies/search',
    publicationsResource = '/companies/publications',
    encumbranceResource = '/encumbrances',
    messageResource = '/sfactmessages';
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
    cookie = '_ym_uid=1548951109976200391; _ym_d=1548951109; _ym_uid=1548951109976200391; _ym_d=1565608103; fedresurscookie=8f5f3834a0625ad55e83acaf7c7d3cf2',
    publicationExample = {guid: "03201f77-8547-4fd9-bbed-c2b7e27cde63", startRowIndex: 0, searchSfactsMessage: true, searchSroAmMessage: true, searchTradeOrgMessage: true, searchAmReport: true, searchFirmBankruptMessage: true};

// axios.post(url + companyResource, {
//     entitySearchFilter: {
//         startRowIndex: 0,
//         pageSize: 36134
//     }
// }).then(function(response){
//     console.log();
// });
const startDate = new Date().;
const endDate = date.getDate();

while (true){

    axios.get(baseUrl + encumbranceResource, {
        params: {
            startIndex: 0,
            pageSize: 10000,
            additionalSearchFnp: true,
            searchString: 'инн',
            group: "Leasing",
            publishDateStart: "2019-08-10",
            publishDateEnd: "2019-08-14",
        },
        headers: {
            'Cookie': cookie,
            'User-Agent': userAgent
        }
    }).then(function(response){
        console.log(response);
    });
}
