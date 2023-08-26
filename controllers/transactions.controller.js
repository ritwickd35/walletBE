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
        // check if converting to basic number is enough

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
                return void res.status(HttpStatusCode.Ok).send({
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

    const transactions = Transaction.find({ walletId }).skip(skip).limit(limit);

    if (transactions.length) {
        return void res.status(HttpStatusCode.Ok).send(transactions);
    }
    else return res.status(HttpStatusCode.NotFound).send({ message: "not found" })
}

const getWalletDetails = async (req, res) => {
    const walletId = req.query.id;

    const walletDetails = await Wallet.findOne({ "_id": walletId })

    if (walletDetails) {
        return void res.status(HttpStatusCode.Ok).send(walletDetails)
    }
    else return void res.status(HttpStatusCode.NotFound).send({ message: "not found" })
}

module.exports = {
    initialiseWallet,
    fetchTransactions, getWalletDetails
}