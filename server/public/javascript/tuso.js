APIHOST = (typeof(APIHOST) == 'undefined') ? '' : APIHOST;
let FILENAME = null;
let SCALE = 1;

if(sessionStorage.islogin == undefined || sessionStorage.islogin != 'true') {
    location.href = '/index.html';
} else {
    document.querySelector('section').removeAttribute('class');
}

window.onload = function(){
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
    } else if(/[\u4e00-\u9fa5]/.test(name)) {
        alert('请不要使用中文命名');
        return;
    }

    showModal();
    let url = `${APIHOST}/tusonewgroup?name=${name}`;
    fetch(url).then(e => {
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
    let groupid = document.querySelector('#wa_home_left_details_bar').dataset.groupid;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postBody = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(
            {
                id: groupid,
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

    
    fetch(APIHOST + '/tusoaddimgs', postBody).then(e => {
        console.log(e.status);
        resetDetailPage(document.querySelector("#wa_home_left_details_bar").dataset.groupid);
    });
}

function searchcore() {
    let groupid = document.querySelector('#wa_home_left_details_bar').dataset.groupid;
    let threshold = parseFloat(document.querySelector('#wa_search_right_threshold').value.trim());
    threshold = (threshold == '') ? 0.8 : threshold;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postBody = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(
            {
                data: {
                    "data": {
                        "uri": CONFIG.app.domain + FILENAME
                    },
                    "params": {
                        "groups": [
                            groupid
                        ],
                        "limit": 5,
                        "threshold": threshold
                    }
                }
            }
        )
    }
    let url = APIHOST + '/tusosearchimgs';
    fetch(url,postBody).then(e => e.json()).then(res => {
        let tmp = '<h3>检索结果</h3>';
        
        if(res.result == null || res.result[0].score < threshold) {
            tmp += `<p>图库中不存在相似度在${(threshold*100).toFixed(0)}%以上的图片</p>`;
        } else {
            res.result.forEach(res => {
                tmp +=  `<img src="${res.id}">
                    <p>置信度：${Math.floor(res.score*10000)/100}%</p>
                    <a href="${res.id}">${res.id}</a>`;
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
    fetch(APIHOST + '/tusogetgroup').then(e => e.json()).then(data => {
        let tmp = '';
        data.result.forEach(element => {
            if(/[\u4e00-\u9fa5]/.test(element)) return; //  filter chinese characher as chinese issue
            tmp += `<div class="wa-search-left-doc-card" data-id="${element}" onclick="openFolder(event)">
                        <div class="wa-search-delete" data-id="${element}" onclick="removeFolder(event)">X</div>
                        <img src="/imgs/doc.png" data-id="${element}" />
                        <p>${element}</p>
                    </div>`;
        });
        document.querySelector("#wa_home_left_menu_container").innerHTML = tmp;
        hideModal();
    });
}

function openFolder(event) {
    document.querySelector("#wa_home_left_menu").setAttribute('class', 'wa-component-hidden');
    document.querySelector("#wa_home_left_details").removeAttribute('class');
    document.querySelector("#wa_home_right_panel").setAttribute('class', 'wa-search-showringhtpanel');
    document.querySelector("#wa_home_left_details_bar").setAttribute('data-groupid', event.target.dataset.id);
    resetDetailPage(event.target.dataset.id);
}

function removeFolder(event) {
    event.preventDefault()
    event.stopPropagation();

    let conf = confirm('您确定要删除这个图片分组码？');
    if(conf) {
        let url = `${APIHOST}/tusoremovegroup?id=${event.target.dataset.id}`
        fetch(url).then(e => {
            resetMenuPage();
        });
    }
}

function removeImage(event) {
    event.preventDefault()
    event.stopPropagation();
    let groupid = document.querySelector('#wa_home_left_details_bar').dataset.groupid;
    let url = `${APIHOST}/tusoremoveimage?img=${event.target.dataset.id}&id=${groupid}`;
    fetch(url).then(e => {
        resetDetailPage(groupid);
    });
}

function resetDetailPage(id) {
    showModal()
    let url = `${APIHOST}/tusogetgroupimgs?name=${id}`;
    fetch(url).then(e => e.json()).then(data => {
        let tmp = '';
        if(data.result != null){
            data.result.forEach(element => {
                tmp += `<div class="wa-search-left-img-card">
                            <div class="wa-search-delete" data-id="${element.id}" onclick="removeImage(event)">X</div>
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