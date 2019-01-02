const getURLInfo = require('./model/getURLInfo');
const GETIP = require('./model/getip');
const qiniu = require('qiniu');

let gb = new getURLInfo();
let gi = new GETIP();
let reqURL = "http://10.34.43.45:16301/admin/domain/oquqvdmso.bkt.clouddn.com";

// let q = new Promise(function(resolve, reject){
//     gb.getBucketInfo(reqURL).then(ip => {
//         gi.getZone(ip).then(zone => {
//             console.log(zone);
//             resolve(zone);
//         }).catch(err => {
//             console.log(err);
//         });
//     }).catch(err => {
//         console.log(err);
//     });
// });

// q.then(e => {
//     console.log(e);
// });

let p = gb.getIPInfo('ava-test', 'atflow-log-proxy/images/terror-classify-2018-04-30T07-51-19-NSXjmunZFVlzLtnlC1XDTQ==', '1381102889');
p.then(e => {
    console.log(e);
})