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
function App() {
  return (
    <BrowserRouter>
   <ContextProvider>
  <Routes>
         <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
         <Route path="/login" element={<Login />} />
           <Route path="/users" element={<Users />} />
             <Route path="/defult" element={<DefaultLayout />} />
               <Route path="/guest" element={<GuestLayout />} />
               <Route path="/cart" element={<CartPage />} />
               <Route path="/product-view/:slug" element={<ProductView />} />
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
      </Routes>
   </ContextProvider>
    
    </BrowserRouter>
  );
}

export default App;
