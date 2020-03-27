const config = require('./config')

const nodemailer = require('nodemailer')
let transport = nodemailer.createTransport(config.mail)

const gonder = (request, response) => {
  const { isim, email, no, msg } = request.body
  const message = {
    from: 'destek@davetiyem.co',
    to: 'destek@davetiyem.co',
    subject: 'Davetiye Postası - ' + isim,
    html:
      'Mail Adresi: ' +
      email +
      '<br><br>' +
      'Telefon Numarası: ' +
      no +
      '<br><br>' +
      msg
  }
  transport.sendMail(message, function(err, info) {
    if (err) {
        console.log(err)
        response.send({
          status: 404,
          msg: 'Mesajınız gönderilemedi. Lütfen destek@davetiyem.co adresine mail göndermeyi deneyin.'
        })
    } else {
      response.send({
        status: 201,
        msg: 'Mesajınız başarılı bir şekilde gönderildi.'
      })
    }
  })
}

module.exports = {
  gonder
}
