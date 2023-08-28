console.log("IN TRANSACTIONS", walletId)


function displayError(errorMessage) {
    document.getElementById('errortext').innerText = errorMessage;
    document.querySelector(".custom-model-main-walletError").classList.add("model-open");
}


document.addEventListener('DOMContentLoaded', init, false);

let tableData, table, sortCol;
let sortAsc = false;
const pageSize = 3;
let curPage = 1;

function init() {
    // Select the table (well, tbody)
    table = document.querySelector('#transactTable tbody');
    // get the cats
    if (walletId) {
        fetch('/transactions?walletId=' + walletId)
            .then((response) => {
                if (response.ok)
                    return response.json();
                return Promise.reject(response)
            })
            .then((resData) => {
                tableData = resData
                renderTable()
                // listen for sort clicks
                document.querySelectorAll('#transactTable thead tr th').forEach(t => {
                    t.addEventListener('click', sort, false);
                });

                document.querySelector('#nextButton').addEventListener('click', nextPage, false);
                document.querySelector('#prevButton').addEventListener('click', previousPage, false);
            }).catch(err => {
                err.json().then((err) => {
                    displayError(err.message)
                })
            });
    }


}

function renderTable() {
    // create html
    let result = '';
    tableData.filter((row, index) => {
        let start = (curPage - 1) * pageSize;
        let end = curPage * pageSize;
        if (index >= start && index < end) return true;
    }).forEach(c => {
        result += `<tr>
     <td>${c.amount}</td>
     <td>${c.type}</td>
     <td>${c.description}</td>
     <td>${c.date}</td>
     <td>${c.balance}</td>
     </tr>`;
    });
    document.querySelector('#transactTable tbody').innerHTML = result;
}

function sort(e) {
    let thisSort = e.target.dataset.sort;
    if (sortCol === thisSort) sortAsc = !sortAsc;
    sortCol = thisSort;
    console.log('sort dir is ', sortAsc, sortCol);
    tableData.sort((a, b) => {
        if (Number(a[sortCol]) && Number(b[sortCol])) {
            a = Number(a[sortCol])
            b = Number(b[sortCol])
            if (sortAsc) {
                return a - b
            }

            return b - a
        }
        else
            if (sortAsc) {
                return a[sortCol] > b[sortCol] ? 1 : -1
            }

        return b[sortCol] > a[sortCol] ? 1 : -1
    });
    console.log(tableData.map((data) => data[sortCol]))
    renderTable();
}

function previousPage() {
    if (curPage > 1) curPage--;
    renderTable();
}

function nextPage() {
    if ((curPage * pageSize) < tableData.length) curPage++;
    renderTable();
}