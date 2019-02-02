let key = null;
let CONFIG = {};
let SCALE = 1;

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
    
    document.querySelector('#wa_home_image_input_panel').classList.toggle('wa-component-hidden');
    document.querySelector('#wa_home_imgcontainer').removeAttribute('class');
    getExif(e.target.files[0]);
});

document.querySelector('#wa_home_imgurlinput').addEventListener('blur', function(e) {
    let imgURL = e.target.value.trim();
    document.querySelector('#wa_home_imgselector').value = '';
    if(imgURL.length == 0) return;
    document.querySelector('#wa_home_imgcontainer').src = imgURL;
    
    document.querySelector('#wa_home_image_input_panel').classList.toggle('wa-component-hidden');
    document.querySelector('#wa_home_imgcontainer').removeAttribute('class');
    // getExif(e.target.files[0]);
});

document.querySelector("#wa_home_btn_submit").addEventListener('click', function(e) {
    showModal();
    if(document.querySelector('#wa_home_imgselector').files.length == 0) {
        let uri = document.querySelector('#wa_home_imgurlinput').value.trim();
        if(uri.length > 0) {
            aicore(uri);
        }
    } else {
        let file = document.querySelector('#wa_home_imgselector').files[0];
        let reader = new FileReader();
        reader.onload = function() {
            let uri = 'data:application/octet-stream' + this.result.slice(this.result.indexOf(';base64'));
            aicore(uri);
        }
        reader.readAsDataURL(file);
    }
});


function aicore(uri) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postBody = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(
            {
                url: uri
            }
        )
    }
    fetch(APIHOST+'/censor', postBody).then(e => e.json()).then(res => {
        if(res.code == 1) {
            
        } else if(res.code == 200) {
            let tmp = '';
            tmp += showSummary(res.result);
            tmp += showresult(res.result.scenes.pulp, 'pulp');
            tmp += showresult(res.result.scenes.terror, 'terror');
            tmp += showresult(res.result.scenes.ads, 'ads');
            tmp += faceResult(res.result.scenes.politician);

            if(res.result.scenes.politician.suggestion != 'pass') {
                drawCanvas(res.result.scenes.politician.details);
                document.querySelector('#wa_home_imgcontainer').setAttribute('class', 'wa-component-hidden');
                document.querySelector('#wa_home_canvas').removeAttribute('class');
            }

            document.querySelector("#wa_home_resultshow").innerHTML = tmp;
        }

        hideModal();
    });
}

document.querySelector("#wa_home_btn_back").addEventListener('click', function(e) {
    document.querySelector('#wa_home_imgcontainer').setAttribute('class', 'wa-component-hidden');
    document.querySelector('#wa_home_canvas').setAttribute('class', 'wa-component-hidden');
    document.querySelector('#wa_home_image_input_panel').classList.toggle('wa-component-hidden');
    document.querySelector('#wa_home_imgselector').value = '';
    document.querySelector('#wa_home_imgurlinput').value = '';
    document.querySelector("#wa_home_resultshow").innerHTML = '';
});

function showSummary(result) {
    let tmp = [];
    if(result.scenes.pulp.suggestion == 'block') tmp.push('涉黄');
    if(result.scenes.terror.suggestion == 'block') tmp.push('涉暴');
    if(result.scenes.ads.suggestion == 'block') tmp.push('小广告');
    if(result.scenes.politician.suggestion != 'pass') tmp.push('涉政');

    return `<h3>鉴定结果</h3>
    <h2>该图片${(tmp.length == 0) ? "无特殊内容！" : tmp.join('、')}</h2>
    `
}

function showresult(res, cls) {
    let tmp = `
    <fieldset disabled="disabled">
        <legend>“${(cls=='pulp')?'涉黄':((cls=='terror')?'暴恐':((cls=='ads')?'小广告':'政治'))}”信息鉴定结果：</legend>
        <table>
            <tr>
                <td>鉴别结果：</td>
                <td>${resultMap(cls, res)}</td>
            </tr>
            <tr>
                <td>置信度：</td>
                <td>${cls=='ads'?'-':(Math.round(res.details[0].score*10000)/100+'%')}</td>
            </tr>
        </table>
    </fieldset>
    
    `
    return tmp;
}

function faceResult(response) {
    let tmp = '';
    let res = [];
    if(response.suggestion != 'pass') {
        res = response.details.filter(e => e.sample != undefined);
    }

    if(res.length > 0) {
        res.forEach(ele => {
            tmp += `<tr>
                        <td>${ele.label}</td>
                        <td>${Math.round(ele.score*10000)/100}%</td>
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

function resultMap(cls, res) {
    switch(cls) {
        case 'pulp':
            return (res.details[0].label == 'pulp') ? '黄色淫秽' : ((res.details[0].label == 'sexy') ? '极度性感' : '无淫秽内容');
        case 'terror':
            return (res.details[0].label == 'normal') ? '无暴恐内容' : '暴恐图片';
        case 'politician':
            return;
        case 'ads':
            return (res.suggestion == 'pass') ? '无广告内容' : '小广告';
        default:
            return '很隐晦，你行你上啊~';
    }
}



function drawCanvas(res) {
    let imgURL = '';
    if(document.querySelector('#wa_home_imgselector').files.length == 0) {
        imgURL = document.querySelector('#wa_home_imgurlinput').value.trim();
    } else {
        imgURL = window.URL.createObjectURL(document.querySelector('#wa_home_imgselector').files[0]);
    }
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
            drawbox(ctx, res[key].detections[0].pts);
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