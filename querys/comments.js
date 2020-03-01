const Pool = require('pg').Pool
const config = require('../config')
const pool = new Pool(config.local.db)

const yorumlar = (request, response) => {
  const { userid, yorumSahibi, yorumu } = request.body

  pool.query(
    'SELECT * from "yorum" where "userid" = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      if (results.rowCount >= 0) {
        pool.query(
          'INSERT INTO yorum ("userid", "yorumSahibi","yorumu") VALUES ($1, $2, $3)',
          [userid, yorumSahibi, yorumu],
          (error, results) => {
            if (error) throw error
            response.send({
              status: 201,
              msg: 'Yorumlar başarılı bir şekilde eklendi'
            })
          }
        )
      } else {
        response.send({
          status: 404,
          msg: 'Tabloda yeterli yer yok.'
        })
      }
    }
  )
}

const yorumGuncelle = (request, response) => {
  const { userid, yorumSahibi, yorumu } = request.body

  pool.query(
    'SELECT * from "yorum" where "userid" = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      if (results.rowCount >= 0) {
        const eskiYorumu = results.rows.map(item => item.yorumu)[0]
        pool.query(
          'UPDATE "yorum" SET "yorumSahibi" = $1, "yorumu" = $2 WHERE "yorumu" = $3 and "userid" = $4',
          [yorumSahibi, yorumu, eskiYorumu, userid],
          (error, results) => {
            if (error) throw error
            response.send({
              status: 201,
              msg: 'Yorumlar başarılı bir şekilde güncellendi'
            })
          }
        )
      }
    }
  )
}

const yorumuSil = (request, response) => {
  const { userid } = request.body
  pool.query(
    'SELECT * from "yorum" where "userid" = $1',
    [userid],
    (error, results) => {
      if (error) throw error
      if (results.rowCount >= 0) {
        const eskiYorumu = results.rows.map(item => item.yorumu)[0]
        pool.query(
          'DELETE FROM "yorum" WHERE "yorumu" = $1 and "userid" = $2',
          [eskiYorumu, userid],
          (error, results) => {
            if (error) throw error
            response.send({
              status: 201,
              msg: 'Yorumlar başarılı bir şekilde silindi'
            })
          }
        )
      }
    }
  )
}

module.exports = {
  yorumlar,
  yorumGuncelle,
  yorumuSil
}
