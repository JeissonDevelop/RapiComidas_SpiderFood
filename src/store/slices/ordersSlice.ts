import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { FirebaseOrder } from "../../services/orderService";
import {
  createOrder,
  getOrders,
  updateOrderStatus as updateOrderStatusService,
  updateOrderAddress as updateOrderAddressService,
  deleteOrder as deleteOrderService,
} from "../../services/orderService";

interface OrdersState {
  orders: FirebaseOrder[];
  loading: boolean;
  error: string | null;
  currentOperation: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
  currentOperation: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const orders = await getOrders();
      return orders;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al cargar pedidos",
      );
    }
  },
);

export const createOrderAsync = createAsyncThunk(
  "orders/createOrder",
  async (
    orderData: Omit<FirebaseOrder, "id" | "createdAt">,
    { rejectWithValue },
  ) => {
    try {
      const orderId = await createOrder(orderData);
      return {
        ...orderData,
        id: orderId,
        createdAt: new Date(),
      } as FirebaseOrder;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al crear pedido",
      );
    }
  },
);

export const updateOrderStatusAsync = createAsyncThunk(
  "orders/updateStatus",
  async (
    { orderId, status }: { orderId: string; status: "completed" | "cancelled" },
    { rejectWithValue },
  ) => {
    try {
      await updateOrderStatusService(orderId, status);
      return { orderId, status };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Error al actualizar estado del pedido",
      );
    }
  },
);

export const updateOrderAddressAsync = createAsyncThunk(
  "orders/updateAddress",
  async (
    { orderId, address }: { orderId: string; address: string },
    { rejectWithValue },
  ) => {
    try {
      await updateOrderAddressService(orderId, address);
      return { orderId, address };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Error al actualizar dirección del pedido",
      );
    }
  },
);

export const deleteOrderAsync = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      await deleteOrderService(orderId);
      return orderId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al eliminar pedido",
      );
    }
  },
);

export const deleteMultipleOrdersAsync = createAsyncThunk(
  "orders/deleteMultiple",
  async (orderIds: string[], { rejectWithValue }) => {
    try {
      await Promise.all(orderIds.map((id) => deleteOrderService(id)));
      return orderIds;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al eliminar pedidos",
      );
    }
  },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.error = null;
      })
      .addCase(
        fetchOrders.fulfilled,
        (state, action: PayloadAction<FirebaseOrder[]>) => {
          state.orders = action.payload;
        },
      )
      .addCase(fetchOrders.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create order
    builder
      .addCase(createOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentOperation = "Creando pedido...";
      })
      .addCase(
        createOrderAsync.fulfilled,
        (state, action: PayloadAction<FirebaseOrder>) => {
          state.loading = false;
          state.orders.unshift(action.payload);
          state.currentOperation = null;
        },
      )
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentOperation = null;
      });

    // Update order status
    builder
      .addCase(updateOrderStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentOperation = "Actualizando pedido...";
      })
      .addCase(updateOrderStatusAsync.fulfilled, (state, action) => {
        state.loading = false;
        const order = state.orders.find((o) => o.id === action.payload.orderId);
        if (order) {
          order.status = action.payload.status;
        }
        state.currentOperation = null;
      })
      .addCase(updateOrderStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentOperation = null;
      });

    // Update order address
    builder
      .addCase(updateOrderAddressAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentOperation = "Actualizando dirección...";
      })
      .addCase(updateOrderAddressAsync.fulfilled, (state, action) => {
        state.loading = false;
        const order = state.orders.find((o) => o.id === action.payload.orderId);
        if (order) {
          order.customerAddress = action.payload.address;
        }
        state.currentOperation = null;
      })
      .addCase(updateOrderAddressAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentOperation = null;
      });

    // Delete order
    builder
      .addCase(deleteOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentOperation = "Eliminando pedido...";
      })
      .addCase(deleteOrderAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter((o) => o.id !== action.payload);
        state.currentOperation = null;
      })
      .addCase(deleteOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentOperation = null;
      });

    // Delete multiple orders
    builder
      .addCase(deleteMultipleOrdersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentOperation = "Eliminando pedidos...";
      })
      .addCase(deleteMultipleOrdersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(
          (o) => !action.payload.includes(o.id!),
        );
        state.currentOperation = null;
      })
      .addCase(deleteMultipleOrdersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentOperation = null;
      });
  },
});

export const { clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
