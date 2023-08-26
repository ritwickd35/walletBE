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
    type: {
        type: String,
        // required: true,
        enum: ['CREDIT', 'DEBIT']
    }
})


transactionSchema.pre('save', function (next) {
    const transaction = this;
    // if character at 0 is '-' then debit else credit
    if (this.amount.charAt(0) === '-') {
        transaction.type = 'DEBIT'
    }
    else transaction.type = 'CREDIT'

    console.log("pre save transaction", transaction)

    next()
})

const Transaction = mongoose.model('Transaction', transactionSchema)
module.exports = Transaction;