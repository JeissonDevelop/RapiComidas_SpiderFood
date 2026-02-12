import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MenuItem } from "../../entities/entities";

interface MenuState {
  items: MenuItem[];
}

const initialState: MenuState = {
  items: [
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
  ],
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    decreaseStock: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>,
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(0, item.quantity - action.payload.quantity);
      }
    },
    increaseStock: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>,
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity += action.payload.quantity;
      }
    },
    setMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { decreaseStock, increaseStock, setMenuItems } = menuSlice.actions;
export default menuSlice.reducer;
