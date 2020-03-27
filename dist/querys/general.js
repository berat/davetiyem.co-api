'use strict';

var Pool = require('pg').Pool;
var config = require('./config');
var pool = new Pool(config.local.db);

var getGenel = function getGenel(request, response) {
  var userid = request.params.id;

  pool.query('SELECT * FROM genel WHERE userid = $1', [userid], function (error, results) {
    if (error) throw error;
    response.send({
      status: 201,
      data: results.rows
    });
  });
};

var genel = function genel(request, response) {
  var _request$body = request.body,
      userid = _request$body.userid,
      tarih = _request$body.tarih,
      saat = _request$body.saat,
      dugunSozu = _request$body.dugunSozu,
      dipNot = _request$body.dipNot,
      title = _request$body.title,
      desc = _request$body.desc;


  pool.query('SELECT * FROM genel WHERE userid = $1', [userid], function (error, results) {
    if (error) throw error;
    if (results.rowCount == 0) {
      if (!dipNot) {
        pool.query('INSERT INTO "genel" ("userid", "tarih", "saat", "dugunSozu", "title", "desc") VALUES ($1, $2, $3, $4, $5, $6)', [userid, tarih, saat, dugunSozu, title, desc], function (error, results) {
          if (error) throw error;else {
            response.send({
              status: 201,
              msg: 'Genel bilgiler kayıt edildi.'
            });
          }
        });
      } else {
        pool.query('INSERT INTO "genel" ("userid", "dipnot") VALUES ($1, $2)', [userid, dipNot], function (error, results) {
          if (error) throw error;else {
            response.send({
              status: 201,
              msg: 'Genel bilgiler kayıt edildi.'
            });
          }
        });
      }
    }
    if (results.rowCount == 1) {
      if (!dipNot) {
        pool.query('UPDATE "genel" SET "tarih"=$1, "saat"=$2, "dugunSozu"=$3, "title"=$4, "desc"=$5 WHERE "userid" = $6 ', [tarih, saat, dugunSozu, title, desc, userid], function (error, results) {
          if (error) throw error;else {
            response.send({
              status: 201,
              msg: 'Genel bilgiler güncellendi.'
            });
          }
        });
      } else {
        pool.query('UPDATE "genel" SET "dipnot" = $1 WHERE "userid" = $2 ', [dipNot, userid], function (error, results) {
          if (error) throw error;else {
            response.send({
              status: 201,
              msg: 'Genel bilgiler güncellendi.'
            });
          }
        });
      }
    }
  });
};

module.exports = {
  genel: genel,
  getGenel: getGenel
};