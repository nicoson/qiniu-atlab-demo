const express   = require('express');
const router    = express.Router();
const callFunc  = require('../model/callFunc');
let cf = new callFunc(false);


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



module.exports = router;
