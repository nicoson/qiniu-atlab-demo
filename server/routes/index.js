const express   = require('express');
const router    = express.Router();
const callFunc  = require('../model/callFunc');
const tusoHelper  = require('../model/tusoHelper');
let cf = new callFunc(false);
let tuso = new tusoHelper();


/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'login' });
});

/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('home', { title: '3-sward' });
});

/* GET ocr page. */
router.get('/ocr', function(req, res, next) {
  res.render('ocr', { title: 'ocr' });
});

/* GET ocr-ctpn page. */
router.get('/ocr-ctpn', function(req, res, next) {
  res.render('ocr-ctpn', { title: 'ocr' });
});

/* GET weixinweibo page. */
router.get('/weixinweibo', function(req, res, next) {
  res.render('weixinweibo', { title: 'weixinweibo' });
});

/* GET terror page. */
router.get('/idcard', function(req, res, next) {
  res.render('idcard', { title: 'idcard' });
});

/* GET terror page. */
router.get('/idcardsari', function(req, res, next) {
  res.render('idcardsari', { title: 'idcard' });
});

/* GET terror page. */
router.get('/vat', function(req, res, next) {
  res.render('vat', { title: 'vat' });
});

/* GET terror page. */
router.get('/bankcard', function(req, res, next) {
  res.render('vat', { title: 'vat' });
});




//  post censor
router.post('/censor', function(req, res, next) {
  cf.callCensor(req.body.url).then(data => {
    res.send(data);
  });
});

//  post ocr detect & recognize
router.post('/ocr', function(req, res, next) {
  cf.callOCR_adv(req.body.url).then(data => {
    res.send(data);
  });
});

//  post ocr detect & recognize
router.post('/ocr-ctpn', function(req, res, next) {
  cf.callCTPN(req.body.url).then(data => {
    res.send(data);
  });
});

//  post weixinweibo argus
router.post('/weixinweibo', function(req, res, next) {
  cf.callOCR(req.body.url).then(data => {
    res.send(data);
  });
});

//  post id card recognize
router.post('/idcard', function(req, res, next) {
  cf.callIDCard(req.body.url).then(data => {
    console.log(data);
    if(data.error != undefined) {
      data.result = {address: '',id_number: '',name: '',people: '',sex: ''};
    }
    res.send(data);
  });
});

//  post sari id card recognize
router.post('/idcardsari', function(req, res, next) {
  cf.callIDCardSari(req.body.url).then(data => {
    console.log(data);
    if(data.error != undefined) {
      data.result = {address: '',id_number: '',name: '',people: '',sex: ''};
    }
    res.send(data);
  });
});

//  post sari id card recognize
router.post('/vat', function(req, res, next) {
  cf.callVAT(req.body.url).then(data => {
    console.log(data);
    if(data.error != undefined) {
      data.result = {address: '',id_number: '',name: '',people: '',sex: ''};
    }
    res.send(data);
  });
});

//  post sari bank card recognize
router.post('/bankcard', function(req, res, next) {
  cf.callBankCard(req.body.url).then(data => {
    console.log(data);
    if(data.error != undefined) {
      data.result = {address: '',id_number: '',name: '',people: '',sex: ''};
    }
    res.send(data);
  });
});




/* ======================== *\
          tuso API
\* ======================== */
//  get tuso groups
router.get('/tusogetgroup', function(req, res, next) {
  tuso.getGroup().then(e => {
    res.send(e);
  });
});

//  create new tuso groups
router.get('/tusonewgroup', function(req, res, next) {
  tuso.newGroup(req.query.name).then(e => {
    res.send(e);
  });
});

//  get tuso group's images
router.get('/tusogetgroupimgs', function(req, res, next) {
  tuso.getGroupImgs(req.query.name).then(e => {
    res.send(e);
  });
});

//  add image into group
router.post('/tusoaddimgs', function(req, res, next) {
  tuso.addImages(req.body.id, req.body.data).then(e => {
    res.send(e);
  });
});

//  search image from tuso group
router.post('/tusosearchimgs', function(req, res, next) {
  tuso.searchImages(req.body.data).then(e => {
    res.send(e);
  });
});

//  remove tuso group
router.get('/tusoremovegroup', function(req, res, next) {
  tuso.removeGroup(req.query.id).then(e => {
    res.send(e);
  });
});

//  remove tuso image
router.get('/tusoremoveimage', function(req, res, next) {
  tuso.removeImages(req.query.id, req.query.img).then(e => {
    res.send(e);
  });
});

module.exports = router;
