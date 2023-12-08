const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pharmacy_inventory",
});

app.post("/create", (req, res) => {
console.log("Request Body: ", req.body);
  const id=req.body.id;
  const product = req.body.product;
  const amount = req.body.amount;
  const purchasePrice = req.body.purchasePrice;
  const salePrice = req.body.salePrice;

  db.query(
    "INSERT INTO inventory (Product, Amount, PurchasePrice, SalePrice) VALUES (?,?,?,?)",
    [product, amount, purchasePrice, salePrice],

    (err, result) => {
      if (err) {
        console.log("Error", err);
          res.status(500).send("Error al añadir el producto");
        } else {
          console.log("Insert successful");
          res.send(result);
        }        
      }
     );
});

app.get("/pharmacy_inventory", (req, res) => {
       db.query("SELECT * FROM inventory", 
      (err, result) => {
        if (err) {
          console.log(err);
            
          } else {
            res.send(result);
          }        
        }
      );
}); 

app.put("/update", (req, res) => {
    const id=req.body.id;
    const product = req.body.product;
    const amount = req.body.amount;
    const purchasePrice = req.body.purchasePrice;
    const salePrice=req.body.salePrice;
  
    db.query(
      "UPDATE inventory SET Product=?, Amount=?, PurchasePrice=?, SalePrice=? WHERE id=?"
      [product, amount, purchasePrice, salePrice, id],
  
      (err, result) => {
        if (err) {
          console.log("Error", err);
            res.status(500).send("Error al añadir el producto");
          } else {
            console.log("Insert successful");
            res.send(result);
          }        
        }
       );
  });

  app.delete("/delete/:id", (req, res) => {
    const id=req.params.id;
    
    db.query(
      "DELETE FROM inventory WHERE id=?",id,
  
      (err, result) => {
        if (err) {
          console.log("Error", err);
            res.status(500).send("Error al eliminar el producto");
          } else {
            console.log("Insert successful");
            res.send(result);
          }        
        }
       );
  });


      
  
app.listen(3001, () => {
  console.log("Corriendo en el puerto 3001");
});
