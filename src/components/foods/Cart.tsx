import { useState } from "react";
import type { MenuItem } from "../../entities/entities";

interface CartItem extends MenuItem {
  cartQuantity: number;
}

interface CartProps {
  cartItems: CartItem[];
  onRemoveItem: (foodId: number) => void;
  onSubmitOrder: (name: string, phone: string) => void;
  onCancelOrder: () => void;
  onBackToFoods: () => void;
}

function Cart(props: CartProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderSent, setOrderSent] = useState(false);

  const totalPrice = props.cartItems.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );

  const handleSubmit = () => {
    setOrderSent(true);
    props.onSubmitOrder(name, phone);
    setTimeout(() => {
      setOrderSent(false);
      setName("");
      setPhone("");
    }, 2000);
  };

  if (props.cartItems.length === 0 && !orderSent) {
    return (
      <div className="cartContainer">
        <h4 className="cartTitle">Carrito</h4>
        <p className="emptyCart">El carrito está vacío</p>
      </div>
    );
  }

  return (
    <div className="cartContainer">
      <h4 className="cartTitle">Carrito</h4>
      {!orderSent ? (
        <>
          <ul className="cartList">
            {props.cartItems.map((item) => (
              <li key={item.id} className="cartItem">
                <div className="cartItemInfo">
                  <p className="cartItemName">{item.name}</p>
                  <p className="cartItemQty">Cantidad: {item.cartQuantity}</p>
                  <p className="cartItemPrice">
                    {item.price}€ x {item.cartQuantity} ={" "}
                    {item.price * item.cartQuantity}€
                  </p>
                </div>
                <button
                  className="btnRemove"
                  onClick={() => props.onRemoveItem(item.id)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>

          <div className="cartTotal">
            <p>Total: {totalPrice}€</p>
          </div>

          <div className="cartForm">
            <div className="formGroup">
              <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="formGroup">
              <input
                type="tel"
                placeholder="Teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="buttonGroup">
              <button className="btnSubmit" onClick={handleSubmit}>
                Enviar pedido
              </button>
              <button className="btnCancel" onClick={props.onCancelOrder}>
                Cancelar pedido
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="successMessage">
          Pedido enviado. Recibirá un SMS una vez esté listo para recoger.
        </p>
      )}
    </div>
  );
}

export default Cart;
