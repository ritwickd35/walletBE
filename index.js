const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/index');
const favicon = require('serve-favicon')
const bodyParser = require('body-parser');
const path = require("path");


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

// setting view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

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
    app.get("/", (req, res) => {
        res.render("index");
    });

    app.get("/transaction-details/:walletId", (req, res) => {
        console.log("get wID", req.params.walletId)
        res.render("transactions", { walletId: req.params.walletId });
    });
    app.use('/', routes)
})

module.exports = app
