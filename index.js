const express = require('express')
const bodyParser = require('body-parser')

const db = require('./config')


const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/users', db.getUsers)


app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
