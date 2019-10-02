// To use mysql in node.js
var sql = require("mysql");
// Inquirer to prompt question to user
var inquirer = require("inquirer");
// Import table
var Table = require('cli-table');
// For colorful console logging
const chalk = require('chalk');
const orange = chalk.keyword('orange');
const violet = chalk.keyword('violet');
var amountSpent;
var productSales;

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

    // Display Table
    displayTable();

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
            message: "ENTER ITEM ID YOU WISH TO PURCHASE",
            name: "id"
        },
        {
            type: "input",
            message: "HOW MANY PRODUCTS YOU WISH TO BUY",
            name: "number"
        }

    ]).then(function(answer){
        // Passing user's answer as arguments to check function
        check(answer.id, answer.number);
    })
}

// Function to check if item is available in table
function check(id, number){
    // Selects stock_quantity from products table
    connection.query("SELECT STOCK_QUANTITY FROM PRODUCTS WHERE ITEM_ID=?",[id],function(err,result){
        if(err) throw err;
        for(var i=0; i<result.length; i++){
        
        // If stock is minium, then alerts user insufficient quantity
        if(number > result[i].STOCK_QUANTITY){
            console.log(chalk.red("\nSORRY. INSUFFICIENT QUANTITY. ORDER CAN'T BE PLACED NOW"));
            console.log(chalk.yellow("\nTRY PURCHASING OTHER STUFFS WHILE WE RELOAD!\n"));
            // For insufficient quantity, prompts user if they wish to continue
            ifContinue();
        }
        else if(number <= result[i].STOCK_QUANTITY){
            var newStock = result[i].STOCK_QUANTITY - number;
            // Update new stock value
            updateTable(id, newStock, number);
        }
    }
        
    })
}

// Function to update new values into table
function updateTable(id, newStock, number){

                  connection.query(
                    "UPDATE PRODUCTS SET ? WHERE ?",
                    [
                      {
                        STOCK_QUANTITY: newStock
                      },
                      {
                        ITEM_ID: id
                      }
                    ],
                    function(error) {
                      if (error) throw error;
                      else{
                          calcPrice(id, number);
                          
                      }
                                       
                    }
                  );

}

// Function to calculate amount spent
function calcPrice(id, number){
    connection.query(
        "SELECT PRICE FROM PRODUCTS WHERE ITEM_ID=?",[id],
        function(err, result){
            if(err) throw err;
            for(var i=0; i<result.length; i++){
            // Calculating amount spent by multiplying price and number of items purchased
            amountSpent = number  * result[i].PRICE;
            console.log(chalk.green("\nYOU PAYED " + amountSpent.toFixed(2)) + "\n"); 
            updateProductSales(amountSpent, id);
            ifContinue();

            }
        }
        
    )

}

// Function to add value to product sales table
function updateProductSales(amountSpent, id){
    // Select Product sales from table
    connection.query("SELECT PRODUCT_SALES FROM PRODUCTS WHERE ITEM_ID=?",[id], function(err, result){
        if(err) throw err;
        for(var i=0; i<result.length; i++){
        productSales = parseInt(amountSpent) + parseInt(result[i].PRODUCT_SALES);
        }

        // Updating product sales column
    connection.query(
        "UPDATE PRODUCTS SET ? WHERE ?",
        [
        {
            PRODUCT_SALES: productSales
        },
        {
            ITEM_ID: id
        }
    ],
    function(err, result){
        if(err) throw err;
        // console.log("PRODUCT SALES UPDATED");
    }
    )

    })
    
}

// Function to ask user if they wish to continue purchase
function ifContinue(){
    inquirer.prompt([
        {
            type: "confirm",
            message: violet("DO YOU WISH TO CONTINUE PURCHASE?"),
            name: "answer"
        }
    ]).then(function(response){
        if(response.answer){
            // If user's answer was yes, then display table again and ask questions
            displayTable();
        }
        else{
            console.log(orange("\nTHANK YOU! SEE YOU SOON!"));
            // End the connection
            connection.end();
        }
    })
}