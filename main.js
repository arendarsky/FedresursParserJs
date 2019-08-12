const axios = require('axios'),
    url = 'https://fedresurs.ru/backend',
    companyResource = '/companies/search',
    publicationsResource = '/companies/publications',
    publicationExample = {guid: "03201f77-8547-4fd9-bbed-c2b7e27cde63", startRowIndex: 0, searchSfactsMessage: true, searchSroAmMessage: true, searchTradeOrgMessage: true, searchAmReport: true, searchFirmBankruptMessage: true};

axios.post(url + companyResource, {
    entitySearchFilter: {
        startRowIndex: 0,
        pageSize: 36134
    }
}).then(function(response){
    console.log();
});