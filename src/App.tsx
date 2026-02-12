import React, { Suspense, useEffect, useState } from "react";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchOrders } from "./store/slices/ordersSlice";
import {
  setIsChooseFoodPage,
  setSelectedFood,
  setShowCart,
  setShowOrders,
  setShowClassifier,
} from "./store/slices/uiSlice";
import Loading from "./components/Loading";

const Foods = React.lazy(() => import("./components/foods/Foods"));
const FoodOrder = React.lazy(() => import("./components/foods/FoodOrder"));
const Cart = React.lazy(() => import("./components/foods/Cart"));
const PendingOrders = React.lazy(
  () => import("./components/orders/PendingOrders"),
);
const ImageClassifier = React.lazy(
  () => import("./components/classifier/ImageClassifier"),
);

function App() {
  const dispatch = useAppDispatch();
  const {
    isChooseFoodPage,
    selectedFood,
    showCart,
    showOrders,
    showClassifier,
  } = useAppSelector((state) => state.ui);
  const menuItems = useAppSelector((state) => state.menu.items);
  const allOrders = useAppSelector((state) => state.orders.orders);
  const { currentOperation } = useAppSelector((state) => state.orders);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    dispatch(fetchOrders());
    const interval = setInterval(() => {
      dispatch(fetchOrders());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const pendingCount = allOrders.filter((o) => o.status === "pending").length;
    setPendingOrdersCount(pendingCount);
  }, [allOrders]);

  /*
    Calcula el stock disponible de forma dinámica basándose en el stock base
    del menú y los pedidos activos en Firebase.

    IMPORTANTE: El stock base en menuSlice NO se modifica manualmente.
    Esta función calcula el stock "reservado" por pedidos pendientes/completados
    y lo resta del stock base para obtener el stock disponible real.
   
    Este enfoque evita problemas de sincronización y doble conteo.
   */
  const getAvailableStockWithOrders = (itemId: string): number => {
    const menuItem = menuItems.find((item) => String(item.id) === itemId);
    if (!menuItem) return 0;

    const orderedQuantity = allOrders
      .filter(
        (order) => order.status === "pending" || order.status === "completed",
      )
      .reduce((total, order) => {
        const itemInOrder = order.items.find(
          (item) => item.name === menuItem.name,
        );
        return total + (itemInOrder?.quantity || 0);
      }, 0);

    return Math.max(0, menuItem.quantity - orderedQuantity);
  };

  const handleMenuItemClick = (item: (typeof menuItems)[0]) => {
    const availableStock = getAvailableStockWithOrders(String(item.id));
    if (availableStock > 0) {
      console.log(`🔍 Abriendo detalle de: ${item.name}`);
      dispatch(setSelectedFood(item));
      dispatch(setIsChooseFoodPage(true));
    }
  };

  return (
    <ErrorBoundary>
      {currentOperation && <Loading message={currentOperation} />}
      <div className="App">
        <div className="mainContent">
          <div className="buttonGroup">
            <button
              className="toggleButton"
              onClick={() => {
                dispatch(setIsChooseFoodPage(!isChooseFoodPage));
                dispatch(setSelectedFood(null));
                dispatch(setShowOrders(false));
                dispatch(setShowCart(false));
                dispatch(setShowClassifier(false));
              }}
            >
              {isChooseFoodPage ? "Volver al menú" : "🍔 Elegir comida"}
            </button>

            <button
              className="toggleButton cartButton"
              onClick={() => {
                dispatch(setShowCart(!showCart));
                dispatch(setIsChooseFoodPage(false));
                dispatch(setIsChooseFoodPage(false));
                dispatch(setShowOrders(false));
                dispatch(setSelectedFood(null));
                dispatch(setShowClassifier(false));
              }}
            >
              {showCart
                ? "Volver"
                : `🛒 Ver Carrito ${cartItems.length > 0 ? `(${cartItems.length})` : ""}`}
            </button>

            <button
              className="toggleButton ordersButton"
              onClick={() => {
                dispatch(setShowOrders(!showOrders));
                dispatch(setIsChooseFoodPage(false));
                dispatch(setShowCart(false));
                dispatch(setSelectedFood(null));
                dispatch(setShowClassifier(false));
              }}
            >
              {showOrders
                ? "Volver"
                : `📋 Pedidos Pendientes (${pendingOrdersCount})`}
            </button>

            <button
              className="toggleButton classifierButton"
              onClick={() => {
                dispatch(setShowClassifier(!showClassifier));
                dispatch(setIsChooseFoodPage(false));
                dispatch(setShowOrders(false));
                dispatch(setShowCart(false));
                dispatch(setSelectedFood(null));
              }}
            >
              {showClassifier ? "Volver" : "🖼️ Clasificador IA"}
            </button>
          </div>

          <h3 className="title">
            <img src="./logo.png" alt="SpiderFood Logo" className="logo" />
            SpiderFood Comida Rápida
          </h3>

          {showClassifier ? (
            <Suspense fallback={<div>Cargando clasificador...</div>}>
              <ImageClassifier />
            </Suspense>
          ) : showOrders ? (
            <Suspense fallback={<div>Cargando pedidos...</div>}>
              <PendingOrders />
            </Suspense>
          ) : showCart ? (
            <Suspense fallback={<div>Cargando carrito...</div>}>
              <Cart onReturnToMenu={() => dispatch(setShowCart(false))} />
            </Suspense>
          ) : (
            <>
              {!isChooseFoodPage && !selectedFood && (
                <>
                  <h4 className="subTitle">📋 Menús Disponibles</h4>
                  <ul className="ulApp">
                    {menuItems.map((item) => {
                      const availableStock = getAvailableStockWithOrders(
                        String(item.id),
                      );
                      return (
                        <li
                          key={item.id}
                          className={`liApp ${
                            availableStock === 0 ? "outOfStock" : ""
                          }`}
                          onClick={() => handleMenuItemClick(item)}
                          style={{
                            cursor:
                              availableStock > 0 ? "pointer" : "not-allowed",
                            opacity: availableStock === 0 ? 0.5 : 1,
                            transition: "transform 0.2s, box-shadow 0.2s",
                          }}
                        >
                          <p className="menuItemName">{item.name}</p>
                          <p className="menuItemStock">
                            {availableStock === 0
                              ? "❌ Sin stock"
                              : `✓ Stock: ${availableStock}`}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              {isChooseFoodPage && !selectedFood && (
                <Suspense fallback={<div>Cargando productos...</div>}>
                  <Foods />
                </Suspense>
              )}

              {selectedFood && (
                <Suspense fallback={<div>Cargando detalle...</div>}>
                  <FoodOrder
                    foodItem={selectedFood}
                    availableStock={getAvailableStockWithOrders(
                      String(selectedFood.id),
                    )}
                    totalStock={selectedFood.quantity}
                    onToBack={() => dispatch(setSelectedFood(null))}
                  />
                </Suspense>
              )}
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
