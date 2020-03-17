const Pool = require('pg').Pool
const config = require('../config')
const pool = new Pool(config.local.db)

var multer = require('multer')
const fs = require('fs')

const getGaleri = (request, response) => {
  const userid = request.params.id

  pool.query(
    'SELECT * FROM "users" WHERE "userid" = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      if (results.rowCount > 0) {
        pool.query(
          'SELECT * FROM foto WHERE userid = $1',
          [userid],
          (error, result) => {
            if (error) throw error
            response.send({
              status: 201,
              username: results.rows.map(item => item.username)[0],
              photos: result.rows
            })
          }
        )
      } else {
        response.send({
          status: 404,
          username: results.rows.map(item => item.username)[0],
          msg: 'Veritabanında kayıt bulunamadı'
        })
      }
    }
  )
}

const galeriYukle = (request, response) => {
  const userid = request.params.id

  pool.query(
    'SELECT * FROM foto WHERE userid = $1',
    [userid],
    (error, results) => {
      if (error) {
        throw error
      }
      if (results.rowCount >= 0 && results.rowCount < 8) {
        pool.query(
          'SELECT * from users WHERE userid = $1',
          [userid],
          (error, results) => {
            if (error) {
              throw error
            } else {
              const username = results.rows.map(item => item.username)[0]
              const upload = multer({
                storage: multer.diskStorage({
                  destination: function(req, file, cb) {
                    cb(null, config.local.folders.uploadFolder + '/' + username)
                  },
                  filename: function(req, file, cb) {
                    cb(
                      null,
                      new Date().getTime() +
                        '-' +
                        file.originalname.replace(/ /g, '-')
                    )
                  }
                })
              }).array('album', 8)
              upload(request, response, function(err) {
                if (err) {
                  console.log(err)
                } else {
                  var fileLists = []
                  console.log(request.files)
                  var sayac = 0
                  var i = 0
                  do {
                    fileLists = [
                      ...fileLists,
                      { filename: request.files[i].path.slice(9) }
                    ]
                    pool.query(
                      'INSERT INTO foto (userid, foto) VALUES ($1, $2)',
                      [userid, request.files[i].filename]
                    )
                    i++
                    sayac += 1
                  } while (i < request.files.length)
                  if (sayac == request.files.length) {
                    response.send({
                      status: 201,
                      filename: fileLists,
                      msg: 'resimler yüklendi'
                    })
                  }
                }
              })
            }
          }
        )
      } else {
        response.send({
          status: 404,
          msg: 'Fazla resim yüklendi'
        })
      }
    }
  )
}

const tekResimSil = (request, response) => {
  const { fotoid, userid } = request.body

  pool.query(
    'SELECT "foto" FROM "foto" WHERE "fotoid" = $1',
    [fotoid],
    (error, results) => {
      const netice = results
      if (error) throw error
      else {
        pool.query(
          'DELETE FROM "foto" WHERE "fotoid"= $1',
          [fotoid],
          (error, result) => {
            if (error) {
              throw error
            }
            pool.query(
              'SELECT * from users WHERE userid = $1',
              [userid],
              (error, results) => {
                if (error) {
                  throw error
                } else {
                  const username = results.rows.map(item => item.username)[0]
                  console.log(netice)
                  fs.unlink(
                    config.local.folders.uploadFolder +
                      '/' +
                      username +
                      '/' +
                      netice.rows[0].foto,
                    error => {
                      if (error) throw error
                      response.send({
                        status: 201,
                        msg: 'Fotoğraf silindi'
                      })
                    }
                  )
                }
              }
            )
          }
        )
      }
    }
  )
}

const topluSil = (request, response) => {
  const { userid } = request.body
  pool.query(
    'SELECT foto FROM foto WHERE userid = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      const netice = results
      pool.query(
        'SELECT * from users WHERE userid = $1',
        [userid],
        (error, results) => {
          if (error) {
            throw error
          } else {
            const username = results.rows.map(item => item.username)[0]
            var i = 0
            do {
              fs.unlink(
                config.local.folders.uploadFolder +
                  '/' +
                  username +
                  '/' +
                  netice.rows[i].foto,
                error => {
                  if (error) throw error
                }
              )
              i++
            } while (i < netice.rowCount)

            pool.query(
              'DELETE FROM "foto" WHERE "userid" = $1 ',
              [userid],
              (error, results) => {
                if (error) throw error
                response.send({
                  status: 201,
                  msg: 'Tüm fotoğraflar silindi. Albüm temizlendi.'
                })
              }
            )
          }
        }
      )
    }
  )
}

module.exports = {
  getGaleri,
  galeriYukle,
  tekResimSil,
  topluSil
}
