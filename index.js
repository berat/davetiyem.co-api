const express = require('express')
const bodyParser = require('body-parser')

const db = require('./querys/auth')
const config = require('./config')


const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get(config.version+'uyeCek', db.uyeCek)
app.post(config.version+'kayitOl', db.kayitOl)
app.post(config.version+'girisYap', db.girisYap)

app.put(config.version+'sifremi-unuttum', db.sifremiSifirla)
app.put(config.version+'sifremi-sifirla/:hash', db.sifremiDegistir)


app.get('/', (request, response) => {
    response.json({ info: 'Çalışıyor çalışmakta olan.' })
})
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
