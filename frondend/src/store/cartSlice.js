import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── Always get or create a session ID ───────────────────────────────────────
// Guaranteed to always return a value — never null, never undefined.
// This ensures X-Session-Id header is NEVER missing for guest requests.
const getSessionId = () => {
  let id = localStorage.getItem("cart_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cart_session_id", id);
  }
  return id;
};

// ─── Axios instance ───────────────────────────────────────────────────────────
// Logged-in  → Authorization: Bearer <token>
// Guest      → X-Session-Id: <uuid>   (always created if missing)
const cartApi = () => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    "X-Session-Id": getSessionId(), // ✅ ALWAYS SEND
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers,
  });
};
// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi().get("/cart");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load cart");
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ product_id, quantity = 1 }, { dispatch, rejectWithValue }) => {
    try {
      await cartApi().post("/cart", { product_id, quantity });
      dispatch(fetchCart());
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
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update");
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await cartApi().delete(`/cart/${id}`);
      dispatch(fetchCart());
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove");
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  "cart/clear",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await cartApi().delete("/cart/clear");
      dispatch(fetchCart());
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to clear");
    }
  }
);

// ─── Merge guest cart after login / register ──────────────────────────────────
export const mergeGuestCart = createAsyncThunk(
  "cart/merge",
  async (token, { dispatch }) => {
    const sessionId = localStorage.getItem("cart_session_id");

    if (!sessionId) {
      dispatch(fetchCart());
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/cart/merge`,
        { session_id: sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("cart_session_id");
    } catch (err) {
      console.warn("Cart merge failed:", err);
      localStorage.removeItem("cart_session_id");
    } finally {
      dispatch(fetchCart());
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items:   [],
    total:   0,
    count:   0,
    loading: false,
    error:   null,
  },
  reducers: {
    resetCartState: (state) => {
      state.items = [];
      state.total = 0;
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload.data  || [];
        state.total   = action.payload.total || 0;
        state.count   = action.payload.count || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCartItems   = (state) => state.cart.items;
export const selectCartTotal   = (state) => state.cart.total;
export const selectCartCount   = (state) => state.cart.count;
export const selectCartLoading = (state) => state.cart.loading;