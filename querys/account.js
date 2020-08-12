const Pool = require('pg').Pool
const config = require('./config')
const pool = new Pool(config.local.db)

var unixcrypt = require('unixcrypt')
var fs = require('fs')
const jwt = require('jsonwebtoken')


const hesap = (request, response) => {
  const hash = request.params.id
  const userid = jwt.verify(hash, config.jwtSecret).userid

  pool.query(
    'SELECT * FROM "users" WHERE "userid" = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      response.send({
        status: 201,
        username: results.rows[0].username,
        mail: results.rows[0].email
      })
    }
  )
}

const hesapBilgileri = (request, response) => {
  const { userid, kullaniciAdi, sifre, mail } = request.body
  const passwordHashed = unixcrypt.encrypt(sifre, '$5$rounds=535000')

  pool.query(
    'SELECT * FROM "users" WHERE "userid" = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      else {
        var username = results.rows.map(item => item.username)[0]
        var kullaniciID = results.rows.map(item => item.userid)[0]
        pool.query(
          'SELECT * FROM "users" WHERE username = $1 or email = $2',
          [kullaniciAdi, mail],
          (error, results) => {
            if (error) throw error
            if (
              results.rowCount == 0 ||
              (results.rowCount == 1 && results.rows[0].userid == kullaniciID)
            ) {
              if (sifre) {
                pool.query(
                  'UPDATE "users" SET "password"=$1, "username"=$2, "email"=$3 WHERE "userid"=$4',
                  [passwordHashed, kullaniciAdi, mail, userid],
                  (error, results) => {
                    if (error) throw error
                    else {
                      fs.renameSync(
                        `${config.local.folders.baseUSer}/${username}`,
                        `${config.local.folders.baseUSer}/${kullaniciAdi}`
                      )
                      fs.renameSync(
                        `${config.local.folders.uploadFolder}/${username}`,
                        `${config.local.folders.uploadFolder}/${kullaniciAdi}`
                      )
                      response.send({
                        status: 201,
                        msg:
                          'Hesap bilgileriniz başarılı bir şekilde güncellendi.'
                      })
                    }
                  }
                )
              } else {
                pool.query(
                  'UPDATE "users" SET "username"=$1, "email"=$2 WHERE "userid"=$3',
                  [kullaniciAdi, mail, userid],
                  (error, results) => {
                    if (error) throw error
                    else {
                      fs.renameSync(
                        `${config.local.folders.baseUSer}/${username}`,
                        `${config.local.folders.baseUSer}/${kullaniciAdi}`
                      )
                      fs.renameSync(
                        `${config.local.folders.uploadFolder}/${username}`,
                        `${config.local.folders.uploadFolder}/${kullaniciAdi}`
                      )
                      response.send({
                        status: 201,
                        msg:
                          'Hesap bilgileriniz başarılı bir şekilde güncellendi.'
                      })
                    }
                  }
                )
              }
            } else {
              response.send({
                status: 404,
                msg: 'Farklı şeyler deneyin.'
              })
            }
          }
        )
      }
    }
  )
}

module.exports = {
  hesapBilgileri,
  hesap
}
