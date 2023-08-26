const { HttpStatusCode } = require("axios");
const Transaction = require('../models/Transaction.model')
const Wallet = require('../models/Wallet.model')
const verifyAmount = require('../services/verifyAmount.service')
const ObjectId = require('mongoose').Types.ObjectId;


const initialiseWallet = (req, res) => {
    const { balance, name } = req.body;

    const amountString = balance.toString(10);

    if (verifyAmount(amountString)) {
        const wallet = new Wallet({
            balance: '0',
            name,
            date: Date.now()
        })

        wallet.save().then(wallet => {

            const transaction = new Transaction({
                walletId: wallet._id,
                amount: amountString,
                balance: amountString,
                description: 'Initial Wallet Load',
                date: Date.now(),
            })

            transaction.save().then(transaction => {
                wallet.balance = transaction.balance;
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
    else
        return void res.status(HttpStatusCode.NotAcceptable).send({ "message": "Invalid balance format. Amount supported upto 4 decimal places" })

}

const fetchTransactions = async (req, res) => {
    const { walletId, skip, limit } = req.query;

    const transactions = await Transaction.find({ walletId: new ObjectId(walletId) }).skip(skip).limit(limit)
    console.log(transactions)

    if (transactions.length) {
        return void res.status(HttpStatusCode.Ok).send(transactions);
    }
    else return res.status(HttpStatusCode.NotFound).send({ message: "not found" })
}

const getWalletDetails = async (req, res) => {
    const walletId = req.params.id;

    const walletDetails = await Wallet.findOne({ "_id": new ObjectId(walletId) })

    if (walletDetails) {
        return void res.status(HttpStatusCode.Ok).send(walletDetails)
    }
    else return void res.status(HttpStatusCode.NotFound).send({ message: "not found" })
}

const transact = async (req, res) => {
    const walletId = req.query.walletId
    const { amount, description } = req.body

    const amountString = amount.toString(10);

    if (verifyAmount(amountString))
        console.log("valid amount for transaction")
    else
        console.log("invalid value for transaction")


}

module.exports = {
    initialiseWallet,
    fetchTransactions, getWalletDetails, transact
}