import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MenuItem } from "../entities/entities";

// Cart item incluye la cantidad agregada al carrito
export interface CartItem extends MenuItem {
  cartQuantity: number;
}

export interface Order {
  id: string;
  items: Array<{ id: number; name: string; quantity: number; price: number }>;
  total: number;
  date: Date;
  status: "pending" | "completed" | "cancelled";
  customerName: string;
  customerPhone: string;
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
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isChooseFoodPage, setIsChooseFoodPage] = useState(false);
  const [selectedFood, setSelectedFood] = useState<MenuItem | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const isSubmittingRef = useRef(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: 1,
      name: "Hamburguesa de Pollo",
      quantity: 40,
      desc: "Hamburguesa de pollo frito - lechuga, tomate, queso y mayonesa",
      price: 24,
      image: `${import.meta.env.BASE_URL}images/cb.jpg`,
    },
    {
      id: 2,
      name: "Hamburguesa Vegetariana",
      quantity: 30,
      desc: "Hamburguesa verde - lechuga, tomate, queso vegano y mayonesa",
      price: 22,
      image: `${import.meta.env.BASE_URL}images/vb.jpg`,
    },
    {
      id: 3,
      name: "Patatas Fritas",
      quantity: 50,
      desc: "Patatas fritas crujientes - sal y especias",
      price: 10,
      image: `${import.meta.env.BASE_URL}images/chips.jpg`,
    },
    {
      id: 4,
      name: "Helado",
      quantity: 30,
      desc: "Helado - cremoso y dulce",
      price: 8,
      image: `${import.meta.env.BASE_URL}images/ic.jpg`,
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

  // Descuenta stock, guarda pedido y limpia carrito al enviar
  const submitCart = useCallback(
    (name: string, phone: string) => {
      if (!name.trim() || !phone.trim()) return;
      if (isSubmittingRef.current) return; // Prevenir doble envío

      isSubmittingRef.current = true;

      // Capturar el estado actual del carrito
      const currentCart = cartItems;

      if (currentCart.length === 0) {
        isSubmittingRef.current = false;
        return;
      }

      // Crear nuevo pedido
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        items: currentCart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.cartQuantity,
          price: item.price,
        })),
        total: currentCart.reduce(
          (sum, item) => sum + item.price * item.cartQuantity,
          0,
        ),
        date: new Date(),
        status: "pending",
        customerName: name,
        customerPhone: phone,
      };

      // Agregar pedido a la lista
      setOrders((prev) => [newOrder, ...prev]);

      // Descontar stock del menú
      setMenuItems((prevMenu) =>
        prevMenu.map((m) => {
          const itemInCart = currentCart.find((c) => c.id === m.id);
          if (!itemInCart) return m;
          return {
            ...m,
            quantity: Math.max(0, m.quantity - itemInCart.cartQuantity),
          };
        }),
      );

      // Limpiar carrito
      setCartItems([]);

      // Resetear flag después de un breve delay
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    },
    [cartItems],
  );

  const cancelCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const updateOrderStatus = useCallback(
    (orderId: string, status: Order["status"]) => {
      const order = orders.find((o) => o.id === orderId);

      // Verificar que el pedido existe y está en estado correcto
      if (!order || order.status !== "pending") {
        return;
      }

      // Actualizar el estado del pedido
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );

      // Si se cancela, restaurar stock
      if (status === "cancelled") {
        setMenuItems((prevMenu) =>
          prevMenu.map((menuItem) => {
            const orderItem = order.items.find(
              (item) => item.id === menuItem.id,
            );
            if (!orderItem) return menuItem;
            return {
              ...menuItem,
              quantity: menuItem.quantity + orderItem.quantity,
            };
          }),
        );
      }
    },
    [orders],
  );

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
      orders,
      setOrders,
      updateOrderStatus,
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
      orders,
      updateOrderStatus,
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
