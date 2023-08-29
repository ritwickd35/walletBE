const { HttpStatusCode } = require("axios");
const Transaction = require('../models/Transaction.model')
const Wallet = require('../models/Wallet.model')
const verifyAmount = require('../services/verifyAmount.service')
const ObjectId = require('mongoose').Types.ObjectId;
const Decimal = require('decimal.js');


const initialiseWallet = async (req, res) => {
    const { balance, name } = req.body;

    if (!balance) {

        console.log("saving wallet with 0 balance as no balance was given")
        try {
            const wallet = new Wallet({
                balance: '0',
                name,
                date: Date.now()
            })
            const walletSaved = await wallet.save()
            console.log("wallet saved")
            return void res.status(HttpStatusCode.Ok).send({
                id: walletSaved._id,
                balance: walletSaved.balance,
                name: walletSaved.name,
                date: walletSaved.date
            })
        }
        catch (err) {
            return void res.status(HttpStatusCode.InternalServerError).send({ "message": err })
        }

    }

    const amountString = balance.toString(10).trim();

    if (Number(amountString) < 0) {
        return void res.status(HttpStatusCode.NotAcceptable).send({ "message": "Cannot open a new wallet with negative balance" })
    }


    if (verifyAmount(amountString)) {
        let transactionId = null, walletId = null;
        try {
            const wallet = new Wallet({
                balance: '0',
                name,
                date: Date.now()
            })
            console.log("saving wallet with initial 0 balance")

            let walletSaved = await wallet.save()
            console.log("wallet saved")

            walletId = walletSaved._id;

            console.log("saving the initial wallet transaction")
            const transaction = new Transaction({
                walletId: walletSaved._id,
                amount: amountString,
                balance: amountString,
                description: 'Initial Wallet Load',
                date: Date.now(),
            })

            let transactionSaved = await transaction.save()
            console.log("transaction saved")

            transactionId = transactionSaved._id;

            walletSaved.balance = transactionSaved.balance;
            walletSaved = await walletSaved.save();


            console.log("wallet balance updated according to transaction amount")
            if (walletSaved.balance !== transactionSaved.balance) {
                await Transaction.deleteOne({ _id: transactionSaved._id })
                throw new Error("Transaction failed. Balance mismatch. Rolling back")
            }
            return void res.status(HttpStatusCode.Ok).send({
                id: wallet._id,
                balance: wallet.balance,
                name: wallet.name,
                date: wallet.date
            })


        }
        catch (err) {// saving old balance to the wallet in case it was overwrittens
            if (walletId) {
                console.log("error wallet delete")
                // deleting wallet dec, if created
                await Wallet.deleteOne({ _id: walletId })
            }
            if (transactionId) {
                console.log("error transaction delete")

                // deleting transaction dec, if created
                await Transaction.deleteOne({ _id: transactionId })
            }
            return void res.status(HttpStatusCode.InternalServerError).send({ "message": err.message })
        }

    }
    else
        return void res.status(HttpStatusCode.NotAcceptable).send({ "message": "Invalid balance format. Amount supported upto 4 decimal places" })

}

const fetchTransactions = async (req, res) => {
    const { walletId, skip, limit } = req.query;
    try {
        const transactions = await Transaction.find({ walletId: new ObjectId(walletId) }).skip(skip).limit(limit).sort({ date: -1 })

        if (transactions.length) {
            return void res.status(HttpStatusCode.Ok).send(transactions);
        }
        else return res.status(HttpStatusCode.NotFound).send({ message: "not found" })
    }
    catch (e) {
        return res.status(HttpStatusCode.NotFound).send({ message: "Not found. Reason: " + e.message })
    }
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
            const originalWalletBalance = wallet.balance;
            let transactionId = null;

            try {
                console.log("Found wallet. Initiating transaction")

                const currentBal = new Decimal(originalWalletBalance);
                const transsactionAmt = new Decimal(amountString)
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

                let transactionSaved = await transaction.save();
                transactionId = transactionSaved._id;


                console.log("Transaction details saved")
                wallet.balance = transactionSaved.balance;
                const walletSaved = await wallet.save();

                if (walletSaved.balance !== transactionSaved.balance) {
                    Transaction.deleteOne({ _id: transactionSaved._id }).then(() => {
                        throw new Error("Transaction failed. Balance mismatch. Rolling back")
                    });
                }
                console.log("Wallet Balance Updated")

                return void res.status(HttpStatusCode.Ok).send({
                    balance: walletSaved.balance,
                    transactionId: transactionSaved._id
                })

            }
            catch (e) {

                // saving old balance to the wallet in case it was overwrittens
                wallet.balance = originalWalletBalance;
                await wallet.save()

                if (transactionId) {
                    console.log("error transaction delete")

                    // deleting transaction dec, if created
                    await Transaction.deleteOne({ _id: transactionId })
                }

                return void res.status(HttpStatusCode.InternalServerError).send({ message: "Transaction unsuccessful. Please try again", e })

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