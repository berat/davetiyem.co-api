const Pool = require('pg').Pool
const config = require('./config')
const pool = new Pool(config.local.db)
const jwt = require('jsonwebtoken')

const dugunBilgileri = (request, response) => {
  const { userid } = request.body[0]
  pool.query(
    'SELECT * FROM dugun WHERE userid = $1',
    [userid],
    (error, results) => {
      if (error) {
        throw error
      } else if (results.rowCount == 0) {
        var i = 0
        do {
          const { baslik, tarih, adres, iframe } = request.body[i]
          pool.query(
            'INSERT INTO "dugun" (userid, dbaslik, dtarih, dadres, diframe) VALUES ($1, $2, $3, $4, $5)',
            [userid, baslik, tarih, adres, iframe],
            (error, results) => {
              if (error) throw error
            }
          )
          i++
        } while (i < request.body.length)
        if (i == 2) {
          response.send({
            status: 201,
            msg: 'Düğün bilgileriniz kayıt edildi.'
          })
        } else {
          response.send({
            status: 404,
            msg: 'Site admini ile iletişime geçin.'
          })
        }
      } else {
        pool.query(
          'DELETE FROM "dugun" WHERE userid= $1',
          [userid],
          (error, results) => {
            if (error) throw error
            else {
              i = 0
              do {
                const { baslik, tarih, adres, iframe } = request.body[i]
                pool.query(
                  'INSERT INTO "dugun" (userid, dbaslik, dtarih, dadres, diframe) VALUES ($1, $2, $3, $4, $5)',
                  [userid, baslik, tarih, adres, iframe],
                  (error, results) => {
                    if (error) throw error
                  }
                )
                i++
              } while (i < request.body.length)
              if (i == 2) {
                response.send({
                  status: 201,
                  msg: 'Düğün bilgileriniz güncellendi.'
                })
              } else {
                response.send({
                  status: 404,
                  msg: 'Site admini ile iletişime geçin.'
                })
              }
            }
          }
        )
      }
    }
  )
}

const getDugun = (request, response) => {
  const hash = request.params.id
  const userid = jwt.verify(hash, config.jwtSecret).userid

  pool.query(
    'SELECT * FROM dugun WHERE userid = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      else if (results.rowCount != 0) {
        response.send({
          status: 201,
          data: results.rows
        })
      } else {
        response.send({
          status: 404,
          msg: 'Herhangi bir kayıt bulanamadı.'
        })
      }
    }
  )
}

module.exports = {
  getDugun,
  dugunBilgileri
}
