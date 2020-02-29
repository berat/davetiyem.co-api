const express = require('express')
const bodyParser = require('body-parser')

const config = require('./config')
const auth = require('./querys/auth')
const ip = require('./querys/infPersonal')
const gy = require('./querys/photoAlbum');
const iw = require('./querys/infWedding');


const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

// Auth işlemleri
app.get(config.version + 'uyeCek', auth.uyeCek)
app.post(config.version + 'kayitOl', auth.kayitOl)
app.post(config.version + 'girisYap', auth.girisYap)
app.put(config.version + 'sifremi-unuttum', auth.sifremiSifirla)
app.put(config.version + 'sifremi-sifirla/:hash', auth.sifremiDegistir)

app.post(config.version + 'kisisel', ip.kisiselBilgiler);
app.post(config.version + 'kisiselFotoKaldir', ip.kisiselFotoKaldir);

app.post(config.version + 'galeriYukle', gy.galeriYukle)
app.post(config.version + 'tekResimSil', gy.tekResimSil)
app.post(config.version + 'topluSil', gy.topluSil)

app.post(config.version + 'dugun', iw.dugunBilgileri)
app.put(config.version + 'guncelleDugun', iw.guncelleDugun)

app.get('/', (request, response) => {
    response.json({ info: 'Çalışıyor çalışmakta olan.' })
})
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
