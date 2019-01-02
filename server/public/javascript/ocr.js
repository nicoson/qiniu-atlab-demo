let key = null;
let CONFIG = {};
let SCALE = 1;
// let OCRAPI = 'http://localhost:3000/ocr';
let OCRAPI = '/ocr';
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
    document.querySelector('#wa_home_imgcontainer').removeAttribute('class');
});

document.querySelector("#wa_home_btn_submit").addEventListener('click', function(e) {
    showModal();
    let file = document.querySelector('#wa_home_imgselector').files[0];
    let reader = new FileReader();
    reader.onload = function() {
        let uri = 'data:application/octet-stream' + this.result.slice(this.result.indexOf(';base64'));
        aicore(uri);
    }
    reader.readAsDataURL(file);
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
    fetch(APIHOST+OCRAPI,postBody).then(e => e.json()).then(res => {
        if(res.code == 1) {
            
        } else if (res.result.texts == undefined) {
            
        } else {
            if(res.result.bboxes.length > 0) {
                drawCanvas(res.result.bboxes, res.result.text);
                document.querySelector('#wa_home_canvas').removeAttribute('class');
            }
        }

        hideModal();
    });
}

function drawCanvas(res, text) {
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
        ctx.strokeStyle = "lime";
        ctx.fillStyle = "red";
        ctx.textBaseline = 'bottom';
        let tmp = '';
        for(let key in res) {
            drawbox(ctx, [[res[key][0],res[key][1]], [res[key][2],res[key][3]], [res[key][4],res[key][5]], [res[key][6],res[key][7]]]);
            let wordnum = 0.5;
            for(let i in text[key]) {
                wordnum += text[key].charCodeAt(i) > 255 ? 1 : 0.5;
            }
            let fontsize = Math.floor(Math.abs(res[key][0]-res[key][2])/(wordnum>0?wordnum:1));
            drawtext(ctx,fontsize,text[key],[res[key][6],res[key][7]]);
        }
    }
}

function drawbox(ctx,bbox) {
    ctx.fillStyle="#ffffffaa";
    ctx.beginPath();
    ctx.moveTo(...bbox[0]);
    ctx.lineTo(...bbox[1]);
    ctx.lineTo(...bbox[2]);
    ctx.lineTo(...bbox[3]);
    ctx.lineTo(...bbox[0]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawtext(ctx,fontsize,word,position) {
    ctx.fillStyle = "red";
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