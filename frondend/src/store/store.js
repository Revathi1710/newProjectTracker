// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import buyNowReducer from "./buyNowSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    buyNow: buyNowReducer,
  },
});

export default store;