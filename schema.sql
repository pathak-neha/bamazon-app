-- to create basic skeleton
DROP DATABASE IF EXISTS bamazonDB;
CREATE database bamazonDB;

USE bamazonDB;

CREATE TABLE products (
  item_id INTEGER(11) AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  stock_quantity INTEGER(100) NOT NULL,
  PRIMARY KEY (item_id)
);

SELECT * FROM bamazonDB.products;
