'use strict';

var Pool = require('pg').Pool;
var config = require('./config');
var pool = new Pool(config.local.db);

var unixcrypt = require('unixcrypt');
var fs = require('fs');

var hesap = function hesap(request, response) {
  var userid = request.params.id;
  pool.query('SELECT * FROM "users" WHERE "userid" = $1', [userid], function (error, results) {
    if (error) throw error;
    response.send({
      status: 201,
      username: results.rows[0].username,
      mail: results.rows[0].email
    });
  });
};

var hesapBilgileri = function hesapBilgileri(request, response) {
  var _request$body = request.body,
      userid = _request$body.userid,
      kullaniciAdi = _request$body.kullaniciAdi,
      sifre = _request$body.sifre,
      mail = _request$body.mail;

  var passwordHashed = unixcrypt.encrypt(sifre, '$5$rounds=535000');

  pool.query('SELECT * FROM "users" WHERE "userid" = $1', [userid], function (error, results) {
    if (error) throw error;else {
      var username = results.rows.map(function (item) {
        return item.username;
      })[0];
      var kullaniciID = results.rows.map(function (item) {
        return item.userid;
      })[0];
      pool.query('SELECT * FROM "users" WHERE username = $1 or email = $2', [kullaniciAdi, mail], function (error, results) {
        if (error) throw error;
        if (results.rowCount == 0 || results.rowCount == 1 && results.rows[0].userid == kullaniciID) {
          if (sifre) {
            pool.query('UPDATE "users" SET "password"=$1, "username"=$2, "email"=$3 WHERE "userid"=$4', [passwordHashed, kullaniciAdi, mail, userid], function (error, results) {
              if (error) throw error;else {
                fs.renameSync(config.local.folders.baseUSer + '/' + username, config.local.folders.baseUSer + '/' + kullaniciAdi);
                fs.renameSync(config.local.folders.uploadFolder + '/' + username, config.local.folders.uploadFolder + '/' + kullaniciAdi);
                response.send({
                  status: 201,
                  msg: 'Hesap bilgileriniz başarılı bir şekilde güncellendi.'
                });
              }
            });
          } else {
            pool.query('UPDATE "users" SET "username"=$1, "email"=$2 WHERE "userid"=$3', [kullaniciAdi, mail, userid], function (error, results) {
              if (error) throw error;else {
                fs.renameSync(config.local.folders.baseUSer + '/' + username, config.local.folders.baseUSer + '/' + kullaniciAdi);
                fs.renameSync(config.local.folders.uploadFolder + '/' + username, config.local.folders.uploadFolder + '/' + kullaniciAdi);
                response.send({
                  status: 201,
                  msg: 'Hesap bilgileriniz başarılı bir şekilde güncellendi.'
                });
              }
            });
          }
        } else {
          response.send({
            status: 404,
            msg: 'Farklı şeyler deneyin.'
          });
        }
      });
    }
  });
};

module.exports = {
  hesapBilgileri: hesapBilgileri,
  hesap: hesap
};