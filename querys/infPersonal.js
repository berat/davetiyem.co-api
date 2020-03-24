const Pool = require('pg').Pool
const config = require('../config')
const pool = new Pool(config.local.db)

var multer = require('multer')
const fs = require('fs')

const kisiselBilgiler = (request, response) => {
  const { gelinAdi, gelinBio, damatAdi, damatBio, userid } = request.body
  pool.query(
    'SELECT * FROM bilgi WHERE userid = $1',
    [userid],
    (error, results) => {
      if (error) {
        throw error
      }
      if (results.rowCount == 1) {
        pool.query(
          'SELECT * from users Where userid = $1',
          [userid],
          (error, results) => {
            if (error) {
              throw error
            } else {
              pool.query(
                'UPDATE "bilgi" SET "gelinAdi" = $1, "damatAdi" = $2, "gelinBio" = $3, "damatBio" = $4 WHERE "userid" = $5',
                [gelinAdi, damatAdi, gelinBio, damatBio, userid],
                (error, result) => {
                  if (error) throw error
                  response.send({
                    status: 201,
                    msg: 'kişisel bilgileriniz güncellendi'
                  })
                }
              )
            }
            response.send({
              status: 404,
              msg: 'Bilgiler güncellenemedi'
            })
          }
        )
      } else if (results.rowCount == 0) {
        pool.query(
          'SELECT * from users WHERE userid = $1',
          [userid],
          (error, results) => {
            if (error) {
              throw error
            } else {
              pool.query(
                'INSERT INTO bilgi (userid, gelinAdi, damatAdi, gelinBio, damatBio) VALUES ($1, $2, $3, $4)',
                [userid, gelinAdi, damatAdi, gelinBio, damatBio],
                (error, result) => {
                  if (error) throw error
                  response.send({
                    status: 201,
                    msg: 'kişisel bilgileriniz oluştu'
                  })
                }
              )
            }
            response.send({
              status: 404,
              msg: 'Bilgiler kayıt edilemedi'
            })
          }
        )
      }
      response.send({
        status: 404,
        msg: 'Site admini ile iletişime geçin.'
      })
    }
  )
}

const gelinFotoYukle = (request, response) => {
  const userid = request.params.hash

  pool.query(
    'SELECT * FROM "bilgi" WHERE "userid" = $1',
    [userid],
    (error, results) => {
      if (error) {
        throw error
      }
      if (results.rowCount == 1) {
        pool.query(
          'SELECT * from users Where userid = $1',
          [userid],
          (error, results) => {
            if (error) {
              throw error
            } else {
              const username = results.rows.map(item => item.username)[0]
              const upload = multer({
                storage: multer.diskStorage({
                  destination: function(req, file, cb) {
                    cb(
                      null,
                      config.local.folders.uploadFolder +
                        '/' +
                        username +
                        '/profil'
                    )
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
              }).fields([
                {
                  name: 'gelinFoto',
                  maxCount: 1
                }
              ])

              upload(request, response, function(err) {
                if (err) {
                  console.log(err)
                } else if (!err) {
                  const gelinFoto = request.files.gelinFoto[0].filename
                  pool.query(
                    'UPDATE "bilgi" SET "gelinFoto" = $1 WHERE "userid" = $2',
                    [gelinFoto, userid],
                    (error, result) => {
                      if (error) throw error
                      else {
                        response.send({
                          status: 201,
                          msg: 'Gelin Fotoğrafı Yüklendi',
                          data: request.files.gelinFoto[0]
                        })
                      }
                    }
                  )
                } else {
                  response.send({
                    status: 404,
                    msg: 'resim yüklenmedi'
                  })
                }
              })
            }
          }
        )
      } else if (results.rowCount == 0) {
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
                    cb(
                      null,
                      config.local.folders.uploadFolder +
                        '/' +
                        username +
                        '/profil'
                    )
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
              }).fields([
                {
                  name: 'gelinFoto',
                  maxCount: 1
                }
              ])

              upload(request, response, function(err) {
                if (err) {
                  console.log(err)
                } else {
                  const gelinFoto = request.files.gelinFoto[0].filename
                  pool.query(
                    'INSERT INTO bilgi ("userid","gelinFoto") VALUES ($1, $2)',
                    [userid, gelinFoto],
                    (error, result) => {
                      if (error) throw error
                      else {
                        response.send({
                          status: 201,
                          msg: 'Gelin Fotoğrafı Yüklendi',
                          data: response
                        })
                      }
                    }
                  )
                }
                response.send({
                  status: 404,
                  msg: 'resim yüklenmedi'
                })
              })
            }
          }
        )
      }
    }
  )
}

const damatFotoYukle = (request, response) => {
  const userid = request.params.hash

  pool.query(
    'SELECT * FROM "bilgi" WHERE "userid" = $1',
    [userid],
    (error, results) => {
      if (error) {
        throw error
      }
      if (results.rowCount == 1) {
        pool.query(
          'SELECT * from users Where userid = $1',
          [userid],
          (error, results) => {
            if (error) {
              throw error
            } else {
              const username = results.rows.map(item => item.username)[0]
              const upload = multer({
                storage: multer.diskStorage({
                  destination: function(req, file, cb) {
                    cb(
                      null,
                      config.local.folders.uploadFolder +
                        '/' +
                        username +
                        '/profil'
                    )
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
              }).fields([
                {
                  name: 'damatFoto',
                  maxCount: 1
                }
              ])

              upload(request, response, function(err) {
                if (err) {
                  console.log(err)
                } else if (!err) {
                  const damatFoto = request.files.damatFoto[0].filename
                  pool.query(
                    'UPDATE "bilgi" SET "damatFoto" = $1 WHERE "userid" = $2',
                    [damatFoto, userid],
                    (error, result) => {
                      if (error) throw error
                      else {
                        response.send({
                          status: 201,
                          msg: 'Damat Fotoğrafı Yüklendi',
                          data: response
                        })
                      }
                    }
                  )
                } else {
                  response.send({
                    status: 404,
                    msg: 'resim yüklenmedi'
                  })
                }
              })
            }
          }
        )
      } else if (results.rowCount == 0) {
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
                    cb(
                      null,
                      config.local.folders.uploadFolder +
                        '/' +
                        username +
                        '/profil'
                    )
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
              }).fields([
                {
                  name: 'damatFoto',
                  maxCount: 1
                }
              ])

              upload(request, response, function(err) {
                if (err) {
                  console.log(err)
                } else {
                  const damatFoto = request.files.damatFoto[0].filename
                  pool.query(
                    'INSERT INTO bilgi ("userid","damatFoto") VALUES ($1, $2)',
                    [userid, gelinFoto],
                    (error, result) => {
                      if (error) throw error
                      else {
                        response.send({
                          status: 201,
                          msg: 'Damat Fotoğrafı Yüklendi',
                          data: response
                        })
                      }
                    }
                  )
                }
                response.send({
                  status: 404,
                  msg: 'resim yüklenmedi'
                })
              })
            }
          }
        )
      }
    }
  )
}

const kisiselFotoKaldir = (request, response) => {
  const { fieldName, userid, fileName } = request.body

  pool.query(
    'UPDATE bilgi SET "' + fieldName + '" = NULL WHERE "userid" = $1',
    [userid],
    (error, results) => {
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
            fs.unlink(
              config.local.folders.uploadFolder +
                '/' +
                username +
                '/profil/' +
                fileName,
              error => {
                if (error) throw error
                response.send({
                  status: 201,
                  msg: `${fieldName} başarılı bir şekilde silindi`
                })
              }
            )
          }
        }
      )
    }
  )
}

const bilgiCek = (request, response) => {
  const userid = request.params.id
  pool.query(
    'SELECT * FROM "bilgi" WHERE "userid" = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      pool.query(
        'SELECT * FROM "users" WHERE "userid" = $1 ',
        [userid],
        (error, result) => {
          if (error) throw error
          else {
            if (results.rowCount == 1) {
              response.send({
                status: 201,
                username: result.rows.map(item => item.username)[0],
                data: results.rows
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
  )
}

const fotoSil = (request, response) => {
  const { who, userid } = request.body

  pool.query(
    `UPDATE "bilgi" SET "${who}" = null WHERE "userid" = ${userid}`,
    (error, results) => {
      if (error) throw error
      else if (results.rowCount == 1) {
        response.send({
          status: 201,
          msg: 'Fotoğaf kaldırıldı.'
        })
      } else {
        response.send({
          status: 201,
          msg: 'Fotoğraf kaldıralamadı. Site admini ile iletişime geçin.'
        })
      }
    }
  )
}

module.exports = {
  gelinFotoYukle,
  damatFotoYukle,
  fotoSil,
  bilgiCek,
  kisiselBilgiler,
  kisiselFotoKaldir
}
