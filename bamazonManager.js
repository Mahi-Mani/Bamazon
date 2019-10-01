// Import mysql inside file
var sql = require("mysql");
// Import inquirer to prompt questions
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

