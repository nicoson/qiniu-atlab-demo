let key = null;
let CONFIG = {};
let SCALE = 1;

if(sessionStorage.islogin == undefined || sessionStorage.islogin != 'true') {
    location.href = '/index.html';
} else {
    document.querySelector('section').removeAttribute('class');
}

window.onload = function(){
    let App = {
        Bucket: "customer-demo-bjrun-nxwa",
        SignUrl: "token.php",
        //qiniu test account
        AK: "M-G8vwdVdmKYKk50ZdCcIyizX1ItahHnJN-lWsSG",
        SK: "onBC_RiBMOa6cTvUDmpgpguDNZRz4Q_5oW5bkYlA",
        domain: "http://p7fftezb2.bkt.clouddn.com/"
    }

    let tk = new TOKEN();

    // let token = 'M-G8vwdVdmKYKk50ZdCcIyizX1ItahHnJN-lWsSG:pP8sNG7YVjqDhXgWVHm2Y2lRVK8=:eyJzY29wZSI6ImN1c3RvbWVyLWRlbW8tYmpydW4tbnh3YSIsImRlYWRsaW5lIjoxNTI0MTk4NzYwfQ==';
    let token = tk.genToken(App.AK, App.SK);
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
};

document.querySelector('#wa_home_imgselector').addEventListener('change', function(e) {
    let imgURL = window.URL.createObjectURL(e.target.files[0]);
    document.querySelector('#wa_home_imgcontainer').src = imgURL;
    
    e.target.setAttribute('class', 'wa-component-hidden');
    document.querySelector('#wa_home_imgcontainer').removeAttribute('class');
    getExif(e.target.files[0]);
});

document.querySelector("#wa_home_btn_submit").addEventListener('click', function(e) {
    let file = document.querySelector('#wa_home_imgselector').files[0];
    key = (new Date()).getTime() + '/' + file.name;
    // 添加上传dom面板
    let next = (response) =>{
        let total = response.total;
        console.log("进度：" + total.percent + "% ");
        if(total.percent == 100) {
            thereSword();
        }
    }
    
    let subscription;
    // 调用sdk上传接口获得相应的observable，控制上传和暂停
    let observable = qiniu.upload(file, key, CONFIG.token, CONFIG.putExtra, CONFIG.config);
    observable.subscribe(next);
});

document.querySelector("#wa_home_btn_back").addEventListener('click', function(e) {
    document.querySelector('#wa_home_imgcontainer').setAttribute('class', 'wa-component-hidden');
    document.querySelector('#wa_home_canvas').setAttribute('class', 'wa-component-hidden');
    document.querySelector('#wa_home_imgselector').removeAttribute('class');
    document.querySelector('#wa_home_imgselector').value = '';
    document.querySelector("#wa_home_resultshow").innerHTML = '';
});

function thereSword() {
    let pulp = fetch(CONFIG.app.domain + '/' + key + '?qpulp').then(e => e.json());
    let terror = fetch(CONFIG.app.domain + '/' + key + '?qterror').then(e => e.json());
    let politician = fetch(CONFIG.app.domain + '/' + key + '?qpolitician').then(e => e.json());
    showModal();
    Promise.all([pulp, terror, politician]).then(res => {
        let tmp = '';
        //  pulp
        tmp += showSummary(res);
        tmp += showresult(res[0], 'pulp');
        tmp += showresult(res[1], 'terror');
        tmp += faceResult(res[2]);

        if(typeof(res[2].result.detections) != 'undefined' && res[2].result.detections.length > 0) {
            drawCanvas(res[2].result.detections);
            document.querySelector('#wa_home_imgcontainer').setAttribute('class', 'wa-component-hidden');
            document.querySelector('#wa_home_canvas').removeAttribute('class');
        }

        document.querySelector("#wa_home_resultshow").innerHTML = tmp;
        hideModal();
    });
}

function showSummary(res) {
    let tmp = [];
    if(res[0].result.label == 0) tmp.push('涉黄');
    if(res[1].result.label == 1) tmp.push('涉暴');
    if(typeof(res[2].result.detections) != 'undefined' && res[2].result.detections.filter(e => e.sample != undefined).length > 0) tmp.push('涉政');

    return `<h3>鉴定结果</h3>
    <h2>该图片${(tmp.length == 0) ? "无特殊内容！" : tmp.join('、')}</h2>
    `
}

function showresult(res, cls) {
    let tmp = `
    <fieldset disabled="disabled">
        <legend>“${(cls=='pulp')?'涉黄':((cls=='terror')?'暴恐':'政治')}”信息鉴定结果：</legend>
        <table>
            <tr>
                <td>鉴别结果：</td>
                <td>${resultMap(cls, res.result.label)}</td>
            </tr>
            <tr>
                <td>置信度：</td>
                <td>${Math.round(res.result.score*10000)/100}%</td>
            </tr>
        </table>
    </fieldset>
    
    `
    return tmp;
}

function faceResult(response) {
    let tmp = '';
    let res = [];
    if(typeof(response.result.detections) != 'undefined') {
        res = response.result.detections.filter(e => e.sample != undefined);
    }

    if(res.length > 0) {
        res.forEach(ele => {
            tmp += `<tr>
                        <td>${ele.value.name}</td>
                        <td>${Math.round(ele.value.score*10000)/100}%</td>
                    </tr>`;
        });

        tmp = `<fieldset disabled="disabled">
                    <legend>“政治人物”信息鉴定结果：</legend>
                    <table>
                        <tr>
                            <th>政治人物</th>
                            <th>置信度</th>
                        </tr>
                        ${tmp}
                    </table>
                </fieldset>`

        return tmp;
    } else {
        return `<fieldset disabled="disabled">
                    <legend>“政治人物”信息鉴定结果：</legend>
                    <p>并未出现相关政治人物</p>
                </fieldset>`;
    }
}

function resultMap(cls, label) {
    switch(cls) {
        case 'pulp':
            return (label == 0) ? '黄色淫秽' : ((label == 1) ? '极度性感' : '无淫秽内容');
        case 'terror':
            return (label == 0) ? '无暴恐内容' : '暴恐图片';
        case 'politician':
            return;
        default:
            return '很隐晦，你行你上啊~';
    }
}



function drawCanvas(res) {
    let imgURL = window.URL.createObjectURL(document.querySelector('#wa_home_imgselector').files[0]);
    let img = new Image();
    img.src = imgURL;
    img.onload = function() {
        var canvas = document.querySelector("#wa_home_canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // let scale = document.querySelector("#wa_home_canvas").clientWidth / img.width;

        ctx.lineWidth = 1;
        ctx.strokeStyle = "Lime";
        let tmp = '';
        for(let key in res) {
            drawbox(ctx, res[key].boundingBox.pts);
        }
    }
}

function drawbox(ctx,bbox) {
    ctx.beginPath();
    ctx.moveTo(...bbox[0]);
    ctx.lineTo(...bbox[1]);
    ctx.lineTo(...bbox[2]);
    ctx.lineTo(...bbox[3]);
    ctx.lineTo(...bbox[0]);
    ctx.closePath();
    ctx.stroke();
}


function showModal() {
    document.querySelector('#wa_loading_modal').removeAttribute('class');
}
function hideModal() {
    document.querySelector('#wa_loading_modal').setAttribute('class', 'wa-component-hidden');
}

function getExif(file) {
    EXIF.getData(file, function() {
        let info = EXIF.getAllTags(this);
        console.log(info);
    });
}