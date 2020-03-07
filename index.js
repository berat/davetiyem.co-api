const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');

const config = require('./config')
const auth = require('./querys/auth')
const ip = require('./querys/infPersonal')
const gy = require('./querys/photoAlbum');
const iw = require('./querys/infWedding');
const genel = require('./querys/general');
const account = require('./querys/account')
const yorum = require('./querys/comments')

const app = express()
const port = 3100

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use(cors());

// Auth işlemleri
app.get(config.version + 'uyeCek', auth.uyeCek)


app.post(config.version + 'kayitOl', auth.kayitOl)
app.post(config.version + 'girisYap', auth.girisYap)
app.put(config.version + 'sifremi-unuttum', auth.sifremiSifirla)
app.put(config.version + 'sifremi-sifirla/:hash', auth.sifremiDegistir)

// Kişisel Bilgiler
app.post(config.version + 'kisisel', ip.kisiselBilgiler);
app.post(config.version + 'kisiselFotoKaldir', ip.kisiselFotoKaldir);

// fotoğraf Albümü
app.post(config.version + 'galeriYukle', gy.galeriYukle)
app.post(config.version + 'tekResimSil', gy.tekResimSil)
app.post(config.version + 'topluSil', gy.topluSil)

// Düğün bilgileri
app.post(config.version + 'dugun', iw.dugunBilgileri)
app.put(config.version + 'guncelleDugun', iw.guncelleDugun)

//Genel bilgiler
app.post(config.version + 'genel', genel.genel)

// Hesap Bilgileri
app.put(config.version + 'hesapGuncelle', account.hesapBilgileri)

// Yorumlar Sayfası
app.post(config.version + 'yorum', yorum.yorumlar)
app.put(config.version + 'yorum', yorum.yorumGuncelle)
app.delete(config.version + 'yorum', yorum.yorumuSil)


app.get('/', (request, response) => {
    response.json({ info: 'Çalışıyor çalışmakta olan.' })
})
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
