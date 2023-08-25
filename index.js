const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/index');
const bodyParser = require('body-parser')


// create application/json parser
const jsonParser = bodyParser.json()

// const mongo_URL = `mongodb://${process.env.MONGO_URL}/${process.env.MONGO_DATABASE_NAME}?directConnection=true`
const mongo_URL = `mongodb://${process.env.MONGO_URL}/${process.env.MONGO_DATABASE_NAME}`

async function main() {
    console.log('<-- connecting to mongodb via URL-->', mongo_URL)
    await mongoose.connect(mongo_URL);
    console.log('<--connected to mongo-->')
}

const app = express() // creating our server

const port = process.env.SERVER_PORT;

// starting our server
app.listen(port, () => {
    console.log("listening on port", port)
})

main().then(() => {
    app.use(jsonParser)
    app.get('/test', (req, res) => {
        res.send("hello world")
    })
    app.use('/', routes)
})

module.exports = app
