import React, { Suspense, useEffect, useState } from "react";
import "./App.css";
import { StoreProvider, useStore } from "./store/StoreContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { getOrders, type FirebaseOrder } from "./services/orderService";

const Foods = React.lazy(() => import("./components/foods/Foods"));
const FoodOrder = React.lazy(() => import("./components/foods/FoodOrder"));
const Cart = React.lazy(() => import("./components/foods/Cart"));
const PendingOrders = React.lazy(
  () => import("./components/orders/PendingOrders"),
);
const ImageClassifier = React.lazy(
  () => import("./components/classifier/ImageClassifier"),
);

function AppContent() {
  const {
    isChooseFoodPage,
    setIsChooseFoodPage,
    selectedFood,
    setSelectedFood,
    menuItems,
  } = useStore();

  const [showOrders, setShowOrders] = React.useState(false);
  const [showCart, setShowCart] = React.useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [allOrders, setAllOrders] = useState<FirebaseOrder[]>([]);
  const [showClassifier, setShowClassifier] = useState(false);

  useEffect(() => {
    const loadPendingOrders = async () => {
      try {
        const fetchedOrders = await getOrders();
        setAllOrders(fetchedOrders);
        const pendingCount = fetchedOrders.filter(
          (o) => o.status === "pending",
        ).length;
        setPendingOrdersCount(pendingCount);
      } catch (error) {
        console.error("Error al cargar pedidos pendientes:", error);
      }
    };

    loadPendingOrders();
    const interval = setInterval(loadPendingOrders, 5000);
    return () => clearInterval(interval);
  }, []);

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
      setSelectedFood(item);
      setIsChooseFoodPage(true);
    }
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <div className="mainContent">
          <div className="buttonGroup">
            <button
              className="toggleButton"
              onClick={() => {
                setIsChooseFoodPage(!isChooseFoodPage);
                setSelectedFood(null);
                setShowOrders(false);
                setShowCart(false);
                setShowClassifier(false);
              }}
            >
              {isChooseFoodPage ? "Volver al menú" : "🍔 Elegir comida"}
            </button>

            <button
              className="toggleButton cartButton"
              onClick={() => {
                setShowCart(!showCart);
                setIsChooseFoodPage(false);
                setShowOrders(false);
                setSelectedFood(null);
                setShowClassifier(false);
              }}
            >
              {showCart ? "Volver" : "🛒 Ver Carrito"}
            </button>

            <button
              className="toggleButton ordersButton"
              onClick={() => {
                setShowOrders(!showOrders);
                setIsChooseFoodPage(false);
                setShowCart(false);
                setSelectedFood(null);
                setShowClassifier(false);
              }}
            >
              {showOrders
                ? "Volver"
                : `📋 Pedidos Pendientes (${pendingOrdersCount})`}
            </button>

            <button
              className="toggleButton classifierButton"
              onClick={() => {
                setShowClassifier(!showClassifier);
                setIsChooseFoodPage(false);
                setShowOrders(false);
                setShowCart(false);
                setSelectedFood(null);
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
              <Cart onReturnToMenu={() => setShowCart(false)} />
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
                    onToBack={() => setSelectedFood(null)}
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

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
