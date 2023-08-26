const { HttpStatusCode } = require("axios");
const Transaction = require('../models/Transaction.model')
const Wallet = require('../models/Wallet.model')


const initialiseWallet = async (req, res) => {
    const { balance, name } = req.body;
    const wallet = new Wallet({
        balance: '0',
        name,
        date: Date.now()
    })

    wallet.save().then(wallet => {
        // handle erronoeous balances and show errors and give up

        const transaction = new Transaction({
            walletId: wallet._id,
            amount: balance,
            balance,
            description: 'Initial Wallet Load',
            date: Date.now(),
        })

        transaction.save().then(transaction => {
            wallet.balance = balance;
            wallet.save().then((wallet) => {
                return void res.status(HttpStatusCode.Created).send({
                    id: wallet._id,
                    balance: wallet.balance,
                    name: wallet.name,
                    date: wallet.date
                })
            })
        })
    })
}

const fetchTransactions = async (req, res) => {
    const { walletId, skip, limit } = req.query;

}