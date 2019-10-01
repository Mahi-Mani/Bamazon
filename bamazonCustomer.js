// To use mysql in node.js
var sql = require("mysql");
// Inquirer to prompt question to user
var inquirer = require("inquirer");
// Import table
var Table = require('cli-table');

// Create connection
var connection = sql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Indeed@123",
    database: "BAMAZON"
});

// Establish connection
connection.connect(function(err){
    // Throws error if found
    if(err) throw err;
    // console.log("Connected with id " + connection.threadId);
    // Display Table
    displayTable();
    // End the connection
    connection.end();

});

// Function to display table
function displayTable(){
    // Table Header
    var table = new Table({ head: ["ITEM_ID", "PRODUCT_NAME", "DEPARTMENT_NAME", "PRICE", "STOCK_QUANTITY"] });
    // SQL Query to select all values
    connection.query("SELECT * FROM PRODUCTS", function(err, result){
        if(err) throw err;

        for(var i=0; i<result.length; i++){

            table.push(
                [result[i].ITEM_ID, result[i].PRODUCT_NAME, result[i].DEPARTMENT_NAME, result[i].PRICE, result[i].STOCK_QUANTITY] 
            );
            }
            // Display table to screen
            console.log(table.toString());
            // To ask question to user
            askQuestion();
    })  
}

// Function to ask question to user
function askQuestion(){
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the item_id you wish to buy",
            name: "id"
        },
        {
            type: "input",
            message: "How many products you wish to buy",
            name: "number"
        }

    ]).then(function(answer){
        console.log(answer.id);
        console.log(answer.number);
        check(answer.id, answer.number);
    })
}

// Function to check if item is available in table
function check(id, number){
    connection.query("SELECT STOCK_QUANTITY FROM PRODUCTS WHERE ITEM_ID=?",[answer.id],function(err,result){
        if(err) throw err;
        console.log(result);
    })
}