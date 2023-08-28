let walletDetails = localStorage.getItem("walletDetails");
if (!walletDetails) {
    document.getElementById("walletDetailsDiv").style.display = "none";
    document.getElementById("transactionDiv").style.display = "none";
} else {
    walletDetails = JSON.parse(walletDetails)
    console.log("got wallet details in LC", walletDetails)

    document.getElementById('transactionNavigate').href = '/transaction-details/' + walletDetails.id

    document.getElementById("walletInputDiv").style.display = "none";
    // load wallet details from BE using localstorage info
    document.getElementById("walletName").textContent = walletDetails.name;
    document.getElementById("walletBalance").textContent = walletDetails.balance;
}

function handleWalletDetails(eventData) {
    eventData.preventDefault();

    // Get the form element
    const form = eventData.target;
    // Create a FormData object from the form
    const formData = new FormData(form);

    const name = formData.get("walletName");
    const balance = formData.get("walletBalance");

    if (!name) {
        displayError('Enter Wallet Name')
        return;
    }
    if (!balance) {
        displayError('Enter a initial balance')
        return;
    }
    const reqData = { name, balance };
    const url = "/setup";
    fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(reqData), // body data type must match "Content-Type" header
    })
        .then((response) => {
            if (response.ok)
                return response.json();
            return Promise.reject(response)
        })
        .then((data) => {
            walletDetails = data
            localStorage.setItem("walletDetails", JSON.stringify(walletDetails))

            document.getElementById("walletName").textContent = walletDetails.name;
            document.getElementById("walletBalance").textContent = walletDetails.balance;
            document.getElementById('transactionNavigate').href = '/transaction-details/' + walletDetails.id
            document.getElementById("walletDetailsDiv").style.display = "";
            document.getElementById("transactionDiv").style.display = "";
            document.getElementById("walletInputDiv").style.display = "none";

        }).catch(err => {
            err.json().then((err) => {
                displayError(err.message)
            })
        });
}

function handleTransaction(eventData) {
    eventData.preventDefault();

    // Get the form element
    const form = eventData.target;
    // Create a FormData object from the form
    const formData = new FormData(form);
    const transactionName = formData.get("transactionName");
    let transactionAmt = Number(formData.get("transactionAmt"));
    const transactionType = formData.get("transactionType");

    if (!transactionName || !transactionAmt || !transactionType) {
        displayError('Enter Correct Transaction Details')
        return;
    }
    if (transactionType === 'DEBIT' && transactionAmt > 0) {
        transactionAmt *= -1;
    }
    const reqData = { amount: transactionAmt, description: transactionName };
    console.log("reqData", reqData)
    const url = `/transact/${walletDetails.id}`;
    fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(reqData), // body data type must match "Content-Type" header
    })
        .then((response) => {
            if (response.ok)
                return response.json();
            return Promise.reject(response)
        })

        .then((transactionData) => {
            console.log("herte", transactionData)
            walletDetails.balance = transactionData.balance
            localStorage.setItem("walletDetails", JSON.stringify(walletDetails))
            document.getElementById("walletBalance").textContent = transactionData.balance;
        })
        .catch(err => {
            err.json().then((err) => {
                displayError(err.message)
            })
        })
        ;
}


function closeModal() {
    document.querySelector(".custom-model-main-walletError").classList.remove("model-open")
}

function displayError(errorMessage) {
    document.getElementById('errortext').innerText = errorMessage;
    document.querySelector(".custom-model-main-walletError").classList.add("model-open");
}


// add event handlers to submit event for wallet display and transaction amount
document.getElementById("walletDetailsForm").addEventListener("submit", handleWalletDetails);
document.getElementById("transactionForm").addEventListener("submit", handleTransaction);
document.querySelector('.close-btn-1').addEventListener('click', closeModal)
document.querySelector('.bg-overlay-1').addEventListener('click', closeModal)
