const mongoose = require('mongoose')

const wallet = mongoose.Schema({
    balance: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date
    },
})

const Wallet = mongoose.model('Wallet', wallet)
module.exports = Wallet;