// client/src/components/Inventory.js
import React, { useState, useEffect } from 'react';
import Axios from 'axios';

const Inventory = () => {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading]=useState(true);

  useEffect(() => {
    const getProducts=async()=>{
      try {
        const response = await Axios.get('http://localhost:3001/pharmacy_inventory');
        setProductList(response.data?.data || []);
        setIsLoading(false);
      } catch (error){
        console.error('Error recuperando Productos:', error);
        setIsLoading(false);
      }
    };
  

    getProducts();
  }, []);

  return (
    <div>
      <h2>Inventory</h2> 
      {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <ul>
        {productList.map((product) => (
          <li key={product.Id}>
            {product.Product} - Amount: {product.Amount} - Cost: {product.Cost}
          </li>
        ))}
      </ul>
        )}      
    </div>
  );
};

export default Inventory;
