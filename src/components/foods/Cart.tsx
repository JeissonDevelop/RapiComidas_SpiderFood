import { useState } from "react";
import { useStore } from "../../store/StoreContext";

function Cart() {
  // Obtenemos carrito y acciones globales vía contexto
  const { cartItems, removeFromCart, submitCart, cancelCart } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderSent, setOrderSent] = useState(false);
  const [validationError, setValidationError] = useState("");

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0,
  );

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      setValidationError("Completa nombre y teléfono para enviar el pedido.");
      return;
    }
    setValidationError("");
    setOrderSent(true);
    submitCart(name, phone);
    setTimeout(() => {
      setOrderSent(false);
      setName("");
      setPhone("");
    }, 2000);
  };

  if (cartItems.length === 0 && !orderSent) {
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
            {cartItems.map((item) => (
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
                  onClick={() => removeFromCart(item.id)}
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

            {validationError && <p className="formError">{validationError}</p>}

            <div className="buttonGroup">
              <button className="btnSubmit" onClick={handleSubmit}>
                Enviar pedido
              </button>
              <button className="btnCancel" onClick={cancelCart}>
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
