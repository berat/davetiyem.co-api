'use strict';

var Pool = require('pg').Pool;
var config = require('./config');
var pool = new Pool(config.local.db);

var dugunBilgileri = function dugunBilgileri(request, response) {
  var userid = request.body[0].userid;

  pool.query('SELECT * FROM dugun WHERE userid = $1', [userid], function (error, results) {
    if (error) {
      throw error;
    } else if (results.rowCount == 0) {
      var i = 0;
      do {
        var _request$body$i = request.body[i],
            baslik = _request$body$i.baslik,
            tarih = _request$body$i.tarih,
            adres = _request$body$i.adres,
            iframe = _request$body$i.iframe;

        pool.query('INSERT INTO "dugun" (userid, dbaslik, dtarih, dadres, diframe) VALUES ($1, $2, $3, $4, $5)', [userid, baslik, tarih, adres, iframe], function (error, results) {
          if (error) throw error;
        });
        i++;
      } while (i < request.body.length);
      if (i == 2) {
        response.send({
          status: 201,
          msg: 'Düğün bilgileriniz kayıt edildi.'
        });
      } else {
        response.send({
          status: 404,
          msg: 'Site admini ile iletişime geçin.'
        });
      }
    } else {
      pool.query('DELETE FROM "dugun" WHERE userid= $1', [userid], function (error, results) {
        if (error) throw error;else {
          i = 0;
          do {
            var _request$body$i2 = request.body[i],
                _baslik = _request$body$i2.baslik,
                _tarih = _request$body$i2.tarih,
                _adres = _request$body$i2.adres,
                _iframe = _request$body$i2.iframe;

            pool.query('INSERT INTO "dugun" (userid, dbaslik, dtarih, dadres, diframe) VALUES ($1, $2, $3, $4, $5)', [userid, _baslik, _tarih, _adres, _iframe], function (error, results) {
              if (error) throw error;
            });
            i++;
          } while (i < request.body.length);
          if (i == 2) {
            response.send({
              status: 201,
              msg: 'Düğün bilgileriniz güncellendi.'
            });
          } else {
            response.send({
              status: 404,
              msg: 'Site admini ile iletişime geçin.'
            });
          }
        }
      });
    }
  });
};

var getDugun = function getDugun(request, response) {
  var userid = request.params.id;

  pool.query('SELECT * FROM dugun WHERE userid = $1', [userid], function (error, results) {
    if (error) throw error;else if (results.rowCount != 0) {
      response.send({
        status: 201,
        data: results.rows
      });
    } else {
      response.send({
        status: 404,
        msg: 'Herhangi bir kayıt bulanamadı.'
      });
    }
  });
};

module.exports = {
  getDugun: getDugun,
  dugunBilgileri: dugunBilgileri
};