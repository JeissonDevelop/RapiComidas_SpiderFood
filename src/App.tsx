import React, { Suspense, useState } from "react";
import "./App.css";
import type { MenuItem } from "./entities/entities";
const Foods = React.lazy(() => import("./components/foods/Foods"));
const FoodOrder = React.lazy(() => import("./components/foods/FoodOrder"));

function App() {
  const [isChooseFoodPage, setIsChooseFoodPage] = useState(false);
  const [selectedFood, setSelectedFood] = useState<MenuItem | null>(null);
  const [lastOrder, setLastOrder] = useState<{
    foodId: number;
    quantity: number;
  } | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: 1,
      name: "Hamburguesa de Pollo",
      quantity: 40,
      desc: "Hamburguesa de pollo frito - lechuga, tomate, queso y mayonesa",
      price: 24,
      image: "cb.jpg",
    },
    {
      id: 2,
      name: "Hamburguesa Vegetariana",
      quantity: 30,
      desc: "Hamburguesa verde - lechuga, tomate, queso vegano y mayonesa",
      price: 22,
      image: "vb.jpg",
    },
    {
      id: 3,
      name: "Patatas Fritas",
      quantity: 50,
      desc: "Patatas fritas crujientes - sal y especias",
      price: 10,
      image: "chips.jpg",
    },
    {
      id: 4,
      name: "Helado",
      quantity: 30,
      desc: "Helado - cremoso y dulce",
      price: 8,
      image: "ic.jpg",
    },
  ]);

  const handleSubmitOrder = (foodId: number, quantity: number) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === foodId
          ? { ...item, quantity: Math.max(0, item.quantity - quantity) }
          : item
      )
    );

    setSelectedFood((prev) =>
      prev && prev.id === foodId
        ? { ...prev, quantity: Math.max(0, prev.quantity - quantity) }
        : prev
    );

    setLastOrder({ foodId, quantity });
  };
  return (
    <div className="App">
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
            {menuItems.map((item) => {
              return (
                <li key={item.id} className="liApp">
                  <p>{item.name}</p>
                  <p>#{item.quantity}</p>
                </li>
              );
            })}
          </ul>
        </>
      )}
      {isChooseFoodPage && !selectedFood && (
        <Suspense fallback={<div>Cargando...</div>}>
          <Foods
            foodItems={menuItems}
            onSelectFood={(food) => setSelectedFood(food)}
          />
        </Suspense>
      )}
      {selectedFood && (
        <Suspense fallback={<div>Cargando...</div>}>
          <FoodOrder
            foodItem={selectedFood}
            onSubmitOrder={handleSubmitOrder}
            onToBack={() => setSelectedFood(null)}
            onReturnToMenu={() => {
              setSelectedFood(null);
              setIsChooseFoodPage(false);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
