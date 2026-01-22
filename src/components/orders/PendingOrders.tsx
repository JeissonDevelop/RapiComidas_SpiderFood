import { useState } from "react";
import { useStore } from "../../store/StoreContext";
import type { Order } from "../../store/StoreContext";
import "./PendingOrders.css";

function PendingOrders() {
  const { orders, updateOrderStatus } = useStore();
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(
    new Set(),
  );

  const pendingOrders = orders.filter(
    (order: Order) => order.status === "pending",
  );

  const handleUpdateStatus = (orderId: string, status: Order["status"]) => {
    // Prevenir doble procesamiento
    if (processingOrders.has(orderId)) {
      return;
    }

    setProcessingOrders((prev) => new Set(prev).add(orderId));
    updateOrderStatus(orderId, status);

    // Limpiar después de un delay
    setTimeout(() => {
      setProcessingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }, 1000);
  };

  return (
    <div className="pendingOrders">
      <h4 className="ordersTitle">Pedidos Pendientes</h4>

      {pendingOrders.length === 0 ? (
        <p style={{ textAlign: "center", color: "#7f8c8d", padding: "20px" }}>
          No hay pedidos pendientes
        </p>
      ) : (
        <ul className="ordersList">
          {pendingOrders.map((order: Order) => {
            const isProcessing = processingOrders.has(order.id);
            return (
              <li key={order.id} className="orderItem">
                <div className="orderHeader">
                  <div>
                    <span className="orderId">Pedido #{order.id}</span>
                    <p className="customerInfo">
                      {order.customerName} - {order.customerPhone}
                    </p>
                  </div>
                  <span className="orderDate">
                    {new Date(order.date).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="orderItems">
                  {order.items.map((item, index) => (
                    <div key={index} className="orderItemDetail">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>{(item.price * item.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
                <div className="orderTotal">
                  <strong>Total: {order.total.toFixed(2)}€</strong>
                </div>
                <div className="orderActions">
                  <span className="orderStatus pending">Pendiente</span>
                  <button
                    className="btnComplete"
                    onClick={() => handleUpdateStatus(order.id, "completed")}
                    disabled={isProcessing}
                    style={
                      isProcessing
                        ? { opacity: 0.5, cursor: "not-allowed" }
                        : {}
                    }
                  >
                    Completar
                  </button>
                  <button
                    className="btnCancel"
                    onClick={() => handleUpdateStatus(order.id, "cancelled")}
                    disabled={isProcessing}
                    style={
                      isProcessing
                        ? { opacity: 0.5, cursor: "not-allowed" }
                        : {}
                    }
                  >
                    Cancelar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default PendingOrders;
