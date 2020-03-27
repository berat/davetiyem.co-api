'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var config = require('./config');
var auth = require('./auth');
var ip = require('./infPersonal');
var gy = require('./photoAlbum');
var iw = require('./infWedding');
var genel = require('./general');
var account = require('./account');
var mail = require('./mail');
var yorum = require('./comments');

var app = express();
var port = 3100;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors());

// Auth işlemleri
app.get(config.version + 'uyeCek', auth.uyeCek);
app.get(config.version + 'uyeCek/:id', auth.kullaniciKontrol);

app.post(config.version + 'mailGonder', mail.gonder);

app.post(config.version + 'kayitOl', auth.kayitOl);
app.post(config.version + 'girisYap', auth.girisYap);
app.put(config.version + 'sifremi-unuttum', auth.sifremiSifirla);
app.put(config.version + 'sifremi-sifirla/:hash', auth.sifremiDegistir);
app.get(config.version + 'aktifHesap', auth.aktifHesap);

// Kişisel Bilgiler
app.get(config.version + 'kisisel/:id', ip.bilgiCek);
app.post(config.version + 'kisisel', ip.kisiselBilgiler);
app.post(config.version + 'kisiselFotoKaldir', ip.kisiselFotoKaldir);
app.post(config.version + 'gelin/:hash', ip.gelinFotoYukle);
app.post(config.version + 'damat/:hash', ip.damatFotoYukle);
app.post(config.version + 'fotoSil', ip.fotoSil);

// fotoğraf Albümü
app.post(config.version + 'galeriYukle/:id', gy.galeriYukle);
app.get(config.version + 'galeri/:id', gy.getGaleri);
app.post(config.version + 'tekResimSil', gy.tekResimSil);
app.post(config.version + 'topluSil', gy.topluSil);

// Düğün bilgileri
app.post(config.version + 'dugun', iw.dugunBilgileri);
app.get(config.version + 'dugun/:id', iw.getDugun);

//Genel bilgiler
app.post(config.version + 'genel', genel.genel);
app.get(config.version + 'genel/:id', genel.getGenel);

// Hesap Bilgileri
app.put(config.version + 'hesapGuncelle', account.hesapBilgileri);
app.get(config.version + 'hesap/:id', account.hesap);

// Yorumlar Sayfası
app.get(config.version + 'yorum/:id', yorum.yorum);
app.post(config.version + 'yorum', yorum.yorumlar);
app.post(config.version + 'yorum/:id', yorum.yorumuSil);

app.get('/', function (request, response) {
  response.json({ info: 'Çalışıyor çalışmakta olan.' });
});
app.listen(port, function () {
  console.log('App running on port ' + port + '.');
});