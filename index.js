const express = require('express')
const bodyParser = require('body-parser')

const auth = require('./querys/auth')
const ip = require('./querys/infPersonal')
const config = require('./config')


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

// Personel Information işlemleri

// app.post(config.version + 'yukle', ip.upload.single('file'), function (req, res, next) {
//     try{

//         res.send(req.file)
//     }
//     catch(e){
//         res.send(e)
//     }
// });


app.post(config.version + 'kisisel', ip.kisiselBilgiler);


app.get('/', (request, response) => {
    response.json({ info: 'Çalışıyor çalışmakta olan.' })
})
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
