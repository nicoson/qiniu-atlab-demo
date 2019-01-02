const fetch = require('node-fetch');
const genToken  = require('../model/genToken');
let gt = new genToken();


class callFunc {
    constructor(isMock = false) {
        this.isMock = isMock;

        if(!this.isMock) {
            this.api_ocr = "http://argus.atlab.ai/v1/ocr/text";
            this.api_scene = "http://argus.atlab.ai/v1/ocr/scene";
            this.api_ctpn_detect = "http://serve.atlab.ai/v1/eval/ocr-detect";
            this.api_scene_detect = "http://serve.atlab.ai/v1/eval/ocr-scene-detect";
            this.api_scene_recog = "http://serve.atlab.ai/v1/eval/ocr-scene-recog";
            this.api_idcard = "http://serve.atlab.ai/v1/eval/ocr-idcard";
            this.api_idcard_sari = "http://argus.atlab.ai/v1/ocr/idcard";
            this.api_vat = "http://argus.atlab.ai/v1/ocr/vat";
        } else {
            // cs api
            this.api_ocr = "http://ava-argus-gate.cs.cg.dora-internal.qiniu.io:5001/v1/ocr/text";
            this.api_scene = "http://ava-argus-gate.cs.cg.dora-internal.qiniu.io:5001/v1/ocr/scene";
            this.api_scene_detect = 'http://ava-serving-gate.cs.cg.dora-internal.qiniu.io:5001/v1/eval/ocr-scene-detect';
            // this.api_scene_detect = "http://serve.atlab.ai/v1/eval/ocr-scene-detect";
            this.api_scene_recog = 'http://ava-serving-gate.cs.cg.dora-internal.qiniu.io:5001/v1/eval/ocr-scene-recog';
            this.api_idcard = "http://ava-argus-gate.cs.cg.dora-internal.qiniu.io:5001/v1/eval/ocr-idcard";
            this.api_bankcard = "http://ava-argus-gate.cs.cg.dora-internal.qiniu.io:5001/v1/ocr/bankcard";
        }
        
        this.options = {
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'QiniuStub uid=1&ut=2'
            }
        };
    }

    callOCR(imgurl) {
        let postBody = JSON.stringify({"data": {"uri": imgurl}});
        let token = gt.genToken(this.api_ocr, postBody);
        this.options.headers.Authorization = this.isMock ? 'QiniuStub uid=1&ut=2':token;
        this.options.body = postBody;

        return new Promise(function(resolve, reject) {
            console.log(this.api_ocr);
            fetch(this.api_ocr, this.options).then(e => e.json()).then(e => {
                console.log(e);
                resolve(e);
            }).catch(e => {
                console.log(e);
                resolve(e);
            });
        }.bind(this));
    }

    callCTPN(imgurl) {
        let postBody = JSON.stringify({"data": {"uri": imgurl},"image_type":{"type":"blob"}});
        let token = gt.genToken(this.api_ctpn_detect, postBody, this.isMock);
        this.options.headers.Authorization = token;
        this.options.body = postBody;
        console.log(this.options);

        return new Promise(function(resolve, reject) {
            fetch(this.api_ctpn_detect, this.options).then(e => e.json()).then(det => {
                console.log(det);
                if(det.error != undefined) resolve(det);
    
                let postBody = JSON.stringify({
                    "data": {"uri": imgurl},
                    "params": det.result
                });
                let token = gt.genToken(this.api_scene_recog, postBody, this.isMock);
                this.options.headers.Authorization = token;
                this.options.body = postBody;
    
                fetch(this.api_scene_recog, this.options).then(e => e.json()).then(e => {
                    console.log(e);
                    e.result.type = det.result.bboxes.length > 0 ? '文本' : '非文本';
                    let bboxes = [];
                    let text = [];
                    e.result.texts.map(e => {
                        bboxes.push(e.bboxes);
                        text.push(e.text);
                    });
                    e.result.bboxes = bboxes;
                    e.result.text = text;
                    resolve(e);
                });
            });
        }.bind(this))
    }

    callOCR_adv(imgurl) {
        let postBody = JSON.stringify({"data": {"uri": imgurl}});
        let token = gt.genToken(this.api_scene_detect, postBody, this.isMock);
        this.options.headers.Authorization = token;
        console.log(token);
        this.options.body = postBody;
        console.log(this.options);

        return new Promise(function(resolve, reject) {
            fetch(this.api_scene_detect, this.options).then(e => e.json()).then(det => {
                console.log('detect result: ', det);
                if(det.error != undefined || det.result.pts == undefined) resolve(det);
    
                let postBody = JSON.stringify({
                    "data": {
                        "uri": imgurl,
                        "attribute": {
                            pts: det.result.pts
                        }
                    }
                });
                let token = gt.genToken(this.api_scene_recog, postBody, this.isMock);
                this.options.headers.Authorization = token;
                this.options.body = postBody;
    
                fetch(this.api_scene_recog, this.options).then(e => e.json()).then(e => {
                    console.log('recog result: ', e);
                    e.result.type = det.result.pts > 0 ? '文本' : '非文本';
                    let text = [];
                    e.result.texts.map(e => {
                        text.push(e.text);
                    });
                    e.result.bboxes = det.result.pts;
                    e.result.text = text;
                    resolve(e);
                });
            });
        }.bind(this))
    }

    callIDCard(imgurl) {
        let postBody = JSON.stringify({"data": {"uri": imgurl}});
        let token = gt.genToken(this.api_idcard, postBody);
        this.options.headers.Authorization = token;
        this.options.body = postBody;

        return new Promise(function(resolve, reject) {
            fetch(this.api_idcard, this.options).then(e => e.json()).then(e => {
                resolve(e);
            });
        }.bind(this));
    }

    callIDCardSari(imgurl) {
        let postBody = JSON.stringify({"data": {"uri": imgurl}});
        let token = gt.genToken(this.api_idcard_sari, postBody);
        this.options.headers.Authorization = token;
        this.options.body = postBody;

        return new Promise(function(resolve, reject) {
            fetch(this.api_idcard_sari, this.options).then(e => e.json()).then(e => {
                resolve(e);
            });
        }.bind(this));
    }

    callVAT(imgurl) {
        let postBody = JSON.stringify({"data": {"uri": imgurl}});
        let token = gt.genToken(this.api_vat, postBody);
        this.options.headers.Authorization = this.isMock ? 'QiniuStub uid=1&ut=2':token;
        this.options.body = postBody;

        return new Promise(function(resolve, reject) {
            fetch(this.api_vat, this.options).then(e => e.json()).then(e => {
                resolve(e);
            });
        }.bind(this));
    }

    callBankCard(imgurl) {
        let postBody = JSON.stringify({"data": {"uri": imgurl}});
        let token = gt.genToken(this.api_bankcard, postBody);
        this.options.headers.Authorization = this.isMock ? 'QiniuStub uid=1&ut=2':token;
        this.options.body = postBody;
        console.log('body: ', postBody);
        return new Promise(function(resolve, reject) {
            fetch(this.api_bankcard, this.options).then(e => e.json()).then(e => {
                resolve(e);
            });
        }.bind(this));
    }
}

module.exports = callFunc;

// let cf = new callFunc();
// cf.callOCR_adv('http://p7fftezb2.bkt.clouddn.com/1527234683677/6.png').then(e => console.log(e));