'use strict';

var Pool = require('pg').Pool;
var config = require('./config');
var pool = new Pool(config.local.db);

var multer = require('multer');
var fs = require('fs');

var kisiselBilgiler = function kisiselBilgiler(request, response) {
  var _request$body = request.body,
      gelinAdi = _request$body.gelinAdi,
      gelinBio = _request$body.gelinBio,
      damatAdi = _request$body.damatAdi,
      damatBio = _request$body.damatBio,
      userid = _request$body.userid;


  pool.query('SELECT * FROM bilgi WHERE userid = $1', [userid], function (error, results) {
    if (error) {
      throw error;
    }
    if (results.rowCount == 1) {
      pool.query('UPDATE "bilgi" SET "gelinAdi" = $1, "damatAdi" = $2, "gelinBio" = $3, "damatBio" = $4 WHERE "userid" = $5', [gelinAdi, damatAdi, gelinBio, damatBio, userid], function (error, results) {
        if (error) {
          throw error;
        }
      });
      response.send({
        status: 201,
        msg: 'kişisel bilgileriniz güncellendi'
      });
    } else if (results.rowCount == 0) {
      pool.query('INSERT INTO bilgi ("userid", "gelinAdi", "damatAdi", "gelinBio", "damatBio") VALUES ($1, $2, $3, $4, $5)', [userid, gelinAdi, damatAdi, gelinBio, damatBio], function (error, results) {
        if (error) {
          throw error;
        }
      });
      response.send({
        status: 201,
        msg: 'kişisel bilgileriniz oluştu'
      });
    }
  });
};

var gelinFotoYukle = function gelinFotoYukle(request, response) {
  var userid = request.params.hash;

  pool.query('SELECT * FROM "bilgi" WHERE "userid" = $1', [userid], function (error, results) {
    if (error) {
      throw error;
    }
    if (results.rowCount == 1) {
      pool.query('SELECT * from users Where userid = $1', [userid], function (error, results) {
        if (error) {
          throw error;
        } else {
          var username = results.rows.map(function (item) {
            return item.username;
          })[0];
          var upload = multer({
            storage: multer.diskStorage({
              destination: function destination(req, file, cb) {
                cb(null, config.local.folders.uploadFolder + '/' + username + '/profil');
              },
              filename: function filename(req, file, cb) {
                cb(null, new Date().getTime() + '-' + file.originalname.replace(/ /g, '-'));
              }
            })
          }).fields([{
            name: 'gelinFoto',
            maxCount: 1
          }]);

          upload(request, response, function (err) {
            if (err) {
              console.log(err);
            } else if (!err) {
              var gelinFoto = request.files.gelinFoto[0].filename;
              pool.query('UPDATE "bilgi" SET "gelinFoto" = $1 WHERE "userid" = $2', [gelinFoto, userid], function (error, result) {
                if (error) throw error;else {
                  response.send({
                    status: 201,
                    msg: 'Gelin Fotoğrafı Yüklendi',
                    data: request.files.gelinFoto[0]
                  });
                }
              });
            } else {
              response.send({
                status: 404,
                msg: 'resim yüklenmedi'
              });
            }
          });
        }
      });
    } else if (results.rowCount == 0) {
      pool.query('SELECT * from users WHERE userid = $1', [userid], function (error, results) {
        if (error) {
          throw error;
        } else {
          var username = results.rows.map(function (item) {
            return item.username;
          })[0];
          var upload = multer({
            storage: multer.diskStorage({
              destination: function destination(req, file, cb) {
                cb(null, config.local.folders.uploadFolder + '/' + username + '/profil');
              },
              filename: function filename(req, file, cb) {
                cb(null, new Date().getTime() + '-' + file.originalname.replace(/ /g, '-'));
              }
            })
          }).fields([{
            name: 'gelinFoto',
            maxCount: 1
          }]);

          upload(request, response, function (err) {
            if (err) {
              console.log(err);
            } else {
              var gelinFoto = request.files.gelinFoto[0].filename;
              pool.query('INSERT INTO bilgi ("userid","gelinFoto") VALUES ($1, $2)', [userid, gelinFoto], function (error, result) {
                if (error) throw error;else {
                  response.send({
                    status: 201,
                    msg: 'Gelin Fotoğrafı Yüklendi',
                    data: request.files.gelinFoto[0]
                  });
                }
              });
            }
            response.send({
              status: 404,
              msg: 'resim yüklenmedi'
            });
          });
        }
      });
    }
  });
};

var damatFotoYukle = function damatFotoYukle(request, response) {
  var userid = request.params.hash;
  pool.query('SELECT * FROM "bilgi" WHERE "userid" = $1', [userid], function (error, results) {
    if (error) {
      throw error;
    }
    if (results.rowCount == 1) {
      pool.query('SELECT * from users Where userid = $1', [userid], function (error, results) {
        if (error) {
          throw error;
        } else {
          var username = results.rows.map(function (item) {
            return item.username;
          })[0];
          var upload = multer({
            storage: multer.diskStorage({
              destination: function destination(req, file, cb) {
                cb(null, config.local.folders.uploadFolder + '/' + username + '/profil');
              },
              filename: function filename(req, file, cb) {
                cb(null, new Date().getTime() + '-' + file.originalname.replace(/ /g, '-'));
              }
            })
          }).fields([{
            name: 'damatFoto',
            maxCount: 1
          }]);

          upload(request, response, function (err) {
            if (err) {
              console.log(err);
            } else if (!err) {
              var damatFoto = request.files.damatFoto[0].filename;
              pool.query('UPDATE "bilgi" SET "damatFoto" = $1 WHERE "userid" = $2', [damatFoto, userid], function (error, result) {
                if (error) throw error;else {
                  response.send({
                    status: 201,
                    msg: 'Damat Fotoğrafı Yüklendi',
                    data: request.files.damatFoto[0]
                  });
                }
              });
            } else {
              response.send({
                status: 404,
                msg: 'resim yüklenmedi'
              });
            }
          });
        }
      });
    } else if (results.rowCount == 0) {
      pool.query('SELECT * from users WHERE userid = $1', [userid], function (error, results) {
        if (error) {
          throw error;
        } else {
          var username = results.rows.map(function (item) {
            return item.username;
          })[0];
          var upload = multer({
            storage: multer.diskStorage({
              destination: function destination(req, file, cb) {
                cb(null, config.local.folders.uploadFolder + '/' + username + '/profil');
              },
              filename: function filename(req, file, cb) {
                cb(null, new Date().getTime() + '-' + file.originalname.replace(/ /g, '-'));
              }
            })
          }).fields([{
            name: 'damatFoto',
            maxCount: 1
          }]);

          upload(request, response, function (err) {
            if (err) {
              console.log(err);
            } else {
              var damatFoto = request.files.damatFoto[0].filename;
              pool.query('INSERT INTO bilgi ("userid","damatFoto") VALUES ($1, $2)', [userid, damatFoto], function (error, result) {
                if (error) throw error;else {
                  response.send({
                    status: 201,
                    msg: 'Damat Fotoğrafı Yüklendi',
                    data: request.files.damatFoto[0]
                  });
                }
              });
            }
            response.send({
              status: 404,
              msg: 'resim yüklenmedi'
            });
          });
        }
      });
    }
  });
};

var kisiselFotoKaldir = function kisiselFotoKaldir(request, response) {
  var _request$body2 = request.body,
      fieldName = _request$body2.fieldName,
      userid = _request$body2.userid,
      fileName = _request$body2.fileName;


  pool.query('UPDATE bilgi SET "' + fieldName + '" = NULL WHERE "userid" = $1', [userid], function (error, results) {
    if (error) {
      throw error;
    }
    pool.query('SELECT * from users WHERE userid = $1', [userid], function (error, results) {
      if (error) {
        throw error;
      } else {
        var username = results.rows.map(function (item) {
          return item.username;
        })[0];
        fs.unlink(config.local.folders.uploadFolder + '/' + username + '/profil/' + fileName, function (error) {
          if (error) throw error;
          response.send({
            status: 201,
            msg: fieldName + ' ba\u015Far\u0131l\u0131 bir \u015Fekilde silindi'
          });
        });
      }
    });
  });
};

var bilgiCek = function bilgiCek(request, response) {
  var userid = request.params.id;
  pool.query('SELECT * FROM "bilgi" WHERE "userid" = $1', [userid], function (error, results) {
    if (error) throw error;
    pool.query('SELECT * FROM "users" WHERE "userid" = $1 ', [userid], function (error, result) {
      if (error) throw error;else {
        if (results.rowCount == 1) {
          response.send({
            status: 201,
            username: result.rows.map(function (item) {
              return item.username;
            })[0],
            data: results.rows
          });
        } else {
          response.send({
            status: 404,
            msg: 'Site admini ile iletişime geçin.'
          });
        }
      }
    });
  });
};

var fotoSil = function fotoSil(request, response) {
  var _request$body3 = request.body,
      who = _request$body3.who,
      userid = _request$body3.userid;


  pool.query('UPDATE "bilgi" SET "' + who + '" = null WHERE "userid" = ' + userid, function (error, results) {
    if (error) throw error;else if (results.rowCount == 1) {
      response.send({
        status: 201,
        msg: 'Fotoğaf kaldırıldı.'
      });
    } else {
      response.send({
        status: 201,
        msg: 'Fotoğraf kaldıralamadı. Site admini ile iletişime geçin.'
      });
    }
  });
};

module.exports = {
  gelinFotoYukle: gelinFotoYukle,
  damatFotoYukle: damatFotoYukle,
  fotoSil: fotoSil,
  bilgiCek: bilgiCek,
  kisiselBilgiler: kisiselBilgiler,
  kisiselFotoKaldir: kisiselFotoKaldir
};