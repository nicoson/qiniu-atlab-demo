let key = null;
let SCALE = 1;
// let OCRAPI = 'http://localhost:3000/vat';
let OCRAPI = '/vat';
// let OCRAPI = 'http://iias.qnservice.com/api/v1/ocr';
// let OCRAPI = '/api/v1/ocr';

if(sessionStorage.islogin == undefined || sessionStorage.islogin != 'true') {
    location.href = '/index.html';
} else {
    document.querySelector('section').removeAttribute('class');
}

window.onload = function(){
    APIHOST = (typeof(APIHOST) == 'undefined') ? '' : APIHOST;
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
                url: CONFIG.app.domain + key
            }
        )
    }
    let ocr = fetch(APIHOST+OCRAPI,postBody).then(e => e.json()).then(res => {
        let tmp =  '<h3>识别结果</h3>';
        if(res.code == 1) {
            tmp += `<p>${res.message}</p>`;
        } else {
            let table = '<table>';
            for(let i in res.result.res) {
                table += `<tr>
                        <th>${i}：</th>
                        <td>${res.result.res[i]}</td>
                    </tr>`;
            }
            tmp = table + '</table>';

            // document.querySelector('#wa_home_imgcontainer').src = 'data:img/jpg;base64,' + res.result.uri;
        }

        document.querySelector("#wa_home_resultshow").innerHTML = tmp;
        hideModal();

        if(res.result != undefined) {
            drawCanvas(res.result.bboxes);
            document.querySelector('#wa_home_imgcontainer').setAttribute('class', 'wa-component-hidden');
            document.querySelector('#wa_home_canvas').removeAttribute('class');
        }
    });
}

function drawCanvas(res) {
    // let imgURL = window.URL.createObjectURL(document.querySelector('#wa_home_imgcontainer'));
    let img = new Image();
    img.src = document.querySelector('#wa_home_imgcontainer').src;
    img.onload = function() {
        var canvas = document.querySelector("#wa_home_canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // let scale = document.querySelector("#wa_home_canvas").clientWidth / img.width;

        ctx.lineWidth = 1;
        ctx.strokeStyle = "Lime";
        for(let key in res) {
            drawbox(ctx, res[key]);
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

function drawtext(ctx,fontsize,word,position) {
    ctx.font=`${fontsize}px Arial`;
    ctx.fillText(word,position[0],position[1]);
    ctx.closePath();
}

function showModal() {
    document.querySelector('#wa_loading_modal').removeAttribute('class');
}
function hideModal() {
    document.querySelector('#wa_loading_modal').setAttribute('class', 'wa-component-hidden');
}