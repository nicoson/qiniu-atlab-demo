let APIHOST = 'http://0.0.0.0:3000';
// let APIHOST = '';

// let isEditor = sessionStorage.isEditor == undefined ? false : (sessionStorage.isEditor == 'true' ? true : false);

// if(sessionStorage.islogin == undefined || sessionStorage.islogin != 'true') {
//     location.href = '/index.html';
// } else {
//     document.querySelector('section').removeAttribute('class');
// }

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
    // search:         '涉暴信息(检测)',
    // facecount:      '涉政信息'
};
let navbartmp = '';
for(let i in page) {
    navbartmp += `<a href="/${i}.html" ${location.pathname.indexOf(i+'.html')>0?'class="wa-home-nav-selected"':''} target="_self">${page[i]}</a>`;
}
document.querySelector("#wa_home_navbar").innerHTML = navbartmp;