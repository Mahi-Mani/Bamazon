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

    // Display Table
    displayTable();

});

// Function to display table
function displayTable(){
    // Table Header
    var table = new Table({ head: ["ITEM_ID", "PRODUCT_NAME", "DEPARTMENT_NAME", "PRICE", "STOCK_QUANTITY", "PRODUCT SALES"] });
    // SQL Query to select all values
    connection.query("SELECT * FROM PRODUCTS", function(err, result){
        if(err) throw err;

        for(var i=0; i<result.length; i++){

            table.push(
                [result[i].ITEM_ID, result[i].PRODUCT_NAME, result[i].DEPARTMENT_NAME, result[i].PRICE, result[i].STOCK_QUANTITY, result[i].PRODUCT_SALES] 
            );
            }
            // Display table to screen
            console.log(table.toString());
            // To ask question to supervisor
            askQuestion();
    })  
}

// Function to display questions
function askQuestion(){
    inquirer.prompt([
        {
            type: "list",
            message: "WHAT WOULD YOU LIKE TO DO ?",
            choices: ["VIEW PRODUCT SALES BY DEPARTMENT", "CREATE NEW DEPARTMENT"],
            name: "choice"
        }
    ]).then(function(answer){

        if(answer.choice == "VIEW PRODUCT SALES BY DEPARTMENT"){
            viewProductSales();
        }
        
    });
}

// Function to display product sales
function viewProductSales(){
    // connection.query(
    //     "SELECT DEPARTMENTS.DEPARTMENT_ID, DEPARTMENTS.DEPARTMENT_NAME,SUM(PRODUCTS.PRODUCT_SALES) FROM DEPARTMENTS INNER JOIN PRODUCTS ON DEPARTMENTS.DEPARTMENT_NAME = PRODUCTS.DEPARTMENT_NAME GROUP BY DEPARTMENTS.DEPARTMENT_NAME"
    // ),
    // // connection.query("SELECT * FROM DEPARTMENTS", 
    // function(err, result){
    //     if(err) throw err;
    //     var table = new Table({ head: ["DEPARTMENT_ID", ,"DEPARTMENT_NAME", "PRODUCT_SALES"] });

    //     for(var i=0; i<result.length; i++){
    //         console.log(result[i]);

    //         table.push(
    //             [result[i].DEPARTMENT_ID, result[i].DEPARTMENT_NAME, result[i].OVER_HEAD_COSTS] 
    //         );
    //         }
    //         // Display table to screen
    //         console.log(table.toString());
    //         // To ask question to supervisor
    //         // askQuestion();
    // } 

    var query = "SELECT DEPARTMENTS.DEPARTMENT_ID, DEPARTMENTS.DEPARTMENT_NAME, DEPARTMENTS.OVER_HEAD_COSTS, SUM(PRODUCTS.PRODUCT_SALES) AS PRODUCT_SALES, ";
        query += "(PRODUCTS.PRODUCT_SALES - DEPARTMENTS.OVER_HEAD_COSTS) AS TOTAL_PROFIT "
      query += "FROM DEPARTMENTS INNER JOIN PRODUCTS ON (DEPARTMENTS.DEPARTMENT_NAME = PRODUCTS.DEPARTMENT_NAME ";
      query += ") GROUP BY DEPARTMENTS.DEPARTMENT_NAME ORDER BY DEPARTMENTS.DEPARTMENT_ID";

      connection.query(query, 
    function(err, result){
        if(err) throw err;
        var table = new Table({ head: ["DEPARTMENT_ID", "DEPARTMENT_NAME", "OVER_HEAD_COSTS", "PRODUCT_SALES", "TOTAL_PROFIT"] });

        for(var i=0; i<result.length; i++){
            // console.log(result[i]);

            table.push(
                [result[i].DEPARTMENT_ID, result[i].DEPARTMENT_NAME, result[i].OVER_HEAD_COSTS, result[i].PRODUCT_SALES, result[i].TOTAL_PROFIT] 
            );
            }
            // Display table to screen
            console.log(table.toString());
            // To ask question to supervisor
            // askQuestion();
     
});
}