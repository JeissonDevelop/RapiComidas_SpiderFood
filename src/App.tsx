import React, { Suspense } from "react";
import "./App.css";
import { StoreProvider, useStore } from "./store/StoreContext";
const Foods = React.lazy(() => import("./components/foods/Foods"));
const FoodOrder = React.lazy(() => import("./components/foods/FoodOrder"));
const Cart = React.lazy(() => import("./components/foods/Cart"));

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
  } = useStore();

  return (
    <div className="App">
      <div className="mainContent">
        <button
          className="toggleButton"
          onClick={() => {
            setIsChooseFoodPage(!isChooseFoodPage);
            setSelectedFood(null);
          }}
        >
          {isChooseFoodPage ? "Comprobación de disponibilidad" : "Pedir Comida"}
        </button>
        <h3 className="title">Comida Rápida Online</h3>
        {!isChooseFoodPage && !selectedFood && (
          <>
            <h4 className="subTitle">Menús</h4>
            <ul className="ulApp">
              {menuItems.map((item) => (
                <li key={item.id} className="liApp">
                  <p>{item.name}</p>
                  <p>#{item.quantity}</p>
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
      </div>

      {isChooseFoodPage && (
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
