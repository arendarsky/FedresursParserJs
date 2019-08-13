const axios = require('axios'),
    baseUrl = 'https://fedresurs.ru/backend',
    companyResource = '/companies/search',
    publicationsResource = '/companies/publications',
    encumbranceResource = '/encumbrances';
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

axios.get(baseUrl + encumbranceResource, {
    params: {
        startIndex: 0,
        pageSize: 15,
        additionalSearchFnp: true,
        searchString: 'финансовой аренды',
        group: null,
        publishDateStart: null,
        publishDateEnd: null,
    },
    headers: {
        'Cookie': cookie,
        'User-Agent': userAgent
    }
}).then(function(response){
   console.log(response);
});