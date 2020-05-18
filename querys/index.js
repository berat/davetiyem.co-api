const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const config = require('./config')
const auth = require('./auth')
const ip = require('./infPersonal')
const gy = require('./photoAlbum')
const iw = require('./infWedding')
const genel = require('./general')
const account = require('./account')
const mail = require('./mail')
const yorum = require('./comments')

const app = express()
const port = 3100

app.use(bodyParser.json())
app.use(express.static(config.local.folders.uploadFolder))
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
var whitelist = [
  'https://davetiyem.co',
  'http://davetiyem.co',
  'http://0.0.0.0:3000'
]
var corsOptions = {
  origin: function(origin, callback) {
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1
    callback(null, originIsWhitelisted)
  },
  credentials: true
}
app.use(cors(corsOptions))
app.options('*', cors())
// Auth işlemleri
app.get(config.version + 'uyeCek', auth.uyeCek)
app.get(config.version + 'uyeCek/:id', auth.kullaniciKontrol)

app.post(config.version + 'mailGonder', mail.gonder)

app.post(config.version + 'kayitOl', auth.kayitOl)
app.post(config.version + 'girisYap', auth.girisYap)
app.put(config.version + 'sifremi-unuttum', auth.sifremiSifirla)
app.put(config.version + 'sifremi-sifirla/:hash', auth.sifremiDegistir)
app.get(config.version + 'aktifHesap', auth.aktifHesap)

// Kişisel Bilgiler
app.get(config.version + 'kisisel/:id', ip.bilgiCek)
app.post(config.version + 'kisisel', ip.kisiselBilgiler)
app.post(config.version + 'kisiselFotoKaldir', ip.kisiselFotoKaldir)
app.post(config.version + 'gelin/:hash', ip.gelinFotoYukle)
app.post(config.version + 'damat/:hash', ip.damatFotoYukle)
app.post(config.version + 'fotoSil', ip.fotoSil)

// fotoğraf Albümü
app.post(config.version + 'galeriYukle/:id', gy.galeriYukle)
app.get(config.version + 'galeri/:id', gy.getGaleri)
app.post(config.version + 'tekResimSil', gy.tekResimSil)
app.post(config.version + 'topluSil', gy.topluSil)

// Düğün bilgileri
app.post(config.version + 'dugun', iw.dugunBilgileri)
app.get(config.version + 'dugun/:id', iw.getDugun)

//Genel bilgiler
app.post(config.version + 'genel', genel.genel)
app.get(config.version + 'genel/:id', genel.getGenel)

// Hesap Bilgileri
app.put(config.version + 'hesapGuncelle', account.hesapBilgileri)
app.get(config.version + 'hesap/:id', account.hesap)

// Yorumlar Sayfası
app.get(config.version + 'yorum/:id', yorum.yorum)
app.post(config.version + 'yorum', yorum.yorumlar)
app.post(config.version + 'yorum/:id', yorum.yorumuSil)

app.get('/', (request, response) => {
  response.json({ info: 'Çalışıyor çalışmakta olan.' })
})
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
