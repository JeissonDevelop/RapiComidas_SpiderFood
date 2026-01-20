import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { MenuItem } from "../entities/entities";

// Cart item incluye la cantidad agregada al carrito
export interface CartItem extends MenuItem {
  cartQuantity: number;
}

interface StoreContextType {
  isChooseFoodPage: boolean;
  setIsChooseFoodPage: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFood: MenuItem | null;
  setSelectedFood: React.Dispatch<React.SetStateAction<MenuItem | null>>;
  showCart: boolean;
  setShowCart: React.Dispatch<React.SetStateAction<boolean>>;
  menuItems: MenuItem[];
  cartItems: CartItem[];
  addToCart: (foodId: number, quantity: number) => void;
  removeFromCart: (foodId: number) => void;
  submitCart: (name: string, phone: string) => void;
  cancelCart: () => void;
  getAvailableStock: (foodId: number) => number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isChooseFoodPage, setIsChooseFoodPage] = useState(false);
  const [selectedFood, setSelectedFood] = useState<MenuItem | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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

  // Calcula stock disponible considerando lo que ya está en carrito
  const getAvailableStock = useCallback(
    (foodId: number): number => {
      const food = menuItems.find((item) => item.id === foodId);
      if (!food) return 0;
      const inCart =
        cartItems.find((item) => item.id === foodId)?.cartQuantity ?? 0;
      return Math.max(0, food.quantity - inCart);
    },
    [cartItems, menuItems],
  );

  // Agrega al carrito respetando stock disponible
  const addToCart = useCallback(
    (foodId: number, quantity: number) => {
      const food = menuItems.find((item) => item.id === foodId);
      if (!food) return;

      const available = getAvailableStock(foodId);
      const quantityToAdd = Math.min(quantity, available);
      if (quantityToAdd === 0) return;

      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === foodId);
        if (existing) {
          return prev.map((item) =>
            item.id === foodId
              ? { ...item, cartQuantity: item.cartQuantity + quantityToAdd }
              : item,
          );
        }
        return [...prev, { ...food, cartQuantity: quantityToAdd }];
      });

      setSelectedFood(null);
      setShowCart(true);
    },
    [getAvailableStock, menuItems],
  );

  const removeFromCart = useCallback((foodId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== foodId));
  }, []);

  // Descuenta stock y limpia carrito al enviar pedido
  const submitCart = useCallback((name: string, phone: string) => {
    if (!name.trim() || !phone.trim()) return;

    setCartItems((prevCart) => {
      setMenuItems((prevMenu) =>
        prevMenu.map((m) => {
          const itemInCart = prevCart.find((c) => c.id === m.id);
          if (!itemInCart) return m;
          return {
            ...m,
            quantity: Math.max(0, m.quantity - itemInCart.cartQuantity),
          };
        }),
      );
      return [];
    });
  }, []);

  const cancelCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = useMemo(
    () => ({
      isChooseFoodPage,
      setIsChooseFoodPage,
      selectedFood,
      setSelectedFood,
      showCart,
      setShowCart,
      menuItems,
      cartItems,
      addToCart,
      removeFromCart,
      submitCart,
      cancelCart,
      getAvailableStock,
    }),
    [
      isChooseFoodPage,
      selectedFood,
      showCart,
      menuItems,
      cartItems,
      addToCart,
      removeFromCart,
      submitCart,
      cancelCart,
      getAvailableStock,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}
