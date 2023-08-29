

function displayError(errorMessage) {
    document.getElementById('errortext').innerText = errorMessage;
    document.querySelector(".custom-model-main-walletError").classList.add("model-open");
}


document.addEventListener('DOMContentLoaded', init, false);

document.getElementById('maxRows').addEventListener("change", (event) => {
    pageSize = Number(event.target.value);
    curPage = 1
    if (pageSize >= tableData.length) document.getElementById('paginator').style.display = 'none'
    else document.getElementById('paginator').style.display = ''
    renderTable()

})

let tableData, table, sortCol;
let sortAsc = false;
let pageSize = 3;
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
                if (pageSize >= tableData.length) document.getElementById('paginator').style.display = 'none'
                else document.getElementById('paginator').style.display = ''
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

function downloadCSV(event) {
    const csvString = "data:text/csv;charset=utf-8," + [
        [
            "Amount",
            "Type",
            "Description",
            "Date",
            "Balance",
        ],
        ...tableData.map(item => [
            item.amount,
            item.type,
            item.description,
            item.date,
            item.balance,
        ])
    ].map(e => e.join(","))
        .join("\n");;

    const encodedUri = encodeURI(csvString);
    var link = document.createElement("a");
    link.style.display = 'none';
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);

    link.click();
}