// Import mysql inside file
var sql = require("mysql");
// Import inquirer to prompt questions
var inquirer = require("inquirer");
// Import table
var Table = require('cli-table');
// For colorful console logging
const chalk = require('chalk');
// Variable Declarations
var productNameArr = [];
var stock;
var newStock;

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
    // Ask questions to manager
    askQuestions();

});

// Function to ask questions to manager
function askQuestions(){
    // Ask list of questions to do for manager
    inquirer.prompt([
        {
            type: "list",
            message: "WHAT WOULD YOU LIKE TO DO ?",
            choices: ["VIEW PRODUCTS FOR SALE", "VIEW LOW INVENTORY", "ADD TO INVENTORY", "ADD NEW PRODUCT", "EXIT"],
            name: "choice"
        }
    ]).then(function(answer){

        if(answer.choice == "VIEW PRODUCTS FOR SALE"){
            viewProducts();
        }
        if(answer.choice == "VIEW LOW INVENTORY"){
            viewLowInventory();
        }
        if(answer.choice == "ADD TO INVENTORY"){
            addToWhichInventory();
        }
        if(answer.choice == "ADD NEW PRODUCT"){
            addWhichNewProduct();
        }
        if(answer.choice == "EXIT"){
            // End connection
            connection.end();
        }
    });
}

// View all products from table
function viewProducts(){    
    // Table Header
    var table = new Table({ head: ["ITEM_ID", "PRODUCT_NAME", "DEPARTMENT_NAME", "PRICE", "STOCK_QUANTITY"] });
    // SQL Query to select all values
    connection.query("SELECT * FROM PRODUCTS", function(err, result){
        if(err) throw err;

        for(var i=0; i<result.length; i++){
            // Construct table
            table.push(
                [result[i].ITEM_ID, result[i].PRODUCT_NAME, result[i].DEPARTMENT_NAME, result[i].PRICE, result[i].STOCK_QUANTITY] 
            );
            }
            // Display table to screen
            console.log(table.toString());
            // To ask question to user
            askQuestions();
    }) 
}

// Function to display Low inventories
function viewLowInventory(){
    connection.query("SELECT * FROM PRODUCTS WHERE STOCK_QUANTITY < 5",function(err, result){
        if(err) throw err;
        var table = new Table({ head: ["ITEM_ID", "PRODUCT_NAME", "DEPARTMENT_NAME", "PRICE", "STOCK_QUANTITY"] });
        for(var i=0; i<result.length; i++){
            // Construct table
            table.push(
                [result[i].ITEM_ID, result[i].PRODUCT_NAME, result[i].DEPARTMENT_NAME, result[i].PRICE, result[i].STOCK_QUANTITY] 
            );
        }

        // Display table to screen
        console.log(table.toString());
        // To ask question to user
        askQuestions();

    })
    
}

// Function that asks manager to which inventory he/she would like to add
function addToWhichInventory(){
    // Selects product name from the table
    connection.query("SELECT * FROM PRODUCTS", function(err, result){
        if(err) throw err;
        for(var i=0; i<result.length; i++){
            // Pushes queried product names to product name array
            productNameArr.push(result[i].PRODUCT_NAME);
        }

    inquirer.prompt([
        {
            type: "list",
            message: "WHICH INVENTORY DO YOU WISH TO ADD MORE ?",
            choices: productNameArr,
            name: "choice"
        },
        {
            type: "input",
            message: "HOW MANY DO YOU LIKE TO ADD ?",
            name: "number"
        }
    ]).then(function(answer){
        // Passing manager's choice to add to inventory function
        addToInventory(answer.choice, answer.number);
    })
})
}

// Function that adds more stock to any inventory
function addToInventory(inventory, number){
    // Query to select the stock quantity of inventory selected
    connection.query("SELECT STOCK_QUANTITY FROM PRODUCTS WHERE PRODUCT_NAME=?",[inventory],function(err, result){
        if(err) throw err;
        for(var i=0; i<result.length; i++){
        stock = result[i].STOCK_QUANTITY;
        }
        newStock = parseInt(stock) + parseInt(number);

    // Query to update the stock quantity of inventory selected
    connection.query(
        "UPDATE PRODUCTS SET ? WHERE ?",
        [
          {
            STOCK_QUANTITY: newStock
          },
          {
            PRODUCT_NAME: inventory
          }
        ],
        function(error) {
          if (error) throw error;
          console.log("\nINVENTORY ADDED");
          ifContinue();
                           
        }
      );
    })
}

// Function that asks manager to quit or continue
function ifContinue(){
    inquirer.prompt([
        {
            type: "confirm",
            message: chalk.blue("DO YOU WISH TO CONTINUE ?"),
            name: "answer"
        }
    ]).then(function(response){
        if(response.answer){
            // If user's answer was yes, then display table again and ask questions
            askQuestions();
        }
        else{
            console.log(chalk.green("\nSEE YOU SOON!"));
            // End the connection
            connection.end();
        }
    })
}

