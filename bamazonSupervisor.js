// To use mysql in node.js
var sql = require("mysql");
// Inquirer to prompt question to user
var inquirer = require("inquirer");
// Import table
var Table = require('cli-table');
// For colorful console logging
const chalk = require('chalk');
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

    // Ask questions to supervisor
    checkCredentials();
});

// Function to check supervisor's credentials
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
        // Display Table
        displayTable();

    }
    else{
        console.log(chalk.red("NOT AUTHENTICATED"));
        connection.end();
    }
})
}

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
            message: violet("WHAT WOULD YOU LIKE TO DO ?"),
            choices: ["VIEW PRODUCT SALES BY DEPARTMENT", "CREATE NEW DEPARTMENT","VIEW DEPARTMENT THAT FACES LOSS", "EXIT"],
            name: "choice"
        }
    ]).then(function(answer){

        if(answer.choice == "VIEW PRODUCT SALES BY DEPARTMENT"){
            viewProductSales();
        }
        if(answer.choice == "CREATE NEW DEPARTMENT"){
            askDepartmentDetails();
        }
        if(answer.choice == "VIEW DEPARTMENT THAT FACES LOSS"){
            displayLoss();
        }
        if(answer.choice == "EXIT"){
            // End connection
            connection.end();
        }
        
    });
}

// Function to display product sales
function viewProductSales(){

    // Query to inner join two tables
    var query = "SELECT DEPARTMENTS.DEPARTMENT_ID, DEPARTMENTS.DEPARTMENT_NAME, DEPARTMENTS.OVER_HEAD_COSTS, SUM(PRODUCTS.PRODUCT_SALES) AS PRODUCT_SALES, ";
        query += "(SUM(PRODUCTS.PRODUCT_SALES) - DEPARTMENTS.OVER_HEAD_COSTS) AS TOTAL_PROFIT "
      query += "FROM DEPARTMENTS INNER JOIN PRODUCTS ON (DEPARTMENTS.DEPARTMENT_NAME = PRODUCTS.DEPARTMENT_NAME ";
      query += ") GROUP BY DEPARTMENTS.DEPARTMENT_NAME ORDER BY DEPARTMENTS.DEPARTMENT_ID";

      connection.query(query, 
    function(err, result){
        if(err) throw err;
        var table = new Table({ head: ["DEPARTMENT_ID", "DEPARTMENT_NAME", "OVER_HEAD_COSTS", "PRODUCT_SALES", "TOTAL_PROFIT"] });

        for(var i=0; i<result.length; i++){

            table.push(
                [result[i].DEPARTMENT_ID, result[i].DEPARTMENT_NAME, result[i].OVER_HEAD_COSTS, result[i].PRODUCT_SALES, result[i].TOTAL_PROFIT] 
            );
            }
            // Display table to screen
            console.log(table.toString());
            // To ask question to supervisor
            askQuestion();
     
});
}

// Function to ask department details to the supervisor
function askDepartmentDetails(){
    inquirer.prompt([
        {
        type: "input",
        message: violet("NAME OF THE DEPARTMENT YOU WANT TO ADD"),
        name: "departmentName"
        },
        {
            type: "input",
            message: violet("OVER HEAD ESTIMATED COSTS"),
            name: "overHeadCosts"
        }
    ]).then(function(answer){
        createNewDepartment(answer.departmentName, answer.overHeadCosts);
    })
}

// Function to create new department
function createNewDepartment(departmentName, overHeadCosts){
    connection.query(
        "INSERT INTO DEPARTMENTS SET ?",
        {
            DEPARTMENT_NAME: departmentName,
            OVER_HEAD_COSTS: overHeadCosts
        },
    function(err, result){
        if(err) throw err;
        console.log(chalk.yellow("\nDEPARTMENT " + departmentName.toUpperCase() + " CREATED SUCCESSFULLY!\n"));
        // Prompts to either continue or exit
        ifContinue();
    });
}

// Function that displays revenue loss
function displayLoss(){
    // Query to inner join two tables
    var query = "SELECT DEPARTMENTS.DEPARTMENT_ID, DEPARTMENTS.DEPARTMENT_NAME, DEPARTMENTS.OVER_HEAD_COSTS, SUM(PRODUCTS.PRODUCT_SALES) AS PRODUCT_SALES, ";
        query += "(SUM(PRODUCTS.PRODUCT_SALES) - DEPARTMENTS.OVER_HEAD_COSTS) AS TOTAL_PROFIT "
      query += "FROM DEPARTMENTS INNER JOIN PRODUCTS ON (DEPARTMENTS.DEPARTMENT_NAME = PRODUCTS.DEPARTMENT_NAME ";
      query += ") GROUP BY DEPARTMENTS.DEPARTMENT_NAME ORDER BY DEPARTMENTS.DEPARTMENT_ID";

      connection.query(query, 
        function(err, result){
            if(err) throw err;
            var table = new Table({ head: ["DEPARTMENT_ID", "DEPARTMENT_NAME", "OVER_HEAD_COSTS", "PRODUCT_SALES", "TOTAL_PROFIT"] });
    
            for(var i=0; i<result.length; i++){
                if(result[i].TOTAL_PROFIT < 0){    
                table.push(
                    [result[i].DEPARTMENT_ID, result[i].DEPARTMENT_NAME, result[i].OVER_HEAD_COSTS, result[i].PRODUCT_SALES, result[i].TOTAL_PROFIT] 
                );
                }
            }
                // Display table to screen
                console.log(table.toString());
                // To ask question to supervisor
                askQuestion();
         
    });

}

// Function that asks supervisor to quit or continue
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
            askQuestion();
        }
        else{
            console.log(orange("\nSEE YOU SOON!"));
            // End the connection
            connection.end();
        }
    })
}
