const Pool = require('pg').Pool;
const config = require('../config');
const pool = new Pool(config.local.db);

var multer = require('multer');
const fs = require("fs");

const getGaleri = (request, response) => {
    const userid = request.params.id

    pool.query('SELECT * FROM foto WHERE userid = $1', [userid], (error, results) => {
        if(error) throw error
        if(results.rowCount >0){
            response.send({
            status: 201,
            photos: results.rows
        })
    }
        else{
            response.send({
                status: 404,
                msg: "Veritabanında kayıt bulunamadı"
            })
        }
    })
}

const galeriYukle = (request, response) => {
    const { userid } = request.body;

    pool.query('SELECT * FROM foto WHERE userid = $1', [userid], (error, results) => {
        if (error) {
            throw error
        }
        if (results.rowCount >= 0 && results.rowCount <= 8) {
            pool.query('SELECT * from users WHERE userid = $1', [userid], (error, results) => {
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

const tekResimSil = (request, response) => {
    const { resimAdi, userid } = request.body;

    pool.query('DELETE FROM "foto" WHERE "userid" = $1, "foto"= $2', [id, resimAdi], (error, results) => {
        if (error) {
            throw error
        }
        pool.query('SELECT * from users WHERE userid = $1', [userid], (error, results) => {
            if (error) {
                throw error
            }
            else {
                const username = (results.rows.map(item => item.username))[0]
                fs.unlink(config.local.folders.uploadFolder + '/' + username + '/' + fileName, (error) => {
                    if (error)
                        throw error;
                    response.send({
                        "status": 201,
                        "msg": "Fotoğraf silindi"
                    })
                })
            }
        })
    })
}

const topluSil = (request, response) => {
    const { userid } = request.body;
    pool.query('SELECT foto FROM foto WHERE userid = $1', [userid], (error, results) => {
        if (error) throw error;
        const netice = results;
        pool.query('SELECT * from users WHERE userid = $1', [userid], (error, results) => {
            if (error) {
                throw error
            }
            else {
                const username = (results.rows.map(item => item.username))[0]
                var i = 0;
                do {
                    fs.unlink(config.local.folders.uploadFolder + '/' + username + '/' + netice.rows[i].foto, (error) => {
                        if (error)
                            throw error;
                    })
                    i++;
                } while (i < netice.rowCount)

                pool.query('DELETE FROM "foto" WHERE "userid" = $1 ', [userid], (error, results) => {
                    if (error) throw error;
                    response.send({
                        "status": 201,
                        "msg": "Tüm fotoğraflar silindi. Albüm temizlendi."
                    })
                })
            }
        })
    })
}

module.exports = {
    getGaleri,
    galeriYukle,
    tekResimSil,
    topluSil,
}