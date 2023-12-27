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

// Función para obtener el inventario
function getInventory(callback) {
  db.query("SELECT * FROM inventory", (err, result) => {
    if (err) {
      console.error("Error al obtener el inventario:", err);
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
}

app.get("/pharmacy_inventory", (req, res) => {
  getInventory((err, result) => {
    if (err) {
      res.status(500).send("Error al obtener el inventario");
    } else {
      res.send(result);
    }
  });
});

app.post("/sell", (req, res) => {
  const product = req.body.product;
  const quantity = req.body.quantity;

  // Verifica si hay suficientes existencias para realizar la venta
  db.query("SELECT * FROM inventory WHERE Product=?", [product], (err, result) => {
    if (err) {
      console.error("Error al obtener información del producto:", err);
      res.status(500).send("Error al procesar la venta");
    } else {
      if (result.length === 0 || result[0].Amount < quantity) {
        res.status(400).send("Producto no disponible o cantidad insuficiente");
      } else {
        // Realiza la venta y actualiza la cantidad en el inventario
        const newQuantity = result[0].Amount - quantity;
        db.query("UPDATE inventory SET Amount=? WHERE Product=?", [newQuantity, product], (err, updateResult) => {
          if (err) {
            console.error("Error al actualizar el inventario:", err);
            res.status(500).send("Error al procesar la venta");
          } else {
            // Después de una venta exitosa, devuelve el nuevo inventario
            getInventory((inventoryErr, inventoryResult) => {
              if (inventoryErr) {
                res.status(500).send("Error al obtener el inventario después de la venta");
              } else {
                res.status(200).send(inventoryResult);
              }
            });
          }
        });
      }
    }
  });
});

app.listen(3001, () => {
  console.log("Corriendo en el puerto 3001");
});
