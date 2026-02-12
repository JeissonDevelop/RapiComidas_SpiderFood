import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MenuItem } from "../../entities/entities";

interface UIState {
  isChooseFoodPage: boolean;
  selectedFood: MenuItem | null;
  showCart: boolean;
  showOrders: boolean;
  showClassifier: boolean;
}

const initialState: UIState = {
  isChooseFoodPage: false,
  selectedFood: null,
  showCart: false,
  showOrders: false,
  showClassifier: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setIsChooseFoodPage: (state, action: PayloadAction<boolean>) => {
      state.isChooseFoodPage = action.payload;
    },
    setSelectedFood: (state, action: PayloadAction<MenuItem | null>) => {
      state.selectedFood = action.payload;
    },
    setShowCart: (state, action: PayloadAction<boolean>) => {
      state.showCart = action.payload;
    },
    setShowOrders: (state, action: PayloadAction<boolean>) => {
      state.showOrders = action.payload;
    },
    setShowClassifier: (state, action: PayloadAction<boolean>) => {
      state.showClassifier = action.payload;
    },
    resetView: (state) => {
      state.isChooseFoodPage = false;
      state.selectedFood = null;
      state.showCart = false;
      state.showOrders = false;
      state.showClassifier = false;
    },
  },
});

export const {
  setIsChooseFoodPage,
  setSelectedFood,
  setShowCart,
  setShowOrders,
  setShowClassifier,
  resetView,
} = uiSlice.actions;
export default uiSlice.reducer;
