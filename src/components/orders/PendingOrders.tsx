import React, { useEffect, useState } from "react";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  type FirebaseOrder,
  updateOrderAddress,
} from "../../services/orderService";
import Loading from "../Loading";
import "./PendingOrders.css";

type OrderStatus = "pending" | "completed" | "cancelled";

const PendingOrders: React.FC = () => {
  const [orders, setOrders] = useState<FirebaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>("pending");
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      console.log("📥 Cargando pedidos...");
      setLoading(true);
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      alert("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (orderId: string) => {
    if (!orderId) return;

    setActionLoading(orderId);
    console.log(`✅ Completando pedido ${orderId}`);

    try {
      await updateOrderStatus(orderId, "completed");
      await loadOrders();
      setSuccessMessage("✅ Pedido completado exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error al completar pedido:", error);
      alert("Error al completar el pedido");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!orderId) return;

    if (!confirm("¿Estás seguro de cancelar este pedido?")) return;

    setActionLoading(orderId);
    console.log(`❌ Cancelando pedido ${orderId}`);

    try {
      await updateOrderStatus(orderId, "cancelled");
      await loadOrders();
      setSuccessMessage("❌ Pedido cancelado exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
      alert("Error al cancelar el pedido");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    const ordersToDelete = getOrdersByStatus(activeStatus);

    if (ordersToDelete.length === 0) {
      alert("No hay pedidos para eliminar");
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar todos los ${ordersToDelete.length} pedidos ${statusConfig[activeStatus].label.toLowerCase()}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setActionLoading("deleting-all");
    console.log(`🗑️ Eliminando todos los pedidos ${activeStatus}`);

    try {
      for (const order of ordersToDelete) {
        if (order.id) {
          await deleteOrder(order.id);
        }
      }
      console.log("✅ Todos los pedidos fueron eliminados");
      await loadOrders();
      setSuccessMessage(
        `🗑️ ${ordersToDelete.length} pedidos eliminados exitosamente`,
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error al eliminar pedidos:", error);
      alert("Error al eliminar los pedidos");
    } finally {
      setActionLoading(null);
    }
  };

  const getOrdersByStatus = (status: OrderStatus): FirebaseOrder[] => {
    return orders.filter((order) => order.status === status);
  };

  const statusConfig = {
    pending: { label: "⏳ Pendientes", color: "#ff9800" },
    completed: { label: "✅ Completados", color: "#4caf50" },
    cancelled: { label: "❌ Cancelados", color: "#f44336" },
  };

  const currentOrders = getOrdersByStatus(activeStatus);

  if (loading) {
    return <Loading message="Cargando pedidos..." />;
  }

  const handleStartEditAddress = (order: FirebaseOrder) => {
    if (!order.id) return;
    setEditingOrderId(order.id);
    setAddressDraft(order.customerAddress);
  };

  const handleCancelEditAddress = () => {
    setEditingOrderId(null);
    setAddressDraft("");
  };

  const handleSaveAddress = async (orderId: string) => {
    if (!orderId) return;
    const nextAddress = addressDraft.trim();
    if (!nextAddress) {
      alert("La dirección no puede estar vacía");
      return;
    }

    setActionLoading(orderId);
    try {
      await updateOrderAddress(orderId, nextAddress);
      await loadOrders();
      handleCancelEditAddress();
      setSuccessMessage("✅ Dirección actualizada exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error al actualizar dirección:", error);
      alert("Error al actualizar la dirección");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="pendingOrders">
      {successMessage && <div style={successStyles}>{successMessage}</div>}

      <h2 className="ordersTitle">📋 Gestión de Pedidos</h2>

      <div className="statusTabs">
        {(Object.keys(statusConfig) as OrderStatus[]).map((status) => (
          <button
            key={status}
            className={`statusTab ${activeStatus === status ? "active" : ""}`}
            onClick={() => setActiveStatus(status)}
          >
            {statusConfig[status].label}
            <span className="tabCount">{getOrdersByStatus(status).length}</span>
          </button>
        ))}
      </div>

      {(activeStatus === "completed" || activeStatus === "cancelled") &&
        currentOrders.length > 0 && (
          <button
            className="btnDeleteAll"
            onClick={handleDeleteAll}
            disabled={actionLoading === "deleting-all"}
          >
            {actionLoading === "deleting-all"
              ? "🗑️ Eliminando..."
              : `🗑️ Borrar todos (${currentOrders.length})`}
          </button>
        )}

      {currentOrders.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999", fontSize: "18px" }}>
          No hay pedidos en estado{" "}
          {statusConfig[activeStatus].label.toLowerCase()}
        </p>
      ) : (
        <ul className="ordersList">
          {currentOrders.map((order) => (
            <li key={order.id} className="orderItem">
              <div className="orderHeader">
                <div>
                  <span className="orderId">
                    Pedido #{order.id?.slice(-6).toUpperCase()}
                  </span>
                  <p className="customerInfo">
                    👤 {order.customerName}
                    <br />
                    {editingOrderId === order.id ? (
                      <>
                        📍{" "}
                        <input
                          type="text"
                          value={addressDraft}
                          onChange={(e) => setAddressDraft(e.target.value)}
                        />
                        <button
                          className="btnComplete"
                          onClick={() => handleSaveAddress(order.id!)}
                          disabled={actionLoading === order.id}
                        >
                          {actionLoading === order.id ? "..." : "✓ Guardar"}
                        </button>
                        <button
                          className="btnCancel"
                          onClick={handleCancelEditAddress}
                        >
                          ✕ Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        📍 {order.customerAddress}
                        {activeStatus === "pending" && (
                          <button
                            className="btnEdit"
                            onClick={() => handleStartEditAddress(order)}
                          >
                            ✏️
                          </button>
                        )}
                      </>
                    )}
                  </p>
                </div>
                <div className="orderDate">
                  {order.createdAt.toLocaleDateString("es-ES")}
                  <br />
                  {order.createdAt.toLocaleTimeString("es-ES")}
                </div>
              </div>

              <div className="orderItems">
                {order.items.map((item, index) => (
                  <div key={index} className="orderItemDetail">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>{item.price.toFixed(2)}€</span>
                    <span>{(item.price * item.quantity).toFixed(2)}€</span>
                  </div>
                ))}
              </div>

              <div className="orderTotal">
                <strong>Total: {order.total.toFixed(2)}€</strong>
              </div>

              <div className="orderActions">
                <span
                  className={`orderStatus ${activeStatus}`}
                  style={{ backgroundColor: statusConfig[activeStatus].color }}
                >
                  {statusConfig[activeStatus].label}
                </span>
                {activeStatus === "pending" && (
                  <>
                    <button
                      className="btnComplete"
                      onClick={() => handleComplete(order.id!)}
                      disabled={actionLoading === order.id}
                    >
                      {actionLoading === order.id ? "..." : "✓ Completar"}
                    </button>
                    <button
                      className="btnCancel"
                      onClick={() => handleCancel(order.id!)}
                      disabled={actionLoading === order.id}
                    >
                      {actionLoading === order.id ? "..." : "✕ Cancelar"}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
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

export default PendingOrders;
