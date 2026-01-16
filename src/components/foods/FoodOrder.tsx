import { useState } from "react";
import type { MenuItem } from "../../entities/entities";

interface FoodOrderProps {
  foodItem: MenuItem;
  availableStock: number;
  onAddToCart: (foodId: number, quantity: number) => void;
  onToBack: () => void;
  onReturnToMenu: () => void;
}

function FoodOrder(props: FoodOrderProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    props.onAddToCart(props.foodItem.id, quantity);
  };

  return (
    <div className="foodOrderContainer">
      <h4 className="foodOrderTitle">{props.foodItem.name}</h4>
      <div className="foodOrderCard">
        <img
          className="foodOrderImg"
          src={`/images/${props.foodItem.image}`}
          alt={props.foodItem.name}
        />
        <p className="foodOrderDesc">{props.foodItem.desc}</p>
        <p className="foodOrderPrice">{props.foodItem.price * quantity}€</p>

        <div className="foodOrderForm">
          <div className="formGroup">
            <label htmlFor="quantity">
              Cantidad (Disponible: {props.availableStock})
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(
                    props.availableStock,
                    Math.max(1, Number(e.target.value))
                  )
                )
              }
              min="1"
              max={props.availableStock}
            />
          </div>

          <div className="buttonGroup">
            <button
              className="btnSubmit"
              onClick={handleAddToCart}
              disabled={props.availableStock === 0}
            >
              Añadir al carrito
            </button>
            <button className="btnBack" onClick={props.onToBack}>
              Volver al menú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodOrder;
