import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Axios from "axios";
import Swal from 'sweetalert2'
import "bootstrap/dist/css/bootstrap.min.css";
import POS from "./components/POS";
import LandingPage from "./components/LandingPage";
import Inventory from "./components/Inventory"
import Sale from "./components/Sale"


function ProductForm({ product, amount, cost,  onChangeProduct, onChangeAmount, onChangeCost, onSubmit }) {
  const salePrice = parseFloat(cost) * 1.4;
  return (
    <div className="input-group mb-3">
      <span className="input-group-text" id="basic-addon1">
        Producto:
      </span>
      <input 
        type="text"
        value={product}
        onChange={onChangeProduct}
        className="form-control"
        placeholder="Nombre del producto"
        aria-label="Username"
        aria-describedby="basic-addon1"
        />

        <span className="input-group-text" id="basic-addon1">
          Cantidad:
        </span>
        <input 
        type="number"
        value={amount}
        onChange={onChangeAmount}
        className="form-control"
        placeholder="Cantidad"
        aria-label="Username"
        aria-describedby="basic-addon1"
        />
        <span className="inpu-group-text" id="basic-addon1">
          Costo:
        </span>
        <input
        type="number"
        value={cost}
        onChange={onChangeCost}              
        className="form-control"
        placeholder="Ingrese el valor de compra"
        aria-label="Username"
        aria-describedby="basic-addon1"
      />
      <span className="input-group-text" id="basic-addon1">
        Precio sugerido de venta: ${salePrice}
      </span>

      <button className="btn btn-success" onClick={onSubmit}>
        Añadir Producto al Inventario
      </button>

    </div>
  );
}

function App() {
  const [cart, setCart] = useState([]);
  const [id, setId] = useState("");
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState(0);
  const [cost, setCost] = useState("");
  const [edit, setEdit] = useState(false);
  const [productList, setProductList] = useState([]);
  const API_BASE_URL = "http://localhost:3001";


  useEffect(() => {
    // Función para obtener el inventario
    const fetchData = async () => {
      try {
        const response = await Axios.get(`${API_BASE_URL}/pharmacy_inventory`);
        setProductList(response.data || []);
      } catch (error) {
        console.error('Error al obtener el inventario:', error);
      }
    };

    
    fetchData();
  }, []);


  const salePrice = parseFloat(cost) * 1.4;

  const addOrUpdateProduct= async ()=>{
    const salePrice=parseFloat(cost) * 1.4;
    
    try{
      if(edit){
        await Axios.put(`${API_BASE_URL}/update`, {id, product, amount, cost, salePrice });
        Swal.fire({
          title:'<strong>Product Updated!!</strong>',
          html: `<i> El Producto <strong>${product}</strong> se actualizó con exito!</i>`,
          icon: 'success',
          timer: 3000,
        });
      } else {
        await Axios.post(`${API_BASE_URL}/create`, { id, product, amount, cost, salePrice });
        Swal.fire({
          title: '<strong>Producto Añadido!!</strong>',
          html: `<i> El Producto <strong>${product}</strong> se añadió con éxito al inventario</i>`,
          icon: 'success',
          timer: 3000,
        });
       }
       if (amount < 5) {
        Swal.fire({
          title: '¡Alerta!',
          text: `La cantidad de ${product} es menor a 5 unidades. Considere reponer el stock.`,
          icon: 'warning',
          timer: 6000,
        });
      }
      clearFields();
      getProducts();
    } catch (error){
      console.error('Error during the process of:', error)
    }
  };
  const getProducts=async()=>{
    try {
      const response= await Axios.get(`${API_BASE_URL}/pharmacy_inventory`);
      setProductList(response.data);
    } catch(error){
      console.error('Error al obtener inventario', error);
    }
  }
   const clearFields=()=>{
    setProduct('');
    setAmount('');
    setCost('');
    setId('');
    setEdit(false);
};

  const ProductRow = ({ val, editProduct, deleteProduct }) => {
    const salePrice = parseFloat(cost) * 1.4;

    return(
      <tr key={val.Id}>
        <td>{val.Id}</td>
        <td>{val.Product}</td>
        <td>{val.Amount}</td>
        <td>{val.Cost}</td>
        <td>{val.SalePrice}</td>
        <td>
          <div className="btn-group" role="group" aria-label="Basic example">
            <button
              type="button"
              onClick={()=>{
                editProduct(val);
              }}
              className="btn btn-info">
                Editar
              </button>
              <button 
              type="button"
              onClick={()=>{
                deleteProduct(val);
              }}
              className="btn btn-danger">
                Eliminar
              </button>
          </div>
        </td>
      </tr>
    );
  };

  const deleteProduct = (val) => {
    Swal.fire({
      title: "Seguro que desea eliminar el Producto?",
      html: `<i> El Producto <strong>${val.Product}</strong> se eliminará del inventario!</i>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Axios.delete(`${API_BASE_URL}/delete/${val.Id}`);
          getProducts();
          clearFields();

          Swal.fire({
            title: "Eliminado!",
            text: `${val.Product} ha sido eliminado.`,
            icon: "success",
            timer: 2000,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Eliminación falló!",
            footer: error.AxiosError,
          });
        }
      }
    });
  }


    
  const editProduct = (val) => {
    const { Id, Product, Amount, Cost } = val;
    setEdit(true);
    setId(Id);
    setProduct(Product);
    setAmount(Amount);
    setCost(Cost);
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart((prevCart) => [
        ...prevCart,
        {
          id: product.id,
          product: product.product,
          price: product.salePrice,
          quantity: 1,
        },
      ]);
    }
  };
 

  const handleVentaExitosa = (newInventory) => {
    // Actualiza el inventario después de una venta exitosa
    setProductList(newInventory);
    
  };
  const addProduct = async () => {
    const salePrice = parseFloat(cost) * 1.4;
    try {
      await Axios.post(`${API_BASE_URL}/create`, {
        id,
        product,
        amount,
        cost,
        salePrice,
      });
      if (amount < 5) {
        Swal.fire({
          title: "¡Alerta!",
          text: `La cantidad de ${product} es menor a 5 unidades. Considere reponer el stock.`,
          icon: "warning",
          timer: 6000,
        });
      }
      Swal.fire({
        title: "<strong>Producto Añadido!!</strong>",
        html: `<i> El Producto <strong>${product}</strong> se añadió con éxito al inventario</i>`,
        icon: "success",
        timer: 3000,
      });

    
      clearFields();   
      getProducts();
    } catch(error){
      console.error("Error adding product:", error);

    }
  };

  const update = async () => {
    const salePrice = parseFloat(cost) * 1.4;
    try {
      await Axios.put(`${API_BASE_URL}/update`, {
        id,
        product,
        amount,
        cost,
        salePrice,
      });

      Swal.fire({
        title: "<strong>Producto Actualizado!!</strong>",
        html: `<i> El Producto <strong> ${product}</strong> se actualizó con exito!</i>`,
        icon: "success",
        timer: 3000,
      });
      clearFields();
      getProducts();
    }catch(error){
      console.error("Error updating product:", error);
    }
  };


  return (
    
    <Router>
      <div className="container">
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sale" element={<Sale />} />
          <Route path="/pos" element={<POS productList={productList} cart={cart} addToCart={addToCart} onVentaExitosa={handleVentaExitosa} />} />
        </Routes>

      <div className="card text-center">
        <div className="card-header">GESTOR DE INVENTARIO</div>
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              Producto:
            </span>
            <input
              type="text"
              onChange={(event) => {
                setProduct(event.target.value);
              }}
              className="form-control"
              value={product}
              placeholder="Nombre del producto"
              aria-label="Username"
              aria-describedby="basic-addon1"
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              Cantidad:
            </span>
            <input
              type="number" value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
              }}
              className="form-control"
              placeholder="Cantidad"
              aria-label="Username"
              aria-describedby="basic-addon1"
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              Costo:
            </span>
            <input
              type="number" value={cost}
              onChange={(event) => {
                setCost(event.target.value);
                }}              
              className="form-control"
              placeholder="Ingrese el valor de compra"
              aria-label="Username"
              aria-describedby="basic-addon1"
            />
          </div>

          <div className="input-group mb-3">
                <span className="input-group-text" id="basic-addon1">
                  Precio sugerido de venta: ${salePrice}
                </span>
                
          </div>

        

        </div>

        <div className="card-footer text-muted">
          {
            edit?
            <div>
            <button className="btn btn-warning m-2" onClick={update}>Actualizar Producto </button><button className="btn btn-info m-2" onClick={clearFields}>Cancelar</button>
            </div>
            :<button className="btn btn-success" onClick={addProduct}>Añadir Producto al Inventario
          </button>

        }
         
        </div>
      </div>

      <table className="table table-striped">
      <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Producto</th>
              <th scope="col">Cantidad</th>
              <th scope="col">Precio de compra</th>
              <th scope="col">Precio de venta</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((val) => (
              <ProductRow key={val.Id} val={val} editProduct={editProduct} deleteProduct={deleteProduct} />
            ))}
          </tbody>
      </table>
    </div>
</Router>

)
};

export default App;


//Fin