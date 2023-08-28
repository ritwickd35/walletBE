let walletDetails = localStorage.getItem("walletDetails");
console.log(walletDetails)
if (!walletDetails) {
    document.getElementById("walletDetailsDiv").style.display = "none";
    document.getElementById("transactionDiv").style.display = "none";
} else {
    walletDetails = JSON.parse(walletDetails)
    console.log("got wallet details in LC", walletDetails)

    document.getElementById("walletInputDiv").style.display = "none";
    // load wallet details from BE using localstorage info
    document.getElementById("walletName").textContent = walletDetails.name;
    document.getElementById("walletBalance").textContent = walletDetails.balance;
}

function handleWalletDetails(eventData) {
    // Get the form element
    const form = eventData.target;
    // Create a FormData object from the form
    const formData = new FormData(form);
    const name = formData.get("walletName");
    const balance = formData.get("walletBalance");
    console.log("eventData", name, balance);
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
            return response.json();
        })
        .then((data) => {
            localStorage.setItem("walletDetails", JSON.stringify(data))
            document.getElementById("walletName").textContent = data.name;
            document.getElementById("walletBalance").textContent = data.balance;
            document.getElementById("walletDetailsDiv").style.display = "";
            document.getElementById("transactionDiv").style.display = "";
            document.getElementById("walletInputDiv").style.display = "none";

        });
    eventData.preventDefault();
}

function handleTransaction(eventData) {
    // Get the form element
    const form = eventData.target;
    // Create a FormData object from the form
    const formData = new FormData(form);
    const name = formData.get("transactionName");
    const transactionAmt = formData.get("transactionAmt");
    const transactionType = formData.get("transactionType");

    console.log("eventData", name, transactionAmt, transactionType);
    // const reqData = { name, balance };
    // const url = "/setup";
    // fetch(url, {
    //     method: "POST", // *GET, POST, PUT, DELETE, etc.
    //     mode: "cors", // no-cors, *cors, same-origin
    //     cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    //     credentials: "same-origin", // include, *same-origin, omit
    //     headers: {
    //         "Content-Type": "application/json",
    //         // 'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //     redirect: "follow", // manual, *follow, error
    //     referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    //     body: JSON.stringify(reqData), // body data type must match "Content-Type" header
    // })
    //     .then((response) => {
    //         return response.json();
    //     })
    //     .then((data) => {
    //         localStorage.setItem("walletdetails", JSON.stringify(data))
    //         document.getElementById("walletName").textContent = data.name;
    //         document.getElementById("walletBalance").textContent = data.balance;
    //         document.getElementById("walletDetailsDiv").style.display = "";
    //         document.getElementById("transactionDiv").style.display = "";
    //     });
    eventData.preventDefault();
}


// add event handlers to submit event for wallet display and transaction amount
document.getElementById("walletDetailsForm").addEventListener("submit", handleWalletDetails);
document.getElementById("transactionForm").addEventListener("submit", handleTransaction);
