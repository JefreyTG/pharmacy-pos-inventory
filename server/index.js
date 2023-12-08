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
  database: "pharmacy_invetory",
});

app.post("/create", (req, res) => {
console.log("Request Body: ", req.body);
  const id=req.body.id;
  const product = req.body.product;
  const amount = req.body.amount;
  const price = req.body.price;

  db.query(
    "INSERT INTO inventario (Product, Amount, PurchasePrice, SalePrice) VALUES (?,?,?)",
    [product, amount, price],

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

app.get("/productos_inventario", (req, res) => {
       db.query("SELECT * FROM productos_inventario", 
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
    const price = req.body.price;
  
    db.query(
      "UPDATE productos_inventario SET Product=?, Amount=?, Price=? WHERE id=?" ,
      [product, amount, price, id],
  
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
      "DELETE FROM productos_inventario WHERE id=?",id,
  
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
