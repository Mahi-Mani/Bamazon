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
const orange = chalk.keyword('orange');
const violet = chalk.keyword('violet');

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
    checkCredentials();

});

// Function to check manager's credentials
function checkCredentials(){
    inquirer.prompt([
    {
        type: "input",
        message: chalk.green("ENTER YOUR USERNAME ?"),
        name: "name"
    },
    {
        type: "password",
        message: chalk.green("ENTER YOUR PASSWORD ?"),
        name: "password"
    }

]).then(function(answer){
    // Checking credentials
    if(answer.password === "root"){
        askQuestions();
    }
    else{
        console.log(chalk.red("NOT AUTHENTICATED"));
        connection.end();
    }
})
}

// Function to ask questions to manager
function askQuestions(){
    // Ask list of questions to do for manager
    inquirer.prompt([
        {
            type: "list",
            message: violet("WHAT WOULD YOU LIKE TO DO ?"),
            choices: ["VIEW PRODUCTS FOR SALE", "VIEW LOW INVENTORY", "ADD TO INVENTORY", "ADD NEW PRODUCT", "DELETE A PRODUCT", "EXIT"],
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
            addWhatNewProduct();
        }
        if(answer.choice == "DELETE A PRODUCT"){
            deleteWhichProduct();
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
    var table = new Table({ head: ["ITEM_ID", "PRODUCT_NAME", "DEPARTMENT_NAME", "PRICE", "STOCK_QUANTITY", "PRODUCT SALES"] });
    // SQL Query to select all values
    connection.query("SELECT * FROM PRODUCTS", function(err, result){
        if(err) throw err;

        for(var i=0; i<result.length; i++){
            // Construct table
            table.push(
                [result[i].ITEM_ID, result[i].PRODUCT_NAME, result[i].DEPARTMENT_NAME, result[i].PRICE, result[i].STOCK_QUANTITY, result[i].PRODUCT_SALES] 
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
        var table = new Table({ head: ["ITEM_ID", "PRODUCT_NAME", "DEPARTMENT_NAME", "PRICE", "STOCK_QUANTITY", "PRODUCT SALES"] });
        for(var i=0; i<result.length; i++){
            // Construct table
            table.push(
                [result[i].ITEM_ID, result[i].PRODUCT_NAME, result[i].DEPARTMENT_NAME, result[i].PRICE, result[i].STOCK_QUANTITY, result[i].PRODUCT_SALES] 
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
            message: violet("WHICH INVENTORY DO YOU WISH TO ADD MORE ?"),
            choices: productNameArr,
            name: "choice"
        },
        {
            type: "input",
            message: violet("HOW MANY DO YOU LIKE TO ADD ?"),
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
          console.log(chalk.yellow("\nINVENTORY ADDED\n"));
          ifContinue();
                           
        }
      );
    })
}

// Function to ask questions to manager on what stuffs to be added to the table
function addWhatNewProduct(){
    inquirer.prompt([
        {
            type: "input",
            message: violet("WHAT IS THE PRODUCT YOU WISH TO ADD ?"),
            name: "productName"
        },
        {
            type: "input",
            message: violet("WHAT IS THE CATEGORY ?"),
            name: "productCategory"
        },
        {
            type: "input",
            message: violet("HOW MUCH DOES IT COST ?"),
            name: "cost"
        },
        {
            type: "input",
            message: violet("AVAILABLE STOCK ?"),
            name: "availableStock"
        }
    ]).then(function(answer){
        // Pass manager's value to add new product function
        addNewProduct(answer.productName, answer.productCategory, answer.cost, answer.availableStock);

    })
    
}

// Function to add new product
function addNewProduct(name, category, cost, stock){
    connection.query(
        "INSERT INTO PRODUCTS SET ?",
            {
                PRODUCT_NAME: name,
                DEPARTMENT_NAME: category,
                PRICE: cost,
                STOCK_QUANTITY: stock,
                PRODUCT_SALES: 0
            },
            function(err) {
              if (err) throw err;
              console.log(chalk.yellow("\n" + name.toUpperCase() + " WAS ADDED TO THE TABLE SUCCESSFULLY\n"));

              // Prompts to either continue or exit
            ifContinue();
            });
}

// Function that asks manager to delete which product
function deleteWhichProduct(){
    inquirer.prompt([
        {
        type:"input",
        message: "ENTER THE PRODUCT ID YOU WISH TO DELETE",
        name: "id"
        }

    ]).then(function(answer){
        deleteProduct(answer.id);
    })

}

// Function that deletes a product chosen by manager
function deleteProduct(id){
    
    connection.query(
        "DELETE FROM PRODUCTS WHERE ITEM_ID = ?",[id]
    ,function(err, result){
        if(err) throw err;
        console.log(chalk.red("PRODUCT DELETED!"));
                ifContinue();
    })

}

// Function that asks manager to quit or continue
function ifContinue(){
    inquirer.prompt([
        {
            type: "confirm",
            message: violet("DO YOU WISH TO CONTINUE ?"),
            name: "answer"
        }
    ]).then(function(response){
        if(response.answer){
            // If user's answer was yes, then display table again and ask questions
            askQuestions();
        }
        else{
            console.log(orange("\nSEE YOU SOON!"));
            // End the connection
            connection.end();
        }
    })
}


