const { HttpStatusCode } = require("axios");
const Transaction = require('../models/Transaction.model')
const Wallet = require('../models/Wallet.model')
const verifyAmount = require('../services/verifyAmount.service')
const ObjectId = require('mongoose').Types.ObjectId;
const Decimal = require('decimal.js');


const initialiseWallet = (req, res) => {
    const { balance, name } = req.body;

    const amountString = balance.toString(10).trim();

    if (verifyAmount(amountString)) {
        const wallet = new Wallet({
            balance: '0',
            name,
            date: Date.now()
        })
        console.log("saving wallet with initial 0 balance")
        wallet.save().then(wallet => {
            console.log("wallet saved")
            try {
                console.log("saving the initial wallet transaction")
                const transaction = new Transaction({
                    walletId: wallet._id,
                    amount: amountString,
                    balance: amountString,
                    description: 'Initial Wallet Load',
                    date: Date.now(),
                })

                transaction.save().then(transaction => {
                    console.log("transaction saved")
                    wallet.balance = transaction.balance;
                    wallet.save().then((wallet) => {
                        console.log("wallet balance updated according to transaction amount")
                        if (wallet.balance !== transaction.balance) {
                            Transaction.deleteOne({ _id: transaction._id }).then(() => {
                                throw new Error("Transaction failed. Balance mismatch. Rolling back")
                            });
                        }
                        return void res.status(HttpStatusCode.Ok).send({
                            id: wallet._id,
                            balance: wallet.balance,
                            name: wallet.name,
                            date: wallet.date
                        })
                    })
                })
            }
            catch (e) {
                // saving old balance to the wallet in case it was overwrittens
                Wallet.deleteOne({ _id: wallet._id }).then(() => {
                    return void res.status(HttpStatusCode.InternalServerError).send({ message: "Transaction unsuccessful. Could not create wallet. Please try again", e })
                })
            }


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

    const amountString = amount.toString(10).trim();

    if (verifyAmount(amountString)) {

        const wallet = await Wallet.findOne({ "_id": new ObjectId(walletId) })

        if (wallet) {
            console.log("Found wallet. Initiating transaction")
            const originalWalletBalance = wallet.balance;

            const currentBal = new Decimal(originalWalletBalance);
            const transsactionAmt = new Decimal(amountString)
            try {
                const newBal = currentBal.plus(transsactionAmt)  // calculating new balance
                if (Number(newBal) < 0) {
                    return void res.status(HttpStatusCode.NotAcceptable).send({ "message": "Insufficient Balance for " + wallet.name })
                }

                console.log("Balance check complete. Transaction can continue")

                const transaction = new Transaction({
                    walletId: wallet._id,
                    amount: amountString,
                    balance: newBal.toString(),
                    description,
                    date: Date.now(),
                })

                transaction.save().then(transaction => {
                    console.log("Transaction details saved")
                    wallet.balance = transaction.balance;
                    wallet.save().then((wallet) => {

                        if (wallet.balance !== transaction.balance) {
                            Transaction.deleteOne({ _id: transaction._id }).then(() => {
                                throw new Error("Transaction failed. Balance mismatch. Rolling back")
                            });
                        }
                        console.log("Wallet Balance Updated")

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