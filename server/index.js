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
  const searchTerm = req.query.search || '';

  getInventory((err, result) => {
    if (err) {
      res.status(500).send("Error al obtener el inventario");
    } else {
      const filteredResults = result.filter(product => product.Product.toLowerCase().includes(searchTerm.toLowerCase()));
      res.send(filteredResults);
    }
  });
});


app.post("/create", (req, res) => {
  const { product, amount, cost, salePrice } = req.body;

  // Verifica que se proporcionen los datos necesarios
  if (!product || !amount || !cost || !salePrice) {
    return res.status(400).json({ error: "Se requieren todos los campos para crear un nuevo producto" });
  }

  // Realiza la inserción del nuevo producto en la base de datos
  db.query(
    "INSERT INTO inventory (Product, Amount, Cost, SalePrice) VALUES (?, ?, ?, ?)",
    [product, amount, cost, salePrice],
    (err, result) => {
      if (err) {
        console.error("Error al crear un nuevo producto:", err);
        return res.status(500).json({ error: "Error al crear un nuevo producto" });
      }

      // Después de la creación exitosa, devuelve el nuevo inventario
      getInventory((inventoryErr, inventoryResult) => {
        if (inventoryErr) {
          return res.status(500).json({ error: "Error al obtener el inventario después de la creación" });
        }

        res.status(200).json(inventoryResult);
      });
    }
  );
});

// ...


app.post("/sell", (req, res) => {
  const saleItems = req.body;

  // Process each sale item
  saleItems.forEach(async (saleItem) => {
    const { product, quantity } = saleItem;

    // Check if there are enough items in the inventory for the sale
    const inventoryCheck = await new Promise((resolve) => {
      db.query("SELECT * FROM inventory WHERE Product=?", [product], (err, result) => {
        if (err) {
          console.error("Error al obtener información del producto:", err);
          resolve({ success: false, message: "Error al procesar la venta" });
        } else {
          if (result.length === 0 || result[0].Amount < quantity) {
            resolve({ success: false, message: "Producto no disponible o cantidad insuficiente" });
          } else {
            // Deduct the sold quantity from the inventory
            const newQuantity = result[0].Amount - quantity;
            db.query("UPDATE inventory SET Amount=? WHERE Product=?", [newQuantity, product], (err, updateResult) => {
              if (err) {
                console.error("Error al actualizar el inventario:", err);
                resolve({ success: false, message: "Error al procesar la venta" });
              } else {
                resolve({ success: true, message: "Venta procesada con éxito" });
              }
            });
          }
        }
      });
    });

    // Check the result of the inventory check and respond accordingly
    if (!inventoryCheck.success) {
      res.status(400).send(inventoryCheck.message);
    }
  });
});


app.listen(3001, () => {
  console.log("Corriendo en el puerto 3001");
});

app.delete("/delete/:productId", (req, res) => {
  const productId = req.params.productId;

  // Verifica que se proporcione el ID del producto
  if (!productId) {
    return res.status(400).json({ error: "Se requiere el ID del producto para eliminarlo" });
  }

  // Realiza la eliminación del producto en la base de datos
  db.query("DELETE FROM inventory WHERE id=?", [productId], (err, result) => {
    if (err) {
      console.error("Error al borrar el producto:", err);
      return res.status(500).json({ error: "Error al borrar el producto" });
    }

    // Después de la eliminación exitosa, devuelve el nuevo inventario
    getInventory((inventoryErr, inventoryResult) => {
      if (inventoryErr) {
        return res.status(500).json({ error: "Error al obtener el inventario después de la eliminación" });
      }

      res.status(200).json(inventoryResult);
    });
  });
});

app.put("/update", (req, res) => {
  const { id, product, amount, cost, salePrice } = req.body;

  // Validate that required fields are provided
  if (!id || !product || !amount || !cost || !salePrice) {
    return res.status(400).json({ error: "All fields are required for updating a product" });
  }

  // Check if the product with the given ID exists
  db.query("SELECT * FROM inventory WHERE id=?", [id], (err, result) => {
    if (err) {
      console.error("Error checking product existence:", err);
      return res.status(500).json({ error: "Error checking product existence" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update the product in the database
    db.query(
      "UPDATE inventory SET Product=?, Amount=?, Cost=?, SalePrice=? WHERE id=?",
      [product, amount, cost, salePrice, id],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating product:", updateErr);
          return res.status(500).json({ error: "Error updating product" });
        }

        // Optionally, you can fetch the updated inventory and send it as a response
        getInventory((inventoryErr, inventoryResult) => {
          if (inventoryErr) {
            return res.status(500).json({ error: "Error fetching updated inventory" });
          }

          res.status(200).json(inventoryResult);
        });
      }
    );
  });
});
