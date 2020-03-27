'use strict';

var Pool = require('pg').Pool;
var config = require('./config');
var pool = new Pool(config.local.db);

var multer = require('multer');
var fs = require('fs');

var getGaleri = function getGaleri(request, response) {
  var userid = request.params.id;

  pool.query('SELECT * FROM "users" WHERE "userid" = $1', [userid], function (error, results) {
    if (error) throw error;
    if (results.rowCount > 0) {
      pool.query('SELECT * FROM foto WHERE userid = $1', [userid], function (error, result) {
        if (error) throw error;
        response.send({
          status: 201,
          username: results.rows.map(function (item) {
            return item.username;
          })[0],
          photos: result.rows
        });
      });
    } else {
      response.send({
        status: 404,
        username: results.rows.map(function (item) {
          return item.username;
        })[0],
        msg: 'Veritabanında kayıt bulunamadı'
      });
    }
  });
};

var galeriYukle = function galeriYukle(request, response) {
  var userid = request.params.id;

  pool.query('SELECT * FROM foto WHERE userid = $1', [userid], function (error, results) {
    var netice = results;
    if (error) {
      throw error;
    }
    if (results.rowCount >= 0 && results.rowCount < 8) {
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
                cb(null, config.local.folders.uploadFolder + '/' + username);
              },
              filename: function filename(req, file, cb) {
                cb(null, new Date().getTime() + '-' + file.originalname.replace(/ /g, '-'));
              }
            })
          }).array('album', 8);
          upload(request, response, function (err) {
            if (err) {
              console.log(err);
            } else {
              var fileLists = [];
              if (netice.rowCount == 0) {
                for (var j = 0; j < request.files.length; j++) {
                  fileLists[j] = {
                    filename: request.files[j].path.slice(9)
                  };
                }
              } else {
                for (var j = 0; j < netice.rowCount; j++) {
                  fileLists[j] = {
                    filename: config.local.folders.uploadFolder.slice(9) + '/' + username + '/' + netice.rows[j].foto
                  };
                }
              }
              var sayac = 0;
              var i = 0;
              do {
                if (netice.rowCount != 0) {
                  fileLists.push({
                    filename: request.files[i].path.slice(9)
                  });
                }
                pool.query('INSERT INTO foto (userid, foto) VALUES ($1, $2)', [userid, request.files[i].filename]);
                i++;
                sayac += 1;
              } while (i < request.files.length);
              if (sayac == request.files.length) {
                response.send({
                  status: 201,
                  filename: fileLists,
                  msg: 'Resimler yüklendi.'
                });
              }
            }
          });
        }
      });
    } else {
      response.send({
        status: 404,
        msg: 'Fazla resim yüklendi'
      });
    }
  });
};

var tekResimSil = function tekResimSil(request, response) {
  var _request$body = request.body,
      fotoid = _request$body.fotoid,
      userid = _request$body.userid;


  var reg = /((\/([^A-Z])+\/+\b))/;
  pool.query('SELECT "foto" FROM "foto" WHERE "' + (typeof fotoid !== 'number' ? 'foto' : 'fotoid') + '" = $1', [typeof fotoid !== 'number' ? fotoid.replace(reg, '') : fotoid], function (error, results) {
    var netice = results;
    if (error) throw error;else {
      pool.query('DELETE FROM "foto" WHERE ' + (typeof fotoid !== 'number' ? 'foto' : 'fotoid') + ' = $1', [typeof fotoid !== 'number' ? fotoid.replace(reg, '') : fotoid], function (error, result) {
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
            fs.unlink(config.local.folders.uploadFolder + '/' + username + '/' + netice.rows[0].foto, function (error) {
              if (error) throw error;
              response.send({
                status: 201,
                msg: 'Fotoğraf silindi'
              });
            });
          }
        });
      });
    }
  });
};

var topluSil = function topluSil(request, response) {
  var userid = request.body.userid;

  pool.query('SELECT foto FROM foto WHERE userid = $1', [userid], function (error, results) {
    if (error) throw error;
    var netice = results;
    pool.query('SELECT * from users WHERE userid = $1', [userid], function (error, results) {
      if (error) {
        throw error;
      } else {
        var username = results.rows.map(function (item) {
          return item.username;
        })[0];
        var i = 0;
        do {
          fs.unlink(config.local.folders.uploadFolder + '/' + username + '/' + netice.rows[i].foto, function (error) {
            if (error) throw error;
          });
          i++;
        } while (i < netice.rowCount);

        pool.query('DELETE FROM "foto" WHERE "userid" = $1 ', [userid], function (error, results) {
          if (error) throw error;
          response.send({
            status: 201,
            msg: 'Tüm fotoğraflar silindi. Albüm temizlendi.'
          });
        });
      }
    });
  });
};

module.exports = {
  getGaleri: getGaleri,
  galeriYukle: galeriYukle,
  tekResimSil: tekResimSil,
  topluSil: topluSil
};