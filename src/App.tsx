import React, { Suspense } from "react";
import "./App.css";
import { StoreProvider, useStore } from "./store/StoreContext";
const Foods = React.lazy(() => import("./components/foods/Foods"));
const FoodOrder = React.lazy(() => import("./components/foods/FoodOrder"));
const Cart = React.lazy(() => import("./components/foods/Cart"));
const PendingOrders = React.lazy(
  () => import("./components/orders/PendingOrders"),
);

function AppContent() {
  // Accedemos al estado global mediante contexto en lugar de props drilling
  const {
    isChooseFoodPage,
    setIsChooseFoodPage,
    selectedFood,
    setSelectedFood,
    menuItems,
    addToCart,
    getAvailableStock,
    orders,
  } = useStore();

  const [showOrders, setShowOrders] = React.useState(false);

  const handleMenuItemClick = (item: (typeof menuItems)[0]) => {
    if (item.quantity > 0) {
      setSelectedFood(item);
      setIsChooseFoodPage(true);
    }
  };

  return (
    <div className="App">
      <div className="mainContent">
        <div className="buttonGroup">
          <button
            className="toggleButton"
            onClick={() => {
              setIsChooseFoodPage(!isChooseFoodPage);
              setSelectedFood(null);
              setShowOrders(false);
            }}
          >
            {isChooseFoodPage
              ? "Comprobación de disponibilidad"
              : "Pedir Comida"}
          </button>
          <button
            className="toggleButton ordersButton"
            onClick={() => {
              setShowOrders(!showOrders);
              setIsChooseFoodPage(false);
              setSelectedFood(null);
            }}
          >
            {showOrders
              ? "Volver"
              : `Pedidos Pendientes (${orders.filter((o) => o.status === "pending").length})`}
          </button>
        </div>

        <h3 className="title">SpiderFood Comida Rápida</h3>

        {showOrders ? (
          <Suspense fallback={<div>Cargando...</div>}>
            <PendingOrders />
          </Suspense>
        ) : (
          <>
            {!isChooseFoodPage && !selectedFood && (
              <>
                <h4 className="subTitle">Menús</h4>
                <ul className="ulApp">
                  {menuItems.map((item) => (
                    <li
                      key={item.id}
                      className={`liApp ${item.quantity === 0 ? "outOfStock" : ""}`}
                      onClick={() => handleMenuItemClick(item)}
                      style={{
                        cursor: item.quantity > 0 ? "pointer" : "not-allowed",
                        opacity: item.quantity === 0 ? 0.5 : 1,
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                    >
                      <p>{item.name}</p>
                      <p>
                        {item.quantity === 0
                          ? "Sin stock"
                          : `#${item.quantity}`}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {isChooseFoodPage && !selectedFood && (
              <Suspense fallback={<div>Cargando...</div>}>
                <Foods />
              </Suspense>
            )}
            {selectedFood && (
              <Suspense fallback={<div>Cargando...</div>}>
                <FoodOrder
                  foodItem={selectedFood}
                  availableStock={getAvailableStock(selectedFood.id)}
                  onAddToCart={addToCart}
                  onToBack={() => setSelectedFood(null)}
                  onReturnToMenu={() => {
                    setSelectedFood(null);
                    setIsChooseFoodPage(false);
                  }}
                />
              </Suspense>
            )}
          </>
        )}
      </div>

      {isChooseFoodPage && !showOrders && (
        <Suspense fallback={<div>Cargando...</div>}>
          <Cart />
        </Suspense>
      )}
    </div>
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
