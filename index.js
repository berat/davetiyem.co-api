const express = require('express')
const bodyParser = require('body-parser')

const db = require('./querys/auth')


const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/v1/auth/uyeCek', db.uyeCek)
app.post('/v1/auth/kayitOl', db.kayitOl)


app.get('/', (request, response) => {
    response.json({ info: 'Çalışıyor çalışmakta olan.' })
})
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
