import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "./slices/menuSlice";
import cartReducer from "./slices/cartSlice";
import ordersReducer from "./slices/ordersSlice";
import uiReducer from "./slices/uiSlice";
import { loggerMiddleware } from "./middleware/loggerMiddleware";

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    cart: cartReducer,
    orders: ordersReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar estas rutas de acción porque contienen valores Date
        ignoredActions: [
          "orders/createOrder/fulfilled",
          "orders/fetchOrders/fulfilled",
        ],
        // Ignorar estos campos en el estado
        ignoredPaths: ["orders.orders"],
      },
    }).concat(loggerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
