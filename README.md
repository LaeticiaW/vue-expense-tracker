# vue-expense-tracker

![ScreenShot](vue-expense-tracker-client/src/assets/screenshot-dashboard.png)
![ScreenShot](vue-expense-tracker-client/src/assets/screenshot-expenses.png)
![ScreenShot](vue-expense-tracker-client/src/assets/screenshot-categories.png)

## Summary
The vue-expense-tracker application allows users to enter and report on their expenses.

Features:
* Expense Category and Subcategory definition
* Expense Management, allowing adding, updating, deleting of expenses as well as assigning expenses to categories and subcategories
* Importing expenses from a csv file, along with automatically assigning category and subcategory to the imported expenses based on predefined category mapping text
* Displays expense summary data, filtered by date and category
* Dashboard with expense category pie chart and expenses time series chart

## Tech Stack
The server application is written in Javascript, Node, Express, Mongoose/MongoDB

The client web application is written in Javascript, Vue, Vuetify, Axios, Highcharts

## Dependencies
* Node and npm, which can be installed from https://nodejs.org/en/download/
* MongoDB, which can be installed from https://docs.mongodb.com/manual/installation/ and configured to run on port 27017

## Install and run the Vue Expense Tracker web app

Before starting
>**Make sure that node and npm have been installed and that MongoDB is running locally on port 27017.  The mongo shell command should be in the user path.**

Clone the vue-expense-tracker code
```shell
git clone https://github.com/LaeticiaW/vue-expense-tracker.git
```

Change to app directory
```shell
cd vue-expense-tracker
```

Install npm packages
```shell
npm run install-server
npm run install-client
```

Create the expenseTracker MongoDB collections and load sample data.
```shell
npm run initialize-db
npm run load-data
```

Start the server app at http://localhost:3000
```shell
npm run start-server
```

Start the client web app and display in browser at http://localhost:8080

```shell
npm run start-client
```

Notes about the Web App:

* To test out the Import Expenses feature, there is a sampleImportData.csv file in the vue-expense-tracke-server/database directory.
* When filtering expense data in the app, note that the sample data expense dates are all in the year 2020

## Vue-Expense-Tracker Description

* There are 5 main menu options:  Dashboard, Categories, Manage Expenses, Expense Summary, and Imports.
* The Dashboard page displays a pie chart showing expenses by category and a time series chart showing category expenses over time.
* The Categories page allows users to View, Add, Update, and Delete categories and subcategories.
* The Manage Expenses page allows users to view/filter, add, update, and delete expenses.
* The Expense Summary page allows users to summarize expenses by date and category.
* The Import Expenses page allows importing expense transactions from a CSV file that contains 3 fields: trxDate, amount, description.  The import process will automatically set category and subcategory values for expenses if there are any category mappings that match.
   
