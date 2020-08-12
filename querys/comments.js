const Pool = require('pg').Pool
const config = require('./config')
const pool = new Pool(config.local.db)
const jwt = require('jsonwebtoken')

const yorum = (request, response) => {
  const hash = request.params.id
  const userid = jwt.verify(hash, config.jwtSecret).userid

  pool.query(
    'SELECT * FROM "yorum" WHERE userid = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      else if (results.rowCount != 0) {
        response.send({
          status: 201,
          data: results.rows
        })
      } else {
        response.send({
          status: 404,
          msg: 'Herhangi bir kayıt bulanamadı.'
        })
      }
    }
  )
}

const yorumlar = (request, response) => {
  const { hash } = request.body[0]
  const userid = jwt.verify(hash, config.jwtSecret).userid

  pool.query(
    'SELECT * from "yorum" where "userid" = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      if (results.rowCount >= 0) {
        if (results.rowCount > 0) {
          pool.query(
            'DELETE FROM "yorum" WHERE "userid" = $1 ',
            [userid],
            (error, results) => {
              if (error) throw error
              else {
                var i = 0
                do {
                  var yorumSahibi = request.body[i].yorumSahibi
                  var yorumu = request.body[i].yorumu
                  pool.query(
                    'INSERT INTO yorum ("userid", "yorumSahibi","yorumu") VALUES ($1, $2, $3)',
                    [userid, yorumSahibi, yorumu],
                    (error, results) => {
                      if (error) throw error
                    }
                  )
                  i++
                } while (i < request.body.length)

                if (i == request.body.length) {
                  response.send({
                    status: 201,
                    msg: 'Yorumlar başarılı bir şekilde eklendi'
                  })
                } else {
                  response.send({
                    status: 404,
                    msg: 'Site admini ile iletişime geçin.'
                  })
                }
              }
            }
          )
        } else {
          var i = 0
          do {
            var yorumSahibi = request.body[i].yorumSahibi
            var yorumu = request.body[i].yorumu
            pool.query(
              'INSERT INTO yorum ("userid", "yorumSahibi","yorumu") VALUES ($1, $2, $3)',
              [userid, yorumSahibi, yorumu],
              (error, results) => {
                if (error) throw error
              }
            )
            i++
          } while (i < request.body.length)
          if (i == request.body.length) {
            response.send({
              status: 201,
              msg: 'Yorumlar başarılı bir şekilde eklendi'
            })
          } else {
            response.send({
              status: 404,
              msg: 'Site admini ile iletişime geçin.'
            })
          }
        }
      } else {
        response.send({
          status: 404,
          msg: 'Tabloda yeterli yer yok.'
        })
      }
    }
  )
}

const yorumuSil = (request, response) => {
  const hash = request.params.id
  const userid = jwt.verify(hash, config.jwtSecret).userid

  pool.query(
    'DELETE FROM "yorum" WHERE "userid" = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      response.send({
        status: 201,
        msg: 'Yorumlar başarılı bir şekilde silindi'
      })
    }
  )
}

module.exports = {
  yorumlar,
  yorumuSil,
  yorum
}
