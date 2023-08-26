const { initialiseWallet,
    fetchTransactions, getWalletDetails, transact } = require('../controllers/transactions.controller')

const express = require("express");
const router = express.Router();

router.get('/', function (req, res) {
    return void res.send("Wallet server working")
})

router.post('/setup', initialiseWallet)
router.get('/transactions', fetchTransactions)
router.get('/wallet/:id', getWalletDetails)
router.post('/transact/:walletId', transact)


module.exports = router;