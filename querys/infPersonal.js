const Pool = require('pg').Pool;
const config = require('../config');
const pool = new Pool(config.local.db);

var multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/users');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + '-' + file.originalname);
  }
});


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
                  cb(null, 'uploads/users/' + username);
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
              pool.query('INSERT INTO bilgi (gelinAdi, damatAdi, gelinBio, damatBio, gelinFoto, damatFoto) VALUES ($1, $2, $3, $4, $5, $6)', [gelinAdi, damatAdi, gelinBio, damatBio, gelinFoto, damatFoto], (error, result) => {
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


module.exports = {
  // upload,
  kisiselBilgiler,
}