const Pool = require('pg').Pool;
const config = require('../config');
const pool = new Pool(config.local.db);

var multer = require('multer');
const fs = require("fs");

const galeriYukle = (request, response) => {
    const { userid } = request.body;

    pool.query('SELECT * FROM bilgi WHERE userid = 24', (error, results) => {
        if (error) {
            throw error
        }
        if (results.rowCount >= 0 && results.rowCount <= 8) {
            pool.query('SELECT * from users WHERE userid = 24', (error, results) => {
                if (error) {
                    throw error
                }
                else {
                    const username = (results.rows.map(item => item.username))[0]
                    const upload = multer({
                        storage:
                            multer.diskStorage({
                                destination: function (req, file, cb) {
                                    cb(null, config.local.folders.uploadFolder + '/' + username);
                                },
                                filename: function (req, file, cb) {
                                    cb(null, new Date().getTime() + '-' + file.originalname);
                                }
                            })
                    }).array("album", 8)
                    upload(request, response, function (err) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            var sayac = 0;
                            var i = 0;
                            do {
                                pool.query('INSERT INTO foto (userid, foto) VALUES ($1, $2)', [userid, request.files[i].filename])
                                i++;
                                sayac += 1;
                            }
                            while (i < request.files.length);
                            if (sayac == request.files.length) {
                                response.send({
                                    'status': 201,
                                    'msg': "resimler yüklendi"
                                })
                            }
                        }
                    })
                }
            })
        }
        else {
            response.send({
                "status": 404,
                "msg": "Fazla resim yüklendi"
            })
        }
    })


}

module.exports = {
    galeriYukle,
}