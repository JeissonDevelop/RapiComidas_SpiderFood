import React, { useState } from "react";
import { createOrder } from "../../services/orderService";
import Loading from "../Loading";
import { useStore } from "../../store/StoreContext";

interface FoodOrderProps {
  onReturnToMenu: () => void;
}

const FoodOrder: React.FC<FoodOrderProps> = ({ onReturnToMenu }) => {
  const { cartItems, removeFromCart, submitCart } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [removeSuccess, setRemoveSuccess] = useState(false);

  const calculateTotal = (): number => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.cartQuantity,
      0,
    );
  };

  const handleRemoveFromCart = (foodId: number) => {
    console.log(`🗑️ Removiendo producto ${foodId} del carrito`);
    removeFromCart(foodId);
    setRemoveSuccess(true);
    setTimeout(() => setRemoveSuccess(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerAddress.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (cartItems.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    setIsSubmitting(true);
    console.log("🚀 Iniciando envío de pedido...");

    try {
      const orderData = {
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.cartQuantity,
          price: item.price,
        })),
        total: calculateTotal(),
        status: "pending" as const,
      };

      const orderId = await createOrder(orderData);
      console.log("🎉 ¡Pedido creado exitosamente!", orderId);

      // Guardar en el contexto también (para historial local)
      submitCart(customerName, customerAddress);

      setOrderSuccess(true);
      setCustomerName("");
      setCustomerAddress("");

      setTimeout(() => {
        setOrderSuccess(false);
        onReturnToMenu();
      }, 3000);
    } catch (error) {
      console.error("💥 Error al crear pedido:", error);
      alert("Error al crear el pedido. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {isSubmitting && <Loading message="Creando tu pedido..." />}

      {orderSuccess && (
        <div style={successStyles}>✅ ¡Pedido creado exitosamente!</div>
      )}

      {removeSuccess && (
        <div style={successStyles}>🗑️ Producto eliminado del carrito</div>
      )}

      <h2 className="foodOrderTitle">🛒 Tu Carrito</h2>

      {cartItems.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999" }}>
          El carrito está vacío
        </p>
      ) : (
        <>
          <div className="cartItems">
            {cartItems.map((item) => (
              <div key={item.id} className="cartItem">
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    Cantidad: {item.cartQuantity} x {item.price.toFixed(2)}€
                  </p>
                </div>
                <div>
                  <span>{(item.price * item.cartQuantity).toFixed(2)}€</span>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="btnRemove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cartTotal">
            <strong>Total: {calculateTotal().toFixed(2)}€</strong>
          </div>

          <form onSubmit={handleSubmit} className="foodOrderForm">
            <div className="formGroup">
              <label htmlFor="customerName">Nombre del Cliente</label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="customerAddress">Dirección de Entrega</label>
              <input
                id="customerAddress"
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Calle Principal 123"
                required
              />
            </div>

            <div className="foodOrderButtonGroup">
              <button
                type="button"
                className="btnBack"
                onClick={onReturnToMenu}
              >
                ← Volver al Menú
              </button>
              <button
                type="submit"
                className="btnSubmit"
                disabled={isSubmitting}
              >
                ✓ Crear Pedido
              </button>
            </div>
          </form>
        </>
      )}
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

export default FoodOrder;
