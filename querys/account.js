const Pool = require('pg').Pool;
const config = require('../config');
const pool = new Pool(config.local.db);

var unixcrypt = require("unixcrypt")
var fs = require("fs");

const hesapBilgileri = (request, response) => {
    const { userid, kullaniciAdi, sifre, mail } = request.body;
    const passwordHashed = unixcrypt.encrypt(password, "$5$rounds=535000")

    pool.query('SELECT * FROM "users" WHERE "userid" = $1', [userid], (error, results) => {
        if (error) throw error;
        else {
            const username = (results.rows.map(item => item.username))[0];
            if (sifre) {
                pool.query('UPDATE "users" SET "password" = $1, "username" = $2, "mail" = $3, WHERE "userid" = $4', [passwordHashed, kullaniciAdi, mail], (error, results) => {
                    if (error) throw error;
                    else {
                        fs.renameSync(`${config.local.folders.baseUSer}/${username}`, `${config.local.folders.baseUSer}/${kullaniciAdi}`)
                        fs.renameSync(`${config.local.folders.uploadFolder}/${username}`, `${config.local.folders.uploadFolder}/${kullaniciAdi}`)
                        response.send({
                            "status": 201,
                            "msg": "Hesap bilgileriniz başarılı bir şekilde güncellendi."
                        })
                    }
                })
            }
            else {
                pool.query('UPDATE "users" SET "username" = $1, "mail" = $2, WHERE "userid" = $3', [kullaniciAdi, mail], (error, results) => {
                    if (error) throw error;
                    else {
                        fs.renameSync(`${config.local.folders.baseUSer}/${username}`, `${config.local.folders.baseUSer}/${kullaniciAdi}`)
                        fs.renameSync(`${config.local.folders.uploadFolder}/${username}`, `${config.local.folders.uploadFolder}/${kullaniciAdi}`)
                        response.send({
                            "status": 201,
                            "msg": "Hesap bilgileriniz başarılı bir şekilde güncellendi."
                        })
                    }
                })
            }
        }
    })
}

module.exports = {
    hesapBilgileri,
}