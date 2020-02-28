const Pool = require('pg').Pool;
const config = require('../config');
const pool = new Pool(config.local.db);

var multer = require('multer');
const fs = require("fs");

const kisiselBilgiler = (request, response) => {
  const { gelinAdi, gelinBio, damatAdi, damatBio, userid } = request.body;

  pool.query('SELECT * FROM bilgi WHERE userid = $1', [userid], (error, results) => {
    if (error) {
      throw error
    }
    if (results.rowCount == 1) {
      pool.query('SELECT * from users Where userid = $1', [userid], (error, results) => {
        if (error) {
          throw error
        }
        else {
          const username = (results.rows.map(item => item.username))[0]
          console.log(username);
          const upload = multer({
            storage:
              multer.diskStorage({
                destination: function (req, file, cb) {
                  cb(null, config.local.folders.uploadFolder + '/' + username + '/profil');
                },
                filename: function (req, file, cb) {
                  cb(null, new Date().getTime() + '-' + file.originalname);
                }
              })
          }).fields([
            {
              name: 'gelinFoto',
              maxCount: 1
            },
            {
              name: 'damatFoto',
              maxCount: 1
            }]);

          upload(request, response, function (err) {
            if (err) {
              console.log(err)
            }
            else {
              const damatFoto = request.files.damatFoto[0].filename;
              const gelinFoto = request.files.gelinFoto[0].filename;
              pool.query('UPDATE "bilgi" SET "gelinAdi" = $1, "damatAdi" = $2, "gelinBio" = $3, "damatBio" = $4, "gelinFoto"= $5, "damatFoto" = $6 WHERE "userid" = $7', [gelinAdi, damatAdi, gelinBio, damatBio, gelinFoto, damatFoto, userid], (error, result) => {
                if (error) throw error
                else {
                  response.send({
                    "status": 201,
                    "msg": "kişisel bilgileriniz güncellendi"
                  })
                }
              })
            }
            response.send({
              "status": 404,
              "msg": "resim yüklenmedi"
            })
          })
        }

      })
    }
    else if (results.rowCount == 0) {
      pool.query('SELECT * from users WHERE userid = $1', [userid], (error, results) => {
        if (error) {
          throw error
        }
        else {
          const username = (results.rows.map(item => item.username))[0]
          console.log(username);
          const upload = multer({
            storage:
              multer.diskStorage({
                destination: function (req, file, cb) {
                  cb(null, config.local.folders.uploadFolder + '/' + username + '/profil');
                },
                filename: function (req, file, cb) {
                  cb(null, new Date().getTime() + '-' + file.originalname);
                }
              })
          }).fields([
            {
              name: 'gelinFoto',
              maxCount: 1
            },
            {
              name: 'damatFoto',
              maxCount: 1
            }]);

          upload(request, response, function (err) {
            if (err) {
              console.log(err)
            }
            else {
              const damatFoto = request.files.damatFoto[0].filename;
              const gelinFoto = request.files.gelinFoto[0].filename;
              pool.query('INSERT INTO bilgi (userid, gelinAdi, damatAdi, gelinBio, damatBio, gelinFoto, damatFoto) VALUES ($1, $2, $3, $4, $5, $6)', [userid, gelinAdi, damatAdi, gelinBio, damatBio, gelinFoto, damatFoto], (error, result) => {
                if (error) throw error
                else {
                  response.send({
                    "status": 201,
                    "msg": "kişisel bilgileriniz oluştu"
                  })
                }
              })
            }
            response.send({
              "status": 404,
              "msg": "resim yüklenmedi"
            })
          })
        }

      })
    }

  })
}

const kisiselFotoKaldir = (request, response) => {
  const { fieldName, userid, fileName } = request.body;

  pool.query('UPDATE bilgi SET "' + fieldName + '" = NULL WHERE "userid" = $1', [userid], (error, results) => {
    if (error) {
      throw error
    }
    fs.unlink(config.local.folders.uploadFolder + '/' + fileName, (error) => {
      if (error)
        throw error;
      response.send({
        "status": 201,
        "msg": `${fieldName} başarılı bir şekilde silindi`
      })
    });
  }
  )
}

module.exports = {
  kisiselBilgiler,
  kisiselFotoKaldir,
}