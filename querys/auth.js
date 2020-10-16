const Pool = require('pg').Pool
const config = require('./config')
const pool = new Pool(config.local.db)
const fetch = require('node-fetch')

const nodemailer = require('nodemailer')
let transport = nodemailer.createTransport(config.mail)

const jwt = require('jsonwebtoken')
var unixcrypt = require('unixcrypt')
var fs = require('fs')
var cuid = require('cuid')

const checkDate = createDate => {
  const nowDate = new Date()
  var nowYear = nowDate.getFullYear()
  var nowMonth = nowDate.getMonth() + 1
  var nowDay = nowDate.getDate()
  var nowHour = nowDate.getHours()
  var nowMin = nowDate.getMinutes()

  var modifyCreateDate = createDate.split('-')

  let yilFark = nowYear - parseInt(modifyCreateDate[0])
  let ayFark = nowMonth - parseInt(modifyCreateDate[1])
  let gunFark = nowDay - parseInt(modifyCreateDate[2])
  let saatFark = nowHour - parseInt(modifyCreateDate[3])
  let minFark = nowMin - parseInt(modifyCreateDate[4])

  console.log(gunFark, saatFark, minFark)

  if (yilFark === 0 && ayFark === 0 && gunFark === 0) {
      console.log("1")

    return true
  }
  if (yilFark === 0 && ayFark === 0 && gunFark === 1) {
      console.log("2")

    if (saatFark < 0 || (saatFark === 0 && minFark <= 0)) {
      console.log("3")

      return true
    } else {
      console.log("4")

      return false
    }
  } else {
      console.log("5")

    return false
  }
}

const uyeCek = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY userid DESC', (error, results) => {
    if (error) {
      throw error
    }
    var users = results.rows.map(item => {
      var data = {
        username: item.username,
        email: item.email,
        createDate: item.createdate,
        status: item.status
      }
      return data
    })
    response.send({
      status: 200,
      toplamUyeSayisi: results.rowCount,
      uyeler: users
    })
  })
}

const kayitOl = (request, response) => {
  const { username, email, password } = request.body
  const passwordHashed = unixcrypt.encrypt(password, '$5$rounds=535000')

  pool.query(
    'SELECT * FROM users WHERE username = $1 or email = $2',
    [username, email],
    (error, results) => {
      if (error) {
        throw error
      }
      if (results.rows == 0) {
        const nowDate = new Date()
        var nowYear = nowDate.getFullYear()
        var nowMonth = nowDate.getMonth() + 1
        var nowDay = nowDate.getDate()
        var nowHour = nowDate.getHours()
        var nowMin = nowDate.getMinutes()

        var currentDate = `${nowYear}-${nowMonth}-${nowDay}-${nowHour}-${nowMin}`
        var defaultStatus = false

        pool.query(
          'INSERT INTO users (username, email,password, createdate, status) VALUES ($1, $2, $3, $4, $5)',
          [username, email, passwordHashed, currentDate, defaultStatus],
          (error, result) => {
            if (error) {
              throw error
            }
          }
        )

        fetch('https://api.mailerlite.com/api/v2/subscribers', {
          body: JSON.stringify({
            email: email,
            name: username
          }),
          method: 'POST',
          headers: {
            'X-MailerLite-ApiKey': 'xxxxxxxxxxxxx',
            'Content-Type': 'application/json'
          }
        }).then(res => console.log(res))

        fs.mkdirSync(`${config.local.folders.uploadFolder}/${username}`)
        const message = {
          from: 'destek@davetiyem.co',
          to: email,
          subject: 'Aramiza Hosgeldiniz Davetiyem.co',
          html:
            'Merhaba, ' +
            username +
            '<br><br>' +
            'Aramiza hosgeldin. Uyeliginiz basarili bir sekilde olusturulmustur. Yonetim panelinden gerekli bilgileri girdiginiz de davetiyeniz hazir olacaktir. ' +
            '<br><br>' +
            "Yonetim Paneli URL'si : http://davetiyem.co/admin" +
            '<br>' +
            "Online Davetiye URL'si : http://davetiyem.co/" +
            username +
            '' +
            '<br><br>' +
            'Davetiyenizi guzel bir sekilde paylasabilmeniz icin sizin adiniza bir gorsel hazirladik.' +
            '<br><br><br><br>' +
            '<img src="https://davetiyem.co/uploads/users/davetiye.png">'
        }
        transport.sendMail(message)
        response.send({
          status: 201,
          msg: 'Kullanıcı başarılı bir şekilde oluştu. Lütfen giriş yapın.'
        })
      } else {
        response.send({
          status: 404,
          msg: 'Kullanıcı adınızı/mailinizi değiştirerek tekrar deneyiniz.'
        })
      }
    }
  )
}

const girisYap = (request, response) => {
  const { username, password } = request.body

  pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username],
    (error, results) => {
      if (error) {
        throw error
      }
      if (results.rowCount !== 0) {
        Hashpassword = results.rows.map(item => item.password)[0]
        const IDuser = results.rows.map(item => item.userid)[0]

        if (unixcrypt.verify(password, Hashpassword)) {
          const token = jwt.sign({ userid: IDuser }, config.jwtSecret)

          response.send({
            status: 201,
            msg: 'Giriş yapıldı, yönlendiriliyorsunuz.',
            token: token
          })
        } else {
          response.send({
            status: 404,
            msg: 'Şifreni kontrol et.'
          })
        }
      } else {
        response.send({
          status: 404,
          msg: 'Kullanıcı adını kontrol et.'
        })
      }
    }
  )
}

const sifremiSifirla = (request, response) => {
  const { email } = request.body

  pool.query(
    'SELECT * FROM "users" WHERE "email" = $1',
    [email],
    (error, results) => {
      if (error) {
        throw error
      }
      if (results.rowCount == 1) {
        var guid = cuid()
        pool.query(
          'UPDATE "users" SET "hashCode" = $1 WHERE "email" = $2',
          [guid, email],
          (error, results) => {
            if (error) {
              throw error
            }
            if (results.rowCount == 1) {
              const message = {
                from: 'destek@davetiyem.co',
                to: email,
                subject: 'Online Dugun Davetiyesi sifremi Unuttum Istegi',
                html:
                  'Merhaba, <br><br>' +
                  'Şifrenizi sıfırlamak istiyorsanız aşağıdaki linke tıklayınız. ' +
                  'http://davetiyem.co/reset-password/' +
                  guid
              }
              transport.sendMail(message, function(err, info) {
                if (err) {
                  console.log(err)
                } else {
                  console.log(info)
                }
              })
              response.send({
                status: 201,
                msg: 'Şifre sıfırlama bağlantısı gönderildi'
              })
            } else {
              response.send({
                status: 404,
                msg:
                  'Şifre sıfırlama bağlantısı gönderirken hata oluştu. Site yöneticisi ile iletişime geçin.'
              })
            }
          }
        )
      } else {
        response.send({
          status: 404,
          msg: 'Böyle bir mail adresi bulunamadı.'
        })
      }
    }
  )
}

const sifremiDegistir = (request, response) => {
  const gelenKod = request.params.hash

  const { password, valPassword } = request.body

  pool.query(
    'SELECT * FROM users WHERE "hashCode" = $1',
    [gelenKod],
    (error, results) => {
      if (error) {
        throw error
      }

      if (results.rowCount > 0) {
        var userid = results.rows.map(item => item.userid)[0]
        var username = results.rows.map(item => item.username)[0]
        var email = results.rows.map(item => item.email)[0]
        if (password === valPassword) {
          const passwordHashed = unixcrypt.encrypt(password, '$5$rounds=535000')

          pool.query(
            'UPDATE "users" SET "hashCode" = null, "password" = $1 WHERE "userid" = $2',
            [passwordHashed, userid]
          )

          const message = {
            from: 'destek@davetiyem.co',
            to: email,
            subject: 'Şifreniz Değiştirildi',
            html:
              'Merhaba ' +
              username +
              ', <br><br>' +
              'Şifrenizi başarılı bir şekilde değiştirildi. Eğer bu işlemi siz yapmadıysan aşağıdaki linkten şifrenizi değiştirebilirsiniz. ' +
              'http://davetiyem.co/forget-password/'
          }
          transport.sendMail(message)

          response.send({
            status: 201,
            msg: 'Şifreniz başarılı bir şekilde değiştirildi.'
          })
        } else {
          response.send({
            status: 404,
            msg: 'Şifreniz birbiriyle eşleşmiyor.'
          })
        }
      } else {
        response.send({
          status: 405,
          msg: 'Şifre sıfırlama bağlantınız geçersiz.'
        })
      }
    }
  )
}

const aktifHesap = (request, response) => {
  const hash = request.params.hash
  const userid = jwt.verify(hash, config.jwtSecret).userid

  pool.query(
    'SELECT * FROM users WHERE "userid" = $1',
    [userid],
    (error, results) => {
      if (error) {
        throw error
      }
      if (results.rowCount == 1) {
        if (!results.rows[0].status && !checkDate(results.rows[0].createdate)) {
          pool.query(
            'UPDATE "users" SET "status" = false WHERE "userid" = $1',
            [results.rows[0].userid]
          )
          response.send({
            status: 202,
            pro: false,
            username: results.rows.map(item => item.username)[0],
            userid: results.rows.map(item => item.userid)[0]
          })
        } else {
          response.send({
            status: 201,
            username: results.rows.map(item => item.username)[0],
            userid: results.rows.map(item => item.userid)[0]
          })
        }
      } else {
        response.send({
          status: 404
        })
      }
    }
  )
}

const kullaniciKontrol = (request, response) => {
  const username = request.params.id

  pool.query(
    'SELECT * FROM users WHERE "username" = $1',
    [username],
    (error, results) => {
      if (error) {
        throw error
      }
      if (results.rowCount == 1) {
console.log(results.rows, checkDate(results.rows[0].createdate))
        if (!results.rows[0].status && !checkDate(results.rows[0].createdate)) {
          pool.query(
            'UPDATE "users" SET "status" = false WHERE "userid" = $1',
            [results.rows[0].userid]
          )
          response.send({
            status: 202,
            pro: false,
            username: results.rows.map(item => item.username)[0],
            userid: results.rows.map(item => item.userid)[0]
          })
        } else {
          response.send({
            status: 201,
            username: results.rows.map(item => item.username)[0],
            userid: results.rows.map(item => item.userid)[0]
          })
        }
      } else {
        response.send({
          status: 404
        })
      }
    }
  )
}

const kullaniciKontrolForAdmin = (request, response) => {
  const hash = request.params.id
  const userid = jwt.verify(hash, config.jwtSecret).userid

  pool.query(
    'SELECT * FROM users WHERE "userid" = $1',
    [userid],
    (error, results) => {
      if (error) {
        throw error
      }
      if (results.rowCount == 1) {
        if (!results.rows[0].status && !checkDate(results.rows[0].createdate)) {
          pool.query(
            'UPDATE "users" SET "status" = false WHERE "userid" = $1',
            [results.rows[0].userid]
          )
          response.send({
            status: 202,
            pro: false,
            username: results.rows.map(item => item.username)[0],
            userid: results.rows.map(item => item.userid)[0]
          })
        } else {
          response.send({
            status: 201,
            username: results.rows.map(item => item.username)[0],
            userid: results.rows.map(item => item.userid)[0]
          })
        }
      } else {
        response.send({
          status: 404
        })
      }
    }
  )
}

module.exports = {
  aktifHesap,
  uyeCek,
  kullaniciKontrol,
  kullaniciKontrolForAdmin,
  kayitOl,
  girisYap,
  sifremiSifirla,
  sifremiDegistir
}