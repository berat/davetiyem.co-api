'use strict';

var Pool = require('pg').Pool;
var config = require('./config');
var pool = new Pool(config.local.db);

var yorum = function yorum(request, response) {
  var userid = request.params.id;

  pool.query('SELECT * FROM "yorum" WHERE userid = $1', [userid], function (error, results) {
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

var yorumlar = function yorumlar(request, response) {
  var userid = request.body[0].userid;


  pool.query('SELECT * from "yorum" where "userid" = $1', [userid], function (error, results) {
    if (error) throw error;
    if (results.rowCount >= 0) {
      if (results.rowCount > 0) {
        pool.query('DELETE FROM "yorum" WHERE "userid" = $1 ', [userid], function (error, results) {
          if (error) throw error;else {
            var i = 0;
            do {
              var yorumSahibi = request.body[i].yorumSahibi;
              var yorumu = request.body[i].yorumu;
              pool.query('INSERT INTO yorum ("userid", "yorumSahibi","yorumu") VALUES ($1, $2, $3)', [userid, yorumSahibi, yorumu], function (error, results) {
                if (error) throw error;
              });
              i++;
            } while (i < request.body.length);

            if (i == request.body.length) {
              response.send({
                status: 201,
                msg: 'Yorumlar başarılı bir şekilde eklendi'
              });
            } else {
              response.send({
                status: 404,
                msg: 'Site admini ile iletişime geçin.'
              });
            }
          }
        });
      } else {
        var i = 0;
        do {
          var yorumSahibi = request.body[i].yorumSahibi;
          var yorumu = request.body[i].yorumu;
          pool.query('INSERT INTO yorum ("userid", "yorumSahibi","yorumu") VALUES ($1, $2, $3)', [userid, yorumSahibi, yorumu], function (error, results) {
            if (error) throw error;
          });
          i++;
        } while (i < request.body.length);
        if (i == request.body.length) {
          response.send({
            status: 201,
            msg: 'Yorumlar başarılı bir şekilde eklendi'
          });
        } else {
          response.send({
            status: 404,
            msg: 'Site admini ile iletişime geçin.'
          });
        }
      }
    } else {
      response.send({
        status: 404,
        msg: 'Tabloda yeterli yer yok.'
      });
    }
  });
};

var yorumuSil = function yorumuSil(request, response) {
  var userid = request.params.id;
  pool.query('DELETE FROM "yorum" WHERE "userid" = $1', [userid], function (error, results) {
    if (error) throw error;
    response.send({
      status: 201,
      msg: 'Yorumlar başarılı bir şekilde silindi'
    });
  });
};

module.exports = {
  yorumlar: yorumlar,
  yorumuSil: yorumuSil,
  yorum: yorum
};