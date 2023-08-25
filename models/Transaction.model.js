const mongoose = require('mongoose')

const transactionSchema = mongoose.Schema({
    walletId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Wallet',
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    balance: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    date: {
        type: Date
    },
    user_type: {
        type: String,
        required: true,
        enum: ['CREDIT', 'DEBITs']
    }
})

const Transaction = mongoose.model('Transaction', transactionSchema)
module.exports = Transaction;