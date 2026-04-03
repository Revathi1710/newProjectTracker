// src/components/Layout.jsx
// ✅ Single Header + Footer that mounts ONCE and never remounts on navigation.
// This prevents the fetchCart() race condition caused by Header remounting
// on every route change when it lived inside each page component.

import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}