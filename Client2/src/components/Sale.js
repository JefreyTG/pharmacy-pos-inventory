// client/src/components/Sale.js
import React, { useState } from 'react';
import Axios from 'axios';

const Sale = () => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSale = () => {
    Axios.post('http://localhost:3001/sell', {
      product: productName,
      quantity: quantity,
    })
    .then((response) =>{console.log('Sale successful:', response.data);
  alert('Venta exitosa');})
    .catch((error) => {console.error('Error selling product:', error);
    alert('erroer al procesar la venta');});
};

return (
  <div>
    <h2>Sale</h2>
    <div>
      <label>Product Name:</label>
      <input
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />
    </div>
    <div>
      <label>Quantity:</label>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
    </div>
    <button onClick={handleSale}>Sell</button>
    </div>
  );
};

export default Sale;
