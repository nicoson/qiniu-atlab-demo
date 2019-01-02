let FILENAME = null;
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
        domain: "http://p8jrba1ok.bkt.clouddn.com/"
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

    // fetch group list info
    // fetch('/')
    
    resetMenuPage();
};

document.querySelector("#wa_home_left_details_back").addEventListener('click', function(e) {
    document.querySelector("#wa_home_right_panel").setAttribute('class', 'wa-search-hideringhtpanel');
    document.querySelector("#wa_home_left_details").setAttribute('class', 'wa-component-hidden');
    document.querySelector("#wa_home_left_menu").removeAttribute('class');
    document.querySelector("#wa_home_imgselector").value = '';
    document.querySelector("#wa_home_imgcontainer").src = '';
    document.querySelector("#wa_home_resultshow").innerHTML = '';
    setTimeout(() => {
        document.querySelector("#wa_home_right_panel").setAttribute('class', 'wa-component-hidden');
    }, 500);
})

document.querySelector('#wa_home_imgselector').addEventListener('change', function(e) {
    let imgURL = window.URL.createObjectURL(e.target.files[0]);
    document.querySelector('#wa_home_imgcontainer').src = imgURL;
});


document.querySelector('#wa_home_left_details_uploadimg_submit').addEventListener('click', function(e) {
    let file = document.querySelector('#wa_home_left_details_uploadimg').files[0];
    FILENAME = (new Date()).getTime() + '/' + file.name;
    // 添加上传dom面板
    let next = (response) => {
        let total = response.total;
        console.log("进度：" + total.percent + "% ");
        if(total.percent == 100) {
            addtoGroup();
            hideModal();
        }
    }
    
    let subscription;
    // 调用sdk上传接口获得相应的observable，控制上传和暂停
    showModal();
    let observable = qiniu.upload(file, FILENAME, CONFIG.token, CONFIG.putExtra, CONFIG.config);
    observable.subscribe(next);
});

// create new group folder
document.querySelector("#wa_home_left_menu_bar_submit").addEventListener('click', function(e) {
    let name = document.querySelector('#wa_home_left_menu_bar_input').value;
    if(name.trim() == '') {
        alert('请输入先分组名称');
        return;
    }
    // alert(name);return;

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postBody = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(
            {
                name: name
            }
        )
    }

    showModal();
    fetch(APIHOST + '/api/v1/image/group/new', postBody).then(e => {
        if(e.status == 200) {
            console.log('success');
        } else {
            console.log('error: ', e.status);
        }

        resetMenuPage();
        hideModal();
    });
});

document.querySelector("#wa_home_btn_submit").addEventListener('click', function(e) {
    let file = document.querySelector('#wa_home_imgselector').files[0];
    FILENAME = (new Date()).getTime() + '/' + file.name;
    // 添加上传dom面板
    let next = (response) =>{
        let total = response.total;
        console.log("进度：" + total.percent + "% ");
        if(total.percent == 100) {
            searchcore();
        }
    }
    
    let subscription;
    // 调用sdk上传接口获得相应的observable，控制上传和暂停
    showModal();
    let observable = qiniu.upload(file, FILENAME, CONFIG.token, CONFIG.putExtra, CONFIG.config);
    observable.subscribe(next);
});

function addtoGroup() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postBody = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(
            {
                data: [
                    {
                        "uri": CONFIG.app.domain + FILENAME,
                        "attribute": {
                            "label": '',
                            "id": CONFIG.app.domain + FILENAME
                        }
                    }
                ]
            }
        )
    }

    let groupid = document.querySelector('#wa_home_left_details_bar').dataset.groupid;

    fetch(APIHOST + '/api/v1/image/group/'+ groupid +'/add', postBody).then(e => {
        console.log(e.status);
        resetDetailPage(document.querySelector("#wa_home_left_details_bar").dataset.groupid);
    });
}

function searchcore() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postBody = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(
            {
                "data": {
                    "uri": 'http://p7fftezb2.bkt.clouddn.com/' + FILENAME
                },
                "params": {
                    "limit": 5
                }
            }
        )
    }
    let groupid = document.querySelector('#wa_home_left_details_bar').dataset.groupid;
    let ocr = fetch(APIHOST + '/api/v1/image/group/' + groupid + '/search',postBody).then(e => e.json()).then(res => {
        let tmp = '<h3>检索结果</h3>';
        if(res.result == null || res.result[0].score < 0.5) {
            tmp += '<p>图库中不存在相似度在50%以上的图片</p>';
        } else {
            res.result.forEach(res => {
                tmp +=  `<img src="${res.uri}">
                    <p>置信度：${Math.floor(res.score*10000)/100}%</p>
                    <a href="${res.uri}">${res.uri}</a>`;
            });
        }
        
        document.querySelector("#wa_home_resultshow").innerHTML = tmp;
        hideModal();
    });
}


function resetMenuPage() {
    //  TODO
    //  fetch
    showModal();
    fetch(APIHOST + '/api/v1/image/group').then(e => e.json()).then(data => {
        let tmp = '';
        data.result.forEach(element => {
            tmp += `<div class="wa-search-left-doc-card" data-id="${element}">
                        <div class="wa-search-delete" data-id="${element}">X</div>
                        <img src="/imgs/doc.png" data-id="${element}" />
                        <p>${element}</p>
                    </div>`;
        });
        document.querySelector("#wa_home_left_menu_container").innerHTML = tmp;
        addFolderEvent();
        hideModal();
    });
}

function addFolderEvent() {
    document.querySelectorAll('.wa-search-left-doc-card').forEach(e => {
        e.addEventListener('click', function(e) {
            document.querySelector("#wa_home_left_menu").setAttribute('class', 'wa-component-hidden');
            document.querySelector("#wa_home_left_details").removeAttribute('class');
            document.querySelector("#wa_home_right_panel").setAttribute('class', 'wa-search-showringhtpanel');
            document.querySelector("#wa_home_left_details_bar").setAttribute('data-groupid', e.target.dataset.id);

            resetDetailPage(e.target.dataset.id);
        });
    });

    document.querySelectorAll('.wa-search-delete').forEach(e => {
        e.addEventListener('click', function(e) {
            e.preventDefault()
            e.stopPropagation();

            let conf = confirm('您确定要删除这个图片分组码？');
            if(conf) {
                let headers = new Headers();
                headers.append('Content-Type', 'application/json');
                let postBody = {
                    method: 'POST',
                    headers: headers
                }
                fetch(APIHOST + '/api/v1/image/group/' + e.target.dataset.id + '/remove', postBody).then(e => {
                    console.log(e.status);
                    resetMenuPage();
                });
            }
        })
    })
}


function resetDetailPage(id) {
    showModal()
    fetch(APIHOST + '/api/v1/image/group/' + id).then(e => e.json()).then(data => {
        let tmp = '';
        if(data.result.length > 0){
            data.result.forEach(element => {
                tmp += `<div class="wa-search-left-img-card">
                            <a href="${element.id}" target="_blank">
                                <img src="${element.id}" data-id="${element.id}">
                                <p>${element.id.split('/').slice(-1)[0]}</p>
                            </a>
                        </div>`;
            });
        }
        document.querySelector("#wa_home_left_details_container").innerHTML = tmp;
        hideModal();
    });
}

function showModal() {
    document.querySelector('#wa_loading_modal').removeAttribute('class');
}
function hideModal() {
    document.querySelector('#wa_loading_modal').setAttribute('class', 'wa-component-hidden');
}