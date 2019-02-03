// let APIHOST = 'http://0.0.0.0:3000';
// let APIHOST = '';

// let isEditor = sessionStorage.isEditor == undefined ? false : (sessionStorage.isEditor == 'true' ? true : false);

// if(sessionStorage.islogin == undefined || sessionStorage.islogin != 'true') {
//     location.href = '/index.html';
// } else {
//     document.querySelector('section').removeAttribute('class');
// }
let CONFIG = {};
{
    let App = {
        Bucket: "atlab-demo-tuso",
        //  account: aitest@qiniu.com
        AK: "M-G8vwdVdmKYKk50ZdCcIyizX1ItahHnJN-lWsSG",
        SK: "onBC_RiBMOa6cTvUDmpgpguDNZRz4Q_5oW5bkYlA",
        domain: "http://pma42jeo6.bkt.clouddn.com/"
    }
    
    let tk = new TOKEN();
    
    let token = tk.genToken(App.AK, App.SK, App.Bucket);
    // console.log(token);
        
    let config = {
        useCdnDomain: true,
        region: qiniu.region.z0
    };
        
    let putExtra = {
        fname: "",
        params: {},
        mimeType: null
    };
    
    CONFIG = {
        token: token,
        putExtra: putExtra, 
        config: config,
        app: App
    };
}


// initiate navbar
let page = {
    home:           '万剑归宗',
    weixinweibo:    '微信微博',
    // 'ocr-ctpn':     '长文本',
    ocr:            '通用OCR',
    // idcard:         '身份证识别',
    idcardsari:     '身份证',
    bankcard:       '银行卡',
    vat:            '增值税发票',
    tuso:           '以图搜图',
    // search:         '涉暴信息(检测)',
    // facecount:      '涉政信息'
};
let navbartmp = '';
for(let i in page) {
    navbartmp += `<a href="/${i}.html" ${location.pathname.indexOf(i+'.html')>0?'class="wa-home-nav-selected"':''} target="_self">${page[i]}</a>`;
}
document.querySelector("#wa_home_navbar").innerHTML = navbartmp;