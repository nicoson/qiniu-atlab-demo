let key = null;
let CONFIG = {};
let SCALE = 1;
// let OCRAPI = 'http://100.100.56.220:3000/weixinweibo';
let OCRAPI = '/weixinweibo';
// let OCRAPI = 'http://iias.qnservice.com/api/v1/ocr';
// let OCRAPI = '/api/v1/ocr';

if(sessionStorage.islogin == undefined || sessionStorage.islogin != 'true') {
    location.href = '/index.html';
} else {
    document.querySelector('section').removeAttribute('class');
}

window.onload = function(){
    APIHOST = (typeof(APIHOST) == 'undefined') ? '' : APIHOST;

    let App = {
        Bucket: "customer-demo-bjrun-nxwa",
        SignUrl: "token.php",
        //qiniu test account
        AK: "M-G8vwdVdmKYKk50ZdCcIyizX1ItahHnJN-lWsSG",
        SK: "onBC_RiBMOa6cTvUDmpgpguDNZRz4Q_5oW5bkYlA",
        domain: "http://p7fftezb2.bkt.clouddn.com/"
    }

    let tk = new TOKEN();

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
});

document.querySelector("#wa_home_btn_submit").addEventListener('click', function(e) {
    let file = document.querySelector('#wa_home_imgselector').files[0];
    key = (new Date()).getTime() + '/' + file.name;
    // 添加上传dom面板
    let next = (response) =>{
        let total = response.total;
        console.log("进度：" + total.percent + "% ");
        if(total.percent == 100) {
            aicore();
        }
    }
    
    let subscription;
    // 调用sdk上传接口获得相应的observable，控制上传和暂停
    let observable = qiniu.upload(file, key, CONFIG.token, CONFIG.putExtra, CONFIG.config);
    showModal();
    observable.subscribe(next);
});

document.querySelector("#wa_home_btn_back").addEventListener('click', function(e) {
    document.querySelector('#wa_home_imgcontainer').setAttribute('class', 'wa-component-hidden');
    document.querySelector('#wa_home_canvas').setAttribute('class', 'wa-component-hidden');
    document.querySelector('#wa_home_imgselector').removeAttribute('class');
    document.querySelector('#wa_home_imgselector').value = '';
    document.querySelector("#wa_home_resultshow").innerHTML = '';
});

function aicore() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postBody = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(
            {
                url: 'http://p7fftezb2.bkt.clouddn.com/' + key
            }
        )
    }
    fetch(APIHOST+OCRAPI,postBody).then(e => e.json()).then(res => {
        let tmp =  '<h3>检测识别结果</h3>';
        if(res.code == 1) {
            tmp += `<p>${res.message}</p>`;
        } else if (res.result.texts == undefined) {
            tmp += `<p>没有检测到文字</p>`;
        } else {
            let temp2 = res.result.texts.map((e,ind) => {
                return `<tr><td>${ind+1}：</td><td>${e}</td></tr>`
            });

            tmp += `<table>
                    <tr>
                        <th>文本类型：</th>
                        <td>${res.result.type}</td>
                    </tr>
                    <tr>
                        <th colspan=2>文本内容：</th>
                    </tr>`
                    + temp2.join('') +
                `</table>`;

            if(res.result.bboxes.length > 0) {
                drawCanvas(res.result.bboxes);
                document.querySelector('#wa_home_imgcontainer').setAttribute('class', 'wa-component-hidden');
                document.querySelector('#wa_home_canvas').removeAttribute('class');
            }
        }

        document.querySelector("#wa_home_resultshow").innerHTML = tmp;
        hideModal();
    });
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
        for(let ind in res) {
            drawbox(ctx, res[ind]);
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