import React, { useState } from "react";
import { useStore } from "../../store/StoreContext";
import type { MenuItem } from "../../entities/entities";
import Loading from "../Loading";

interface FoodDetailProps {
  foodItem: MenuItem;
  availableStock: number;
  totalStock: number;
  onToBack: () => void;
}

const FoodDetail: React.FC<FoodDetailProps> = ({
  foodItem,
  availableStock,
  onToBack,
}) => {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const handleAddToCart = async () => {
    if (quantity > 0 && quantity <= availableStock) {
      setIsAdding(true);
      console.log(`📦 Agregando al carrito: ${foodItem.name} x${quantity}`);

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        addToCart(foodItem.id, quantity);
        console.log(`✅ ${foodItem.name} x${quantity} agregado al carrito`);

        setIsAdding(false);
        setAddSuccess(true);

        setTimeout(() => {
          setAddSuccess(false);
          onToBack();
        }, 1500);
      } catch (error) {
        console.error("❌ Error al agregar al carrito:", error);
        alert("Error al agregar el producto al carrito");
        setIsAdding(false);
      }
    }
  };

  return (
    <div className="foodDetailContainer">
      {isAdding && <Loading message={`Agregando ${foodItem.name}...`} />}

      {addSuccess && (
        <div style={successStyles}>
          ✅ Producto agregado al carrito exitosamente
        </div>
      )}

      <button className="btnBackDetail" onClick={onToBack}>
        ← Volver al menú
      </button>

      <div className="foodDetailCard">
        <div className="foodDetailImageContainer">
          <img
            src={foodItem.image}
            alt={foodItem.name}
            className="foodDetailImage"
          />
        </div>

        <div className="foodDetailContent">
          <h2 className="foodDetailName">{foodItem.name}</h2>

          <p className="foodDetailDesc">{foodItem.desc}</p>

          <div className="foodDetailInfo">
            <div className="priceSection">
              <span className="priceLabel">Precio:</span>
              <span className="priceValue">{foodItem.price.toFixed(2)}€</span>
            </div>

            <div className="stockSection">
              <span className="stockLabel">Stock disponible:</span>
              <span
                className={`stockValue ${
                  availableStock === 0 ? "outOfStock" : ""
                }`}
              >
                {availableStock === 0 ? "Sin stock" : `${availableStock}`}
              </span>
            </div>
          </div>

          {availableStock > 0 && (
            <div className="quantitySection">
              <label htmlFor="quantity">Cantidad:</label>
              <div className="quantityControls">
                <button
                  className="btnQty"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isAdding}
                >
                  −
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={availableStock}
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 0 && val <= availableStock) {
                      setQuantity(val);
                    }
                  }}
                  disabled={isAdding}
                  className="quantityInput"
                />
                <button
                  className="btnQty"
                  onClick={() =>
                    setQuantity(Math.min(availableStock, quantity + 1))
                  }
                  disabled={isAdding}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            className="btnAddToCart"
            onClick={handleAddToCart}
            disabled={
              availableStock === 0 || isAdding || quantity > availableStock
            }
          >
            {availableStock === 0
              ? "❌ Sin Stock"
              : isAdding
                ? "Agregando..."
                : `✓ Agregar ${quantity} al Carrito`}
          </button>
        </div>
      </div>
    </div>
  );
};

const successStyles = {
  position: "fixed" as const,
  top: "20px",
  right: "20px",
  background: "#27ae60",
  color: "white",
  padding: "15px 25px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  zIndex: 10000,
  fontSize: "16px",
  fontWeight: "bold" as const,
};

export default FoodDetail;
