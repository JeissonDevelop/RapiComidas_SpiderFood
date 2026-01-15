import { useState } from "react";
import type { MenuItem } from "../../entities/entities";

interface FoodOrderProps {
  foodItem: MenuItem;
  onSubmitOrder: (foodId: number, quantity: number) => void;
  onToBack: () => void;
  onReturnToMenu: () => void;
}

function FoodOrder(props: FoodOrderProps) {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderSent, setOrderSent] = useState(false);

  const handleSubmit = () => {
    setOrderSent(true);
    props.onSubmitOrder(props.foodItem.id, quantity);
    setTimeout(() => {
      props.onReturnToMenu();
    }, 2000);
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
            <label htmlFor="quantity">Cantidad</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(
                    props.foodItem.quantity,
                    Math.max(1, Number(e.target.value))
                  )
                )
              }
              min="1"
              max={props.foodItem.quantity}
            />
          </div>

          <div className="formGroup">
            <input
              type="text"
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <input
              type="tel"
              placeholder="600 123 456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="buttonGroup">
            <button
              className="btnSubmit"
              onClick={handleSubmit}
              disabled={props.foodItem.quantity === 0}
            >
              Enviar pedido
            </button>
            <button className="btnBack" onClick={props.onToBack}>
              Volver al menú
            </button>
          </div>

          {orderSent && (
            <p className="successMessage">
              Pedido enviado. Recibirá un SMS una vez esté listo para recoger.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodOrder;
