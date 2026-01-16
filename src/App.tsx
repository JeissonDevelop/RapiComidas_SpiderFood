import React, { Suspense, useState } from "react";
import "./App.css";
import type { MenuItem } from "./entities/entities";
const Foods = React.lazy(() => import("./components/foods/Foods"));
const FoodOrder = React.lazy(() => import("./components/foods/FoodOrder"));
const Cart = React.lazy(() => import("./components/foods/Cart"));

function App() {
  const [isChooseFoodPage, setIsChooseFoodPage] = useState(false);
  const [selectedFood, setSelectedFood] = useState<MenuItem | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<
    Array<{
      id: number;
      foodId: number;
      quantity: number;
      cartQuantity: number;
      name: string;
      price: number;
      image: string;
      desc: string;
    }>
  >([]);
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

  const getAvailableStock = (foodId: number): number => {
    const food = menuItems.find((item) => item.id === foodId);
    if (!food) return 0;

    const cartItem = cartItems.find((item) => item.foodId === foodId);
    const inCart = cartItem ? cartItem.cartQuantity : 0;

    return Math.max(0, food.quantity - inCart);
  };

  const handleAddToCart = (foodId: number, quantity: number) => {
    const food = menuItems.find((item) => item.id === foodId);
    if (!food) return;

    const availableStock = getAvailableStock(foodId);
    const quantityToAdd = Math.min(quantity, availableStock);

    if (quantityToAdd === 0) {
      alert("No hay suficiente stock disponible");
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.foodId === foodId);
      if (existingItem) {
        return prev.map((item) =>
          item.foodId === foodId
            ? { ...item, cartQuantity: item.cartQuantity + quantityToAdd }
            : item
        );
      }
      return [
        ...prev,
        {
          id: food.id,
          foodId,
          quantity: food.quantity,
          cartQuantity: quantityToAdd,
          name: food.name,
          price: food.price,
          image: food.image,
          desc: food.desc,
        },
      ];
    });

    setSelectedFood(null);
    setShowCart(true);
  };

  const handleRemoveFromCart = (foodId: number) => {
    setCartItems((prev) => prev.filter((item) => item.foodId !== foodId));
  };

  const handleSubmitCartOrder = (name: string, phone: string) => {
    cartItems.forEach((item) => {
      handleReduceStock(item.foodId, item.cartQuantity);
    });
    setCartItems([]);
  };

  const handleReduceStock = (foodId: number, quantity: number) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === foodId
          ? { ...item, quantity: Math.max(0, item.quantity - quantity) }
          : item
      )
    );
  };
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
              availableStock={getAvailableStock(selectedFood.id)}
              onAddToCart={handleAddToCart}
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
          <Cart
            cartItems={cartItems}
            onRemoveItem={handleRemoveFromCart}
            onSubmitOrder={handleSubmitCartOrder}
            onCancelOrder={() => setCartItems([])}
            onBackToFoods={() => {
              setShowCart(false);
              setSelectedFood(null);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
