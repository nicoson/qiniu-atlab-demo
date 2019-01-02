const qiniu = require("qiniu");

// const accessKey = "yvkBAhylLK6HTrhU644UcFiVeFhRMR4geKGB1Prt";
// const secretKey = "1Kfm9tUJURJWxYFHWL1X-HuVVFMMEPwn2S4j5EoW";

const accessKey = "UQGWo-wxlNoVY6WSjHpnNCPEKGZ3F4iaiQgqONAQ";
const secretKey = "VVgmkRHhuq57Kwwlk8cUKt7DyHcN3bDJQZLlTqHl";

class genToken {
    constructor() {

    }

    genToken(reqURL, reqBody='', isMock=false) {
        if(isMock) return 'QiniuStub uid=1&ut=2';

        let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        // let reqURL = "http://10.34.43.45:16301/admin/domain/oquqvdmso.bkt.clouddn.com";
        let contentType = 'application/json';
        let token = qiniu.util.generateAccessTokenV2(mac, reqURL, 'POST', contentType, reqBody);
        // let token = qiniu.util.generateAccessToken(mac, reqURL, reqBody);
        console.log(token);
        return token;
    }

}

module.exports = genToken;