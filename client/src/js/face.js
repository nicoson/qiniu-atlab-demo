if(sessionStorage.islogin == undefined || sessionStorage.islogin != 'true') {
    location.href = '/index.html';
// } else if(location.protocol == 'http:') {
//     alert("该页面需要通过https重新登录才能访问，现在帮您跳转 ～");
//     location.href = 'https://' + location.hostname;
} else {
    document.querySelector('section').removeAttribute('class');
}

const SSD_MOBILENETV1 = 'ssd_mobilenetv1';
const TINY_FACE_DETECTOR = 'tiny_face_detector';
const MTCNN = 'mtcnn';
let selectedFaceDetector = SSD_MOBILENETV1;//TINY_FACE_DETECTOR;

let forwardTimes = []
let withBoxes = false; // draw face box

// ssd_mobilenetv1 options
let minConfidence = 0.5

// tiny_face_detector options
let inputSize = 224;//512
let scoreThreshold = 0.5

//mtcnn options
let minFaceSize = 20


function updateTimeStats(timeInMs) {
    forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
    const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
    $('#time').val(`${Math.round(avgTimeInMs)} ms`)
    $('#fps').val(`${faceapi.round(1000 / avgTimeInMs)}`)
}

async function onPlay() {
    const videoEl = $('#inputVideo').get(0)

    if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
        return setTimeout(() => onPlay())


    const options = getFaceDetectorOptions()

    const ts = Date.now()

    const result = await faceapi.detectAllFaces(videoEl, options).withFaceLandmarks()

    updateTimeStats(Date.now() - ts)

    if (result) {
        drawLandmarks(videoEl, $('#overlay').get(0), result, withBoxes)
        // drawCanvas(document.querySelector('#inputVideo'),document.querySelector('#overlay'),result);
    }

    setTimeout(() => onPlay())
}

async function run() {
    // load face detection and face landmark models
    await loadModel(TINY_FACE_DETECTOR)
    await faceapi.loadFaceLandmarkModel('/json/weights/')
}

function updateResults() {}

$(document).ready(function() {
    run();
});

async function runCamera() {
    inputSize = 224;
    modalToggle(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    modalToggle(false);
    const videoEl = $('#inputVideo').get(0)
    videoEl.srcObject = stream;
    // run();
}

function runVideo() {
    let files = document.querySelector('#at_face_input_file').files;
    if(files.length > 0) {
        inputSize = 512;
        let videoEl = document.querySelector('#inputVideo');
        var url = window.URL.createObjectURL(files[0]);
        videoEl.srcObject = null;
        videoEl.src = url;
    } else {
        alert('请先上传视频文件，然后再开启检测');
    }
}

function runHLS() {
    let url = document.querySelector('#at_face_input_hls').value.trim();
    if(url.length > 0 && Hls.isSupported()) {
        inputSize = 512;
        var video = document.querySelector('#inputVideo');
        var hls = new Hls();
        hls.loadSource(url);
        // hls.loadSource('http://localhost:8080/hls/abc.m3u8');
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
            // video.play();
            onPlay();
        });
    }
}


// ===========================
//  faceDetectionControls.js
// ===========================
async function loadModel(detector) {
    selectedFaceDetector = detector;
    modalToggle(true);
    if (!isFaceDetectionModelLoaded()) {
      await getCurrentFaceDetectionNet().load('/json/weights/');
    }
    modalToggle(false);
}

function isFaceDetectionModelLoaded() {
    return !!getCurrentFaceDetectionNet().params
}

function getCurrentFaceDetectionNet() {
  if (selectedFaceDetector === SSD_MOBILENETV1) {
    return faceapi.nets.ssdMobilenetv1
  }
  if (selectedFaceDetector === TINY_FACE_DETECTOR) {
    return faceapi.nets.tinyFaceDetector
  }
  if (selectedFaceDetector === MTCNN) {
    return faceapi.nets.mtcnn
  }
}

function getFaceDetectorOptions() {
    return selectedFaceDetector === SSD_MOBILENETV1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : (
            selectedFaceDetector === TINY_FACE_DETECTOR
            ? new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
            : new faceapi.MtcnnOptions({ minFaceSize })
        )
}

function modalToggle(flag = null) {
    switch(flag) {
        case true:
            document.querySelector('#wa_loading_modal').classList.remove('wa-component-hidden');
            break;
        case false:
            document.querySelector('#wa_loading_modal').classList.add('wa-component-hidden');
            break;
        case null:
            document.querySelector('#wa_loading_modal').classList.toggle('wa-component-hidden');
    }
}

function drawCanvas(video, canvas, res) {
    canvas.width = video.offsetWidth;
    canvas.height = video.offsetHeight;
    let ratio = canvas.width/res.detection.imageDims.width;
    var ctx = canvas.getContext("2d");

    ctx.lineWidth = 1;
    ctx.fillStyle = "lime";
    let tmp = '';
    for(let p of res.landmarks.positions) {
        ctx.beginPath();
        ctx.arc(p.x * ratio, p.y * ratio, 2, 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}