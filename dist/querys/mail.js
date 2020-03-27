'use strict';

var config = require('./config');

var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport(config.mail);

var gonder = function gonder(request, response) {
  var _request$body = request.body,
      isim = _request$body.isim,
      email = _request$body.email,
      no = _request$body.no,
      msg = _request$body.msg;

  var message = {
    from: 'destek@davetiyem.co',
    to: 'destek@davetiyem.co',
    subject: 'Davetiye Postası - ' + isim,
    html: 'Mail Adresi: ' + email + '<br><br>' + 'Telefon Numarası: ' + no + '<br><br>' + msg
  };
  transport.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
      response.send({
        status: 404,
        msg: 'Mesajınız gönderilemedi. Lütfen destek@davetiyem.co adresine mail göndermeyi deneyin.'
      });
    } else {
      response.send({
        status: 201,
        msg: 'Mesajınız başarılı bir şekilde gönderildi.'
      });
    }
  });
};

module.exports = {
  gonder: gonder
};