const Pool = require('pg').Pool;
const config = require('../config');
const pool = new Pool(config.local.db);

const genel = (request, response) => {
    const { userid, tarih, saat, dugunSozu, dipNot, title, desc } = request.body;

    pool.query('SELECT * FROM genel WHERE userid = $1', [userid], (error, results) => {
        if (error) throw error;
        if (results.rowCount == 0) {
            if (!dipNot) {
                pool.query('INSERT INTO "genel" ("userid", "tarih", "saat", "dugunSozu", "title", "desc") VALUES ($1, $2, $3, $4, $5, $6)', [userid, tarih, saat, dugunSozu, title, desc], (error, results) => {
                    if (error) throw error;
                    else {
                        response.send({
                            "status": 201,
                            "msg": "Genel bilgiler kayıt edildi."
                        })
                    }
                })
            }
            else {
                pool.query('INSERT INTO "genel" ("userid", "dipnot") VALUES ($1, $2)', [userid, dipNot], (error, results) => {
                    if (error) throw error;
                    else {
                        response.send({
                            "status": 201,
                            "msg": "Genel bilgiler kayıt edildi."
                        })
                    }
                })
            }
        }
        if (results.rowCount == 1) {
            console.log(dipNot)
            if (!dipNot) {
                pool.query('UPDATE "genel" SET "tarih" = $1, "saat" = $2, "dugunSozu" = $3, "title" = $4, "desc" = $5 WHERE "userid" = $6 ', [tarih, saat, dugunSozu, title, desc, userid], (error, results) => {
                    if (error) throw error;
                    else {
                        response.send({
                            "status": 201,
                            "msg": "Genel bilgiler güncellendi."
                        })
                    }
                })
            }
            else {
                pool.query('UPDATE "genel" SET "dipnot" = $1 WHERE "userid" = $2 ', [dipNot, userid], (error, results) => {
                    if (error) throw error;
                    else {
                        response.send({
                            "status": 201,
                            "msg": "Genel bilgiler güncellendi."
                        })
                    }
                })
            }
        }
    })
}

module.exports = {
    genel
}