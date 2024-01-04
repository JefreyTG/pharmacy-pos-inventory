import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './LandingPage.css'

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [totalSale, setTotalSale]= useState(0);
  const [quantityInput, setQuantityInput] = useState(1);


  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const getProducts = async () => {
    try {
      const response = await Axios.get('http://localhost:3001/pharmacy_inventory');
      setSearchResults(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await Axios.get(`http://localhost:3001/pharmacy_inventory?search=${searchTerm}`);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToCart = (product) => {
    const newItem = {
      id: product.Id,
      product: product.Product,
      price: product.SalePrice * quantityInput,
      quantity: quantityInput,
    }

    setCart((prevCart) => [...prevCart, newItem]);
    setTotalSale((prevTotal)=> prevTotal + newItem.price);

    alert(`Producto: ${newItem.product}\nCantidad: ${newItem.quantity}\nPrecio de Venta: $${newItem.price}`);
    setQuantityInput(1);
  };

  const procesarVenta = () => {
    alert(`Venta procesada con éxito. Total Sale: $${totalSale}`);
    setCart([]);
    setTotalSale(0);
    getProducts();
  };

  const removeFromCart = (index) => {
    const removedItem = cart[index];
    setCart((prevCart) => prevCart.filter((item, i) => i !== index));
    setTotalSale((prevTotal) => prevTotal - removedItem.price);
  };

  return (
    <div className="landing-page">
      <header>
        <h1>POS System</h1>
        <p>Please search your Item</p>
      </header>

      <div className='search-products'>
        <h2>Search Products:</h2>
        <div className='input-div'>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {searchTerm && (
        <ul>
          {searchResults.map((product) => (
            <li key={product.Id}>
              {product.Product} - Cantidad: {product.Amount} - Precio: ${product.SalePrice}
              <div className='add-to-cart-container'>
                <input
                  type='number'
                  min="1"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(parseInt(e.target.value, 10) || 1)}
                />
                <button className='cart-btn' onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className='shopping-cart'>
        <h2>Shopping Cart:</h2>
        <ul>
          {cart.map((item, index) => (
            <li key={index}>
              {item.product} - Cantidad: {item.quantity} - Precio: ${item.price}
              <button className='cart-btn' onClick={() => removeFromCart(index)}>Remove</button>
            </li>
          ))}
        </ul>
        {cart.length > 0 && (
          <div>
            <p>Total Sale: ${totalSale}</p>
          <button className='cart-btn' onClick={procesarVenta}>Process Sale</button>
          </div>
        )}
      </div>

    </div>
  );
};

export default LandingPage;