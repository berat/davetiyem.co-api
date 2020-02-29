const Pool = require('pg').Pool;
const config = require('../config');
const pool = new Pool(config.local.db);

const dugunBilgileri = (request, response) => {
    const { userid, baslik, tarih, adres, iframe } = request.body;
    pool.query('SELECT * FROM dugun WHERE userid = $1', [userid], (error, results) => {
        if (error) {
            throw error
        }
        else {
            pool.query('INSERT INTO "dugun" (userid, dbaslik, dtarih, dadres, diframe) VALUES ($1, $2, $3, $4, $5)', [userid, baslik, tarih, adres, iframe], (error, results) => {
                if (error) throw error
                response.send({
                    "status": 201,
                    "msg": "Düğün bilgileriniz kayıt edildi."
                })
            })
        }
    })
}

const guncelleDugun = (request, response) => {
    const { userid, baslik, tarih, adres, iframe } = request.body;
    pool.query('SELECT * FROM dugun WHERE userid = $1', [userid], (error, results) => {
        if (error) {
            throw error
        }
        else {
            pool.query('UPDATE dugun SET dbaslik = $1, dtarih = $2, dadres = $3, diframe = $4 WHERE dbaslik = $5 ', [baslik, tarih, adres, iframe, baslik], (error, results) => {
                if (error) throw error
                response.send({
                    "status": 201,
                    "msg": "Düğün bilgileriniz güncellendi."
                })
            })
        }
    })
}

module.exports = {
    guncelleDugun,
    dugunBilgileri,
}