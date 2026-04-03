import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import "./App.css";
import Login from "./pages/Login";
import Users from "./views/Users";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import { ContextProvider } from "./contexts/ContextProvider";
import Home from "./pages/Home";
import React from "react";
import CartPage from "./pages/Cartpage";
import ProductView from "./pages/Productview";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./components/ProtectedRoute";
import MyOrder from "./pages/MyOrder";
import MyAccount from "./pages/MyAccount";
import Blogs from "./pages/Blogs";
import ViewBlog from "./pages/ViewBlog";
import About from "./pages/About";
import TermsCondition from "./pages/TermsCondition";
import RefundPolicy from "./pages/RefundPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact.JSX";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <ContextProvider>
        <Routes>

          {/* ✅ All pages that share Header + Footer go inside this Layout route.
              Header and Footer mount ONCE here — they never remount on navigation,
              which fixes the fetchCart() race condition after login. */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product-view/:slug" element={<ProductView />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<ViewBlog />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<TermsCondition />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<Contact />} />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/myAccount"
              element={
                <ProtectedRoute>
                  <MyAccount />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Routes without Header/Footer (admin, guest, etc.) */}
          <Route path="/users" element={<Users />} />
          <Route path="/defult" element={<DefaultLayout />} />
          <Route path="/guest" element={<GuestLayout />} />

        </Routes>
      </ContextProvider>
    </BrowserRouter>
  );
}

export default App;