const { HttpStatusCode } = require("axios");
const Transaction = require('../models/Transaction.model')
const Wallet = require('../models/Wallet.model')
const verifyAmount = require('../services/verifyAmount.service')
const ObjectId = require('mongoose').Types.ObjectId;
const Decimal = require('decimal.js');


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

    const transactions = await Transaction.find({ walletId: new ObjectId(walletId) }).skip(skip).limit(limit).sort({ date: -1 })
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
    else return void res.status(HttpStatusCode.NotFound).send({ message: "wallet with given details not found" })
}

const transact = async (req, res) => {
    const walletId = req.params.walletId
    const { amount, description } = req.body

    const amountString = amount.toString(10);

    if (verifyAmount(amountString)) {

        const wallet = await Wallet.findOne({ "_id": new ObjectId(walletId) })

        if (wallet) {
            const originalWalletBalance = wallet.balance;

            const currentBal = new Decimal(originalWalletBalance);
            const transsactionAmt = new Decimal(amountString)
            try {
                const newBal = currentBal.plus(transsactionAmt)

                const transaction = new Transaction({
                    walletId: wallet._id,
                    amount: amountString,
                    balance: newBal.toString(),
                    description,
                    date: Date.now(),
                })

                transaction.save().then(transaction => {
                    wallet.balance = transaction.balance;
                    wallet.save().then((wallet) => {
                        return void res.status(HttpStatusCode.Ok).send({
                            balance: wallet.balance,
                            transactionId: transaction._id
                        })
                    })
                })

            }
            catch (e) {

                // saving old balance to the wallet in case it was overwrittens
                wallet.balance = originalWalletBalance;
                wallet.save().then(() => {
                    return void res.status(HttpStatusCode.InternalServerError).send({ message: "Transaction unsuccessful. Please try again", e })
                })
            }
        }
        else
            return void res.status(HttpStatusCode.NotFound).send({ message: "wallet with given details not found" })

    }
    else
        return void res.status(HttpStatusCode.NotAcceptable).send({ "message": "Invalid balance format. Amount supported upto 4 decimal places" })
}

module.exports = {
    initialiseWallet,
    fetchTransactions, getWalletDetails, transact
}