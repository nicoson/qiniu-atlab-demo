//connection to database
const mysql     = require('mysql');
const DBConn    = require('./model/DBConnection');
const Receiver  = require('./model/Datareceiver');


DBConn.createBaseTable('pulp');
DBConn.createBaseTable('terror');
DBConn.createBaseTable('politician');
DBConn.createBaseTable('detection');

let job = {
    pulp: true,
    terror: false,
    politician: true,
    detection: true
}
let rec = new Receiver('./model/');

for(let i=0; i<=0; i++) {
    let start = new Date();
    start.setDate(start.getDate() - i);
    let end = new Date();
    end.setDate(end.getDate() - i);

    if(job.pulp){
        let pulpdata = rec.getData('pulp', new Date(convertDate(start,1)), new Date(convertDate(end,0)));
        pulpdata.then(data => {
            let tmp = '';
            
            if(data.length > 0) {
                let res = DBConn.insertData('pulp', data);
                res.then(e => console.log(data.length + " data inserted into pulp table!!!"));
            } else {
                console.log('no data');
            }
        });
    }

    if(job.terror){
        let terrordata = rec.getData('terror', new Date(convertDate(start,1)), new Date(convertDate(end,0)));
        terrordata.then(data => {
            let tmp = '';
            
            if(data.length > 0) {
                let res = DBConn.insertData('terror', data);
                res.then(e => console.log(data.length + " data inserted into terror table!!!"));
            } else {
                console.log('no data');
            }
        });
    }


    if(job.politician){
        let politiciandata = rec.getData('politician', new Date(convertDate(start,1)), new Date(convertDate(end,0)));
        politiciandata.then(data => {
            let tmp = '';
            
            if(data.length > 0) {
                let res = DBConn.insertData('politician', data);
                res.then(e => console.log(data.length + " data inserted into politician table!!!"));
            } else {
                console.log('no data');
            }
        });
    }

    if(job.detection){
        let detectdata = rec.getData('detection', new Date(convertDate(start,1)), new Date(convertDate(end,0)));
        detectdata.then(data => {
            let tmp = '';
            
            if(data.length > 0) {
                let res = DBConn.insertData('terror', data);
                res.then(e => console.log(e));
                let resdet = DBConn.insertData('detection', data);
                resdet.then(e => console.log(e));
            } else {
                console.log('no data');
            }
        });
    }
}

function convertDate(day,isStart) {
    return `${day.getFullYear()}-${day.getMonth()>8?(day.getMonth()+1):('0'+(day.getMonth()+1))}-${day.getDate()>9?day.getDate():('0'+day.getDate())} ${isStart?'00:00:00':'23:59:59'}`;
}