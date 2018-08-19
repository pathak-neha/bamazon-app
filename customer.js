// VARIABLES
var inquirer = require('inquirer')
var mysql = require('mysql');
var tableName = "bamazonDB.products";
var productOrdered;
var quantityOrdered;
var inventory;
var proceed = false;
var isAvailable = false;
var divider = `------------------------------------`;

// initialize app with connection to MySQL db
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    // update with password
    password: "password",
    database: "bamazonDB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    displayItems(tableName);
});

// FUNCTIONS
function displayItems(tableName) {
    // display all items
    connection.query("SELECT item_id, product_name, department_name, price FROM " + tableName, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(`ITEM # ${res[i].item_id} (Department: ${res[i].department_name})\n${res[i].product_name}, $${res[i].price}`)
        };
        console.log(divider)
        // this calls the inquirer prompts, but only after there is a result from the database
        if (res) {
            init();
        }
    });
};

function init() {
    inquirer.prompt([
        {
            name: 'selectedID',
            message: 'Which item would you like to purchase?',
        },
        {
            name: 'selectedQ',
            message: 'What quantity of the selected item would you like to purchase?'
        }
    ]).then(function (ans) {
        productOrdered = ans.selectedID;
        quantityOrdered = parseInt(ans.selectedQ);
        console.log(`Your order: ${quantityOrdered} pieces of item # ${productOrdered}\n ${divider}
        \nPlease wait for confirmation ...\n${divider}`);
        processOrder(tableName, productOrdered, quantityOrdered)
    });
};

function checkInventory(tableName, productID) {
    connection.query('SELECT stock_quantity FROM ' + tableName + ' WHERE item_id = ?', [productID], function (err, res) {
        if (err) {
            console.log(err);
            proceed = false;
        };
        inventory = res[0].stock_quantity;
        if (inventory < quantityOrdered) {
            proceed = true;
            isAvailable = false
        } else {
            proceed = true;
            isAvailable = true;
        }
    });
};

function processOrder(tableName, productID, quantity) {
    checkInventory(tableName, productID);
    
    // The rest of this function must only proceed if the database has been queried successfully.
    // In order to do this, I set an interval to keep checking a boolean that only has a value "true"
    //      after the checkInventory() function has received a response from the database. 
    //      The interval is cleared when the boolean is true.
    var checkProceed = setInterval(function () {
        console.log(`Inventory check complete? ${proceed} \n${divider}`);
        if (proceed) {
            clearInterval(checkProceed)
            
            if (isAvailable) {
                var newQ = inventory-quantityOrdered;
                connection.query(
                    "UPDATE " + tableName + " SET ? WHERE ?",
                    [
                        {
                            stock_quantity: newQ
                        },
                        {
                            item_id: productID
                        }
                    ],
                    function (err, res) {
                        console.log(`Congratulations, your order of ${quantity} units of item #${productID} was completed! \n${divider}`);
                        if (res) {
                            displayItems(tableName);
                        };
                    });
            } else {
                console.log(`Unfortunately, your order of ${quantity} units of item #${productID} could not be completed due to insufficient supplies. Please try again later. \n${divider}`);
                displayItems(tableName);
        } 
        };
    }, 1000);

};

