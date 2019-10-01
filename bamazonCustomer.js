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
            console.log("Sorry. Insufficient quantity. Order can't be placed");
        }
        else if(number <= result[i].STOCK_QUANTITY){
            var newStock = result[i].STOCK_QUANTITY - number;
            console.log(newStock);
            // Update new stock value
            updateTable(id, newStock);
        }
    }
        // End the connection
        connection.end();
    })
}

// Function to update new values into table
function updateTable(id, newStock){
    // var sql = "UPDATE PRODUCTS SET STOCK_QUANTITY = " + newStock;
    //             var where = "WHERE ITEM_ID = " + id;
    //             connection.query(sql, where, function (err, result) {
    //                 if (err) throw err;
    //                 console.log(result.affectedRows + " record(s) updated");
    //               });

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
                      if (error) throw err;
                      console.log("Your purchase is done!");
                      
                    }
                  );

}