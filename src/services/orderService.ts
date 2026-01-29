import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase.config";

const ORDERS_COLLECTION = "orders";

export interface FirebaseOrder {
  id?: string;
  customerName: string;
  customerAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
}

// Crear pedido
export const createOrder = async (
  order: Omit<FirebaseOrder, "id" | "createdAt">,
): Promise<string> => {
  try {
    console.log("📝 Creando pedido en Firebase...", order);
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...order,
      createdAt: Timestamp.now(),
    });
    console.log("✅ Pedido creado con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error al crear pedido:", error);
    throw new Error("No se pudo crear el pedido");
  }
};

// Obtener todos los pedidos
export const getOrders = async (): Promise<FirebaseOrder[]> => {
  try {
    console.log("📥 Obteniendo pedidos de Firebase...");
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as FirebaseOrder[];
    console.log(`✅ Se obtuvieron ${orders.length} pedidos`);
    return orders;
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    throw new Error("No se pudieron cargar los pedidos");
  }
};

// Actualizar estado del pedido
export const updateOrderStatus = async (
  orderId: string,
  status: "completed" | "cancelled",
): Promise<void> => {
  try {
    console.log(`🔄 Actualizando pedido ${orderId} a estado: ${status}`);
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status });
    console.log("✅ Pedido actualizado correctamente");
  } catch (error) {
    console.error("❌ Error al actualizar pedido:", error);
    throw new Error("No se pudo actualizar el pedido");
  }
};

// Actualizar dirección del pedido
export const updateOrderAddress = async (
  orderId: string,
  customerAddress: string,
): Promise<void> => {
  try {
    console.log(`📍 Actualizando dirección del pedido ${orderId}`);
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { customerAddress });
    console.log("✅ Dirección actualizada correctamente");
  } catch (error) {
    console.error("❌ Error al actualizar dirección:", error);
    throw new Error("No se pudo actualizar la dirección");
  }
};

// Eliminar pedido
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    console.log(`🗑️ Eliminando pedido ${orderId}`);
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
    console.log("✅ Pedido eliminado correctamente");
  } catch (error) {
    console.error("❌ Error al eliminar pedido:", error);
    throw new Error("No se pudo eliminar el pedido");
  }
};
