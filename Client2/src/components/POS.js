import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import './POS.css';

const API_BASE_URL = 'http://localhost:3001';

const POS = ({ productList, cart =[], onVentaExitosa }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleVenta = async () => {
    try {
      // Validar antes de procesar la venta
      if (selectedProduct === '' || quantity <= 0) {
        throw new Error('Producto o cantidad no válidos');
      }

      // Lógica para procesar la venta
      const response = await axios.post(`${API_BASE_URL}/sell`, {
        product: selectedProduct,
        quantity: quantity,
      });

      // Verificar si la venta fue exitosa
      if (response.status === 200) {
        // Mensaje de éxito
        Swal.fire({
          title: 'Venta exitosa',
          text: `Se vendieron ${quantity} unidades de ${selectedProduct}`,
          icon: 'success',
          timer: 3000,
        });

        // Llama a la función proporcionada por el padre para actualizar el inventario
        onVentaExitosa();

        // Restablece los campos después de la venta
        setSelectedProduct('');
        setQuantity(1);
      } else {
        // Maneja el caso en el que la venta no fue exitosa
        throw new Error('Hubo un error al procesar la venta. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      // Manejo de errores
      console.error('Error al vender producto:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Hubo un error al procesar la venta. Por favor, inténtalo de nuevo.',
        icon: 'error',
      });
    }
  };

  return (
    <div className="pos-container">
      <h2>Venta de Productos</h2>
      <div className="input-container">
        <label htmlFor="product-select">Producto:</label>
        <select
          id="product-select"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="" disabled>
            Selecciona un producto
          </option>
          {productList.map((product) => (
            <option key={product.Id} value={product.Product}>
              {product.Product}
            </option>
          ))}
        </select>
      </div>
      <div className="input-container">
        <label htmlFor="quantity-input">Cantidad:</label>
        <input
          id="quantity-input"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>
      <button className="venta-button" onClick={handleVenta}>
        Procesar Venta
      </button>

      {/* Sección para mostrar el carrito */}
      
    </div>
  );
};

POS.propTypes = {
  productList: PropTypes.array.isRequired,
  cart: PropTypes.array.isRequired,
  onVentaExitosa: PropTypes.func.isRequired,
};

export default POS;