import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getSessionId = () => {
  let id = localStorage.getItem("cart_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cart_session_id", id);
  }
  return id;
};

const cartApi = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : { "X-Session-Id": getSessionId() }),
    },
  });
};

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await cartApi().get("/cart");
    return res.data; // Expecting { data: [], total: 0, count: 0 }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to load cart");
  }
});

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ product_id, quantity = 1 }, { dispatch, rejectWithValue }) => {
    try {
      const res = await cartApi().post("/cart", { product_id, quantity });
      // After adding, we re-fetch the whole cart to ensure we have nested product data
      dispatch(fetchCart()); 
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add");
    }
  }
);

export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ id, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await cartApi().put(`/cart/${id}`, { quantity });
      dispatch(fetchCart());
      return { id, quantity };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update");
    }
  }
);

export const removeFromCart = createAsyncThunk("cart/remove", async (id, { dispatch, rejectWithValue }) => {
  try {
    await cartApi().delete(`/cart/${id}`);
    dispatch(fetchCart());
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to remove");
  }
});

export const clearCartAsync = createAsyncThunk("cart/clear", async (_, { dispatch, rejectWithValue }) => {
  try {
    await cartApi().delete("/cart/clear");
    dispatch(fetchCart());
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to clear");
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], total: 0, count: 0, loading: false, error: null },
  reducers: {
    resetCartState: (state) => {
      state.items = [];
      state.total = 0;
      state.count = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.count = action.payload.count || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartCount = (state) => state.cart.count;
export const selectCartLoading = (state) => state.cart.loading;