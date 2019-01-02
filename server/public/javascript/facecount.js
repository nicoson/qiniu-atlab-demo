let key = null;
let FILELIST = [];
let CONFIG = {};
let SCALE = 1;
let APIHOST = '';
// let APIHOST = 'http://iias.qnservice.com';
// let APIHOST = 'http://100.100.56.158:55555';

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
    let files = e.target.files;
    if(files.length == 0) return;
    uploadImages(files);
});

function uploadImages(files) {
    let q = [];
    for(let i=0; i<files.length; i++) {
        q.push(new Promise(function(resolve, reject){
            let key = (new Date()).getTime() + '/' + files[i].name;
            FILELIST.push(key);
            // 添加上传dom面板
            let next = (response) => {
                let total = response.total;
                console.log("进度：" + total.percent + "% ");
                if(total.percent == 100) {
                    return resolve();
                }
            }
            
            let subscription;
            // 调用sdk上传接口获得相应的observable，控制上传和暂停
            let observable = qiniu.upload(files[i], key, CONFIG.token, CONFIG.putExtra, CONFIG.config);
            observable.subscribe(next);
        }));
    };

    showModal();
    Promise.all(q).then(() => {
        let files = document.querySelector('#wa_home_imgselector').files;
        let tmp = '';
        for(let i=0; i<FILELIST.length; i++){
            tmp += `<div class="wa-facecount-left-img-card">
                        <a href="${CONFIG.app.domain + FILELIST[i]}" target="_blank">
                            <img src="${CONFIG.app.domain + FILELIST[i]}" data-id="${FILELIST[i]}">
                            <p>${FILELIST[i].split('/').slice(-1)[0]}</p>
                        </a>
                    </div>`;
        }

        document.querySelector('#wa_home_imgselector').setAttribute('class', 'wa-component-hidden');
        document.querySelector('#wa_home_imgcontainer').innerHTML = tmp;
        document.querySelector('#wa_home_imgcontainer').removeAttribute('class');
        hideModal();
    });

}

document.querySelector("#wa_home_btn_submit").addEventListener('click', function(e) {
    // let files = document.querySelector('#wa_home_imgselector').files;
    // let filelist = [];
    // for(let i=0; i<files.length; i++){
    //     filelist.push(CONFIG.app.domain + files[i].name);
    // }
    if(FILELIST.length == 0) return;

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postBody = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(
            {
                urls: FILELIST.map(e => {return CONFIG.app.domain + e})
            }
        )
    }

    showModal();
    fetch(APIHOST + '/api/v1/face/uniq?threshold=0.66', postBody).then(e => e.json()).then(res => {
        let files = document.querySelector('#wa_home_imgselector').files;
        let tmp = `<h3>鉴定结果</h3>
                    <table>
                        <tr>
                            <td>共计图片：</td>
                            <td>${files.length}张</td>
                        </tr>
                        <tr>
                            <td>人数共计：</td>
                            <td>${res.result.totalFaceCnt}人</td>
                        </tr>
                        <tr>
                            <td>去重后共计：</td>
                            <td>${res.result.uniqFaceCnt}人</td>
                        </tr>
                    </table>`

        document.querySelector('#wa_home_resultshow').innerHTML = tmp;
        hideModal();
    });
});

document.querySelector("#wa_home_btn_back").addEventListener('click', function(e) {
    document.querySelector('#wa_home_imgcontainer').setAttribute('class', 'wa-component-hidden');
    document.querySelector('#wa_home_imgselector').removeAttribute('class');
    document.querySelector('#wa_home_imgselector').value = '';
    document.querySelector("#wa_home_resultshow").innerHTML = '';
    FILELIST = [];
});



function showModal() {
    document.querySelector('#wa_loading_modal').removeAttribute('class');
}
function hideModal() {
    document.querySelector('#wa_loading_modal').setAttribute('class', 'wa-component-hidden');
}