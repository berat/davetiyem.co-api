'use strict';

var Pool = require('pg').Pool;
var config = require('./config');
var pool = new Pool(config.local.db);

var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport(config.mail);

var jwt = require('jsonwebtoken');
var unixcrypt = require('unixcrypt');
var unzip = require('unzipper');
var fs = require('fs');
var cuid = require('cuid');

var uyeCek = function uyeCek(request, response) {
  pool.query('SELECT * FROM users ORDER BY userid ASC', function (error, results) {
    if (error) {
      throw error;
    }
    response.send({
      status: 200,
      toplamUyeSayisi: results.rowCount,
      uyeler: results.rows
    });
  });
};

var kayitOl = function kayitOl(request, response) {
  var _request$body = request.body,
      username = _request$body.username,
      email = _request$body.email,
      password = _request$body.password;

  var passwordHashed = unixcrypt.encrypt(password, '$5$rounds=535000');

  pool.query('SELECT * FROM users WHERE username = $1 or email = $2', [username, email], function (error, results) {
    if (error) {
      throw error;
    }
    if (results.rows == 0) {
      pool.query('INSERT INTO users (username, email,password) VALUES ($1, $2, $3)', [username, email, passwordHashed], function (error, result) {
        if (error) {
          throw error;
        }

        fs.mkdirSync(config.local.folders.baseUSer + '/' + username);
        fs.mkdirSync(config.local.folders.uploadFolder + '/' + username);

        fs.createReadStream(config.local.folders.zipFiles).pipe(unzip.Extract({
          path: config.local.folders.baseUSer + '/' + username
        }));

        var message = {
          from: 'destek@davetiyem.co',
          to: email,
          subject: 'Aramiza Hosgeldiniz Davetiyem.co',
          html: 'Merhaba, ' + username + '<br><br>' + 'Aramiza hosgeldin. Uyeliginiz basarili bir sekilde olusturulmustur. Yonetim panelinden gerekli bilgileri girdiginiz de davetiyeniz hazir olacaktir. ' + '<br><br>' + "Yonetim Paneli URL'si : http://davetiyem.co/admin" + '<br>' + "Online Davetiye URL'si : http://davetiyem.co/" + username + '' + '<br><br>' + 'Davetiyenizi guzel bir sekilde paylasabilmeniz icin sizin adiniza bir gorsel hazirladik.' + '<br><br><br><br>' + '<img src="https://davetiyem.co/static/uploads/davetiye.png">'
        };
        transport.sendMail(message, function (err, info) {
          if (err) {
            console.log(err);
          } else {
            console.log(info);
          }
        });
        response.send({
          status: 201,
          msg: 'Kullanıcı başarılı bir şekilde oluştu. Lütfen giriş yapın.'
        });
      });
    } else {
      response.send({
        status: 404,
        msg: 'Kullanıcı adınızı/mailinizi değiştirerek tekrar deneyiniz.'
      });
    }
  });
};

var girisYap = function girisYap(request, response) {
  var _request$body2 = request.body,
      username = _request$body2.username,
      password = _request$body2.password;


  pool.query('SELECT * FROM users WHERE username = $1', [username], function (error, results) {
    if (error) {
      throw error;
    }
    if (results.rows != 0) {
      Hashpassword = results.rows.map(function (item) {
        return item.password;
      })[0];
      var IDuser = results.rows.map(function (item) {
        return item.userid;
      })[0];
      if (unixcrypt.verify(password, Hashpassword)) {
        var token = jwt.sign({ userid: IDuser }, config.jwtSecret);

        response.send({
          status: 201,
          msg: 'Giriş yapıldı, yönlendiriliyorsunuz.',
          token: token
        });
      } else {
        response.send({
          status: 404,
          msg: 'Şifreni kontrol et.'
        });
      }
    } else {
      response.send({
        status: 404,
        msg: 'Kullanıcı adını kontrol et.'
      });
    }
  });
};

var sifremiSifirla = function sifremiSifirla(request, response) {
  var email = request.body.email;


  pool.query('SELECT * FROM "users" WHERE "email" = $1', [email], function (error, results) {
    if (error) {
      throw error;
    }
    if (results.rowCount == 1) {
      var guid = cuid();
      pool.query('UPDATE "users" SET "hashCode" = $1 WHERE "email" = $2', [guid, email], function (error, results) {
        if (error) {
          throw error;
        }
        if (results.rowCount == 1) {
          var message = {
            from: 'destek@davetiyem.co',
            to: email,
            subject: 'Online Dugun Davetiyesi sifremi Unuttum Istegi',
            html: 'Merhaba, <br><br>' + 'Şifrenizi sıfırlamak istiyorsanız aşağıdaki linke tıklayınız. ' + 'http://davetiyem.co/reset-password/' + guid
          };
          transport.sendMail(message, function (err, info) {
            if (err) {
              console.log(err);
            } else {
              console.log(info);
            }
          });
          response.send({
            status: 201,
            msg: 'Şifre sıfırlama bağlantısı gönderildi'
          });
        } else {
          response.send({
            status: 404,
            msg: 'Şifre sıfırlama bağlantısı gönderirken hata oluştu. Site yöneticisi ile iletişime geçin.'
          });
        }
      });
    } else {
      response.send({
        status: 404,
        msg: 'Böyle bir mail adresi bulunamadı.'
      });
    }
  });
};

var sifremiDegistir = function sifremiDegistir(request, response) {
  var gelenKod = request.params.hash;

  var _request$body3 = request.body,
      password = _request$body3.password,
      valPassword = _request$body3.valPassword;


  pool.query('SELECT * FROM users WHERE "hashCode" = $1', [gelenKod], function (error, results) {
    if (error) {
      throw error;
    }

    if (results.rowCount > 0) {
      var userid = results.rows.map(function (item) {
        return item.userid;
      })[0];
      var username = results.rows.map(function (item) {
        return item.username;
      })[0];
      var email = results.rows.map(function (item) {
        return item.email;
      })[0];
      if (password === valPassword) {
        var passwordHashed = unixcrypt.encrypt(password, '$5$rounds=535000');

        pool.query('UPDATE "users" SET "hashCode" = null, "password" = $1 WHERE "userid" = $2', [passwordHashed, userid]);

        var message = {
          from: 'destek@davetiyem.co',
          to: email,
          subject: 'Şifreniz Değiştirildi',
          html: 'Merhaba ' + username + ', <br><br>' + 'Şifrenizi başarılı bir şekilde değiştirildi. Eğer bu işlemi siz yapmadıysan aşağıdaki linkten şifrenizi değiştirebilirsiniz. ' + 'http://davetiyem.co/sifremi-unuttum/'
        };
        transport.sendMail(message);

        response.send({
          status: 201,
          msg: 'Şifreniz başarılı bir şekilde değiştirildi.'
        });
      } else {
        response.send({
          status: 404,
          msg: 'Şifreniz birbiriyle eşleşmiyor.'
        });
      }
    } else {
      response.send({
        status: 405,
        msg: 'Şifre sıfırlama bağlantınız geçersiz.'
      });
    }
  });
};

var aktifHesap = function aktifHesap(request, response) {
  var hash = request.body.hash;


  var id = jwt.verify(hash, config.jwtSecret);

  pool.query('SELECT * FROM users WHERE "userid" = $1', [id], function (error, results) {
    if (error) {
      throw error;
    } else {
      response.send({
        status: 201,
        username: results.rows.map(function (item) {
          return item.username;
        })[0]
      });
    }
  });
};

var kullaniciKontrol = function kullaniciKontrol(request, response) {
  var username = request.params.id;

  pool.query('SELECT * FROM users WHERE "username" = $1', [username], function (error, results) {
    if (error) {
      throw error;
    }
    if (results.rowCount == 1) {
      response.send({
        status: 201,
        username: results.rows.map(function (item) {
          return item.username;
        })[0],
        userid: results.rows.map(function (item) {
          return item.userid;
        })[0]
      });
    } else {
      response.send({
        status: 404
      });
    }
  });
};

module.exports = {
  aktifHesap: aktifHesap,
  uyeCek: uyeCek,
  kullaniciKontrol: kullaniciKontrol,
  kayitOl: kayitOl,
  girisYap: girisYap,
  sifremiSifirla: sifremiSifirla,
  sifremiDegistir: sifremiDegistir
};