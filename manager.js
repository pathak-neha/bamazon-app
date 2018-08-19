// VARIABLES
var inquirer = require('inquirer')
var mysql = require('mysql');
var tableName = "bamazonDB.products";
var divider = `------------------------------------`;

var options = ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']

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
    initializeApp(options);
});

function initializeApp(options) {
    inquirer.prompt([
        {
            type: 'rawlist',
            name: 'choice',
            message: 'What would you like to do?',
            choices: [options[0], options[1], options[2], options[3]]
        }
    ]).then(function (ans) {
        choice = ans.choice;

        if (options.indexOf(choice) === 0) {
            connection.query("SELECT * FROM " + tableName, function (err, res) {
                if (err) throw err;
                console.log(`All items for sale:\n`)
                for (var i = 0; i < res.length; i++) {
                    console.log(`ITEM # ${res[i].item_id} (Department: ${res[i].department_name})\n${res[i].product_name} | Price: $${res[i].price} | Inventory: ${res[i].stock_quantity}`)
                };
                console.log(divider)
                if (res) {
                    initializeApp(options);
                };
            });
        }

        if (options.indexOf(choice) === 1) {
            connection.query(`SELECT * FROM ${tableName} WHERE stock_quantity < 5`, function (err, res) {
                if (err) throw err;
                console.log(`Items with low inventory:\n`)
                for (var i = 0; i < res.length; i++) {
                    console.log(`ITEM # ${res[i].item_id} (Department: ${res[i].department_name})\n${res[i].product_name} | Price: $${res[i].price} | Inventory: ${res[i].stock_quantity}`)
                };
                console.log(divider)
                if (res) {
                    initializeApp(options);
                };
            });
        }

        if (options.indexOf(choice) === 2) {
            inquirer.prompt([
                {
                    name: 'editProd',
                    message: 'Enter the product ID that you would like to update:'
                },
                {
                    name: 'editQ',
                    message: 'Add the number of additional units in inventory:'
                }
            ]).then(function (ans) {
                var editProd = parseInt(ans.editProd);
                var editQ = parseInt(ans.editQ);

                connection.query(`SELECT stock_quantity FROM ${tableName} WHERE item_id = ?`, [editProd], function (err, res) {
                    if (err) throw err;
                    var oldInv = res[0].stock_quantity
                    var newQ = oldInv + editQ;
                    connection.query(
                        "UPDATE " + tableName + " SET ? WHERE ?",
                        [
                            {
                                stock_quantity: newQ
                            },
                            {
                                item_id: editProd
                            }
                        ],
                        function (err, res) {
                            if (err) throw err;
                            console.log(`Product ID ${editProd} has been updated. ${editQ} units added, new total inventory = ${newQ}. \n${divider}`);
                            if (res) {
                                initializeApp(options);
                            };
                        });
                });

               
            })
        }

        if (options.indexOf(choice) === 3) {
            inquirer.prompt([
                {
                    name: 'addProd',
                    message: 'Enter product name:'
                },
                {
                    name: 'addDept',
                    message: 'Enter department name:'
                },
                {
                    name: 'addQ',
                    message: 'Enter product quantity:'
                },
                {
                    name: 'addPrice',
                    message: 'Enter product cost:'
                },
            ]).then(function (ans) {
                var addProd = ans.addProd
                var addDept = ans.addDept
                var addQ = parseInt(ans.addQ)
                var addPrice = parseFloat(ans.addPrice)
                connection.query(
                    `INSERT INTO ${tableName} SET ?`,
                    {
                        product_name: addProd,
                        department_name: addDept,
                        price: addPrice,
                        stock_quantity: addQ
                    },
                    function (err, res) {
                        console.log(res.affectedRows + " product inserted!\n");
                        if (res) {
                            initializeApp(options);
                        };
                    });
            })


        }
    })
}