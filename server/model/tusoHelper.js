const fetch = require('node-fetch');
const qiniu = require("qiniu");
const genToken  = require('./genToken');
const config  = require('./config');
let gt = new genToken();


class tusoHelper {
    constructor() {

    }

    genToken(reqURL, reqBody = '', method='GET', type='qbox') {
        let mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
        let contentType = 'application/json';
        let token = null;
        if(type == 'qiniu') {
            token = qiniu.util.generateAccessTokenV2(mac, reqURL, method, contentType, reqBody);
        } else {
            token = qiniu.util.generateAccessToken(mac, reqURL, reqBody);
        }
        // console.log(token);
        return token;
    }

    async getGroup() {
        let url = config.APIHOST + '/v1/image/group';
        let token = this.genToken(url, '', 'GET', 'qiniu');
        let options = {
            method: "GET", 
            headers: {
                "Content-Type": 'application/json',
                "Authorization": token
            }
        };
        // console.log(url);
        // console.log(JSON.stringify(options));
        let res = await fetch(url, options).then(e => e.json());
        return res;
    }

    async newGroup(name) {
        let url = `${config.APIHOST}/v1/image/group/${name}/new`;
        let postBody = JSON.stringify({data:[]});
        let token = this.genToken(url, postBody, 'POST', 'qiniu');
        let options = {
            method: "POST", 
            headers: {
                "Content-Type": 'application/json',
                "Authorization": token
            },
            body: postBody
        };
        // console.log(url);
        // console.log(JSON.stringify(options));
        let res = await fetch(url, options).then(e => e.json());
        return res;
    }

    async getGroupImgs(name) {
        let url = `${config.APIHOST}/v1/image/group/${name}`;
        let token = this.genToken(url, '', 'GET', 'qiniu');
        let options = {
            method: "GET", 
            headers: {
                "Content-Type": 'application/json',
                "Authorization": token
            }
        };
        // console.log(url);
        // console.log(JSON.stringify(options));
        let res = await fetch(url, options).then(e => e.json());
        return res;
    }

    async addImages(id, data) {
        let url = `${config.APIHOST}/v1/image/group/${id}/add`;
        let postBody = JSON.stringify({data:data});
        let token = this.genToken(url, postBody, 'POST', 'qiniu');
        let options = {
            method: "POST", 
            headers: {
                "Content-Type": 'application/json',
                "Authorization": token
            },
            body: postBody
        };
        // console.log(url);
        // console.log(JSON.stringify(options));
        let res = await fetch(url, options).then(e => e.json());
        return res;
    }

    async removeImages(group_id, image) {
        let url = `${config.APIHOST}/v1/image/group/${group_id}/delete`;
        let postBody = JSON.stringify({images:[image]});
        let token = this.genToken(url, postBody, 'POST', 'qiniu');
        let options = {
            method: "POST", 
            headers: {
                "Content-Type": 'application/json',
                "Authorization": token
            },
            body: postBody
        };
        // console.log(url);
        // console.log(JSON.stringify(options));
        let res = await fetch(url, options).then(e => e.json());
        return res;
    }

    async searchImages(data) {
        let url = `${config.APIHOST}/v1/image/groups/search`;
        let postBody = JSON.stringify(data);
        let token = this.genToken(url, postBody, 'POST', 'qiniu');
        let options = {
            method: "POST", 
            headers: {
                "Content-Type": 'application/json',
                "Authorization": token
            },
            body: postBody
        };
        console.log(url);
        console.log(JSON.stringify(options));
        let res = await fetch(url, options).then(e => e.json());
        return res;
    }

    async removeGroup(group_id) {
        let url = `${config.APIHOST}/v1/image/group/${group_id}/remove`;
        let token = this.genToken(url, '', 'POST', 'qiniu');
        let options = {
            method: "POST", 
            headers: {
                "Content-Type": 'application/json',
                "Authorization": token
            }
        };
        console.log(url);
        console.log(JSON.stringify(options));
        let res = await fetch(url, options).then(e => e.json());
        return res;
    }
}

module.exports = tusoHelper;



/* for debug

tuso = require('./tusoHelper')
t = new tuso();

t.getGroup().then(e=>console.log(e));
t.newGroup('test').then(e=>console.log(e));

*/