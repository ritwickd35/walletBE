/**
 * this service verifies if the amount is a valid floating point number and if it has not more than 4 decimal places
 * @param {*} amount 
 * @returns true if valid
 */
const verifyAmount = (amount) => {
    if (isNaN(Number(amount))) {
        console.log("given amount is not a number verifyAmount")
        return false
    }
    const decimal = amount.substring(amount.indexOf('.')) //get the decimal part

    if (decimal.trim().length > 5 && amount.indexOf('.') !== -1) {
        console.log("given amount is greater than 4 decimals verifyAmount", decimal, amount.indexOf('.'))

        return false
    }

    return true // all tests passed

}

module.exports = verifyAmount