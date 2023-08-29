# Wallet System APIs Documentation

This documentation outlines the APIs and functionality of the wallet system. The system allows users to initialize wallets, perform credit and debit transactions, fetch transaction history, and retrieve wallet details.

## API Endpoints

1. **Initialize Wallet**

   - API Endpoint: `/setup`
   - Method: POST
   - Request Body:
     ```json
     {
       "balance": 10.5612,
       "name": "Wallet A"
     }
     ```
   - Response Status: 200
   - Response Body:
     ```json
     {
       "id": "64ed966b131b5b9cad902c6f",
       "balance": 10.5612,
       "name": "Wallet A",
       "date": "<JS Date obj>"
     }
     ```

2. **Credit/Debit Amount**

   - API Endpoint: `/transact/:walletId`
   - Method: POST
   - URL Params: `walletId` (ID of the wallet)
   - Request Body (Credit):
     ```json
     {
       "amount": 2.4,
       "description": "Recharge"
     }
     ```
   - Request Body (Debit):
     ```json
     {
       "amount": -5.25,
       "description": "Purchase"
     }
     ```
   - Response Status: 200
   - Response Body:
     ```json
     {
       "balance": 7.1612,
       "transactionId": "8328832323"
     }
     ```

3. **Fetch Transactions**

   - API Endpoint: `/transactions`
   - Method: GET
   - Query Parameters: `walletId`, `skip`, `limit`
   - Example Query: `/transactions?walletId=1243434&skip=10&limit=25`
   - Response Status: 200
   - Response Body (Array of Transactions):
     ```json
     [
         {
             "id": "343434",
             "walletId": "64ed966b131b5b9cad902c6f",
             "amount": 2.4,
             "balance": 7.1612,
             "description": "Recharge",
             "date": "<JS Date obj>",
             "type": "CREDIT"
         },
         {
             "id": "544521",
             "walletId": "64ed966b131b5b9cad902c6f",
             "amount": 10,
             "balance": 10.5612,
             "description": "Setup",
             "date": "<JS Date obj>",
             "type": "CREDIT"
         },
         ...
     ]
     ```

4. **Get Wallet**

   - API Endpoint: `/wallet/:id`
   - Method: GET
   - URL Params: `id` (ID of the wallet)
   - Response Status: 200
   - Response Body:
     ```json
     {
       "id": "64ed966b131b5b9cad902c6f",
       "balance": 7.1612,
       "name": "Wallet A",
       "date": "<JS Date obj>"
     }
     ```

## Running the Project

To run the project using Docker Compose and access it via a publicly accessible URL, follow these steps:

1. Make sure you have Docker and Docker Compose installed on your system.

2. Clone the project repository.

3. Open a terminal and navigate to the project directory.

4. Run the following command to build and start the containers:
   ```json
   docker-compose up --build
   ```
5. Once the containers are up and running, you can access the project at the following URL
   ```json
   http://43.205.211.164:3000/
   ```

## Web Application UI

To provide a user-friendly interface, a simple 2-page web app has been implemented. this UI is serverside rendered:

1. **Page 1: Initialize Wallet**

   - If no wallet is configured, users can enter their name, an optional initial balance, and click Submit to initialize a new wallet.
   - Wallet ID is saved in local storage for future visits.
   - Wallet balance and name are displayed using the saved wallet ID.
   - Users can navigate to Page 2 using a provided link to view transactions.

2. **Page 2: Wallet Transactions**

   - Displays a table of all transactions for the wallet.
   - Supports pagination, sorting by date, amount, type of transaction, and CSV export.

## Languages and Databases

The backend services are primarily built using Node.js. The application is a server-side rendered application. The templating engine used for rendering HTML is pug. The databases/libraries/frameworks used are

1. MongoDB
2. Express
3. Pug
4. Bootstrap CSS
