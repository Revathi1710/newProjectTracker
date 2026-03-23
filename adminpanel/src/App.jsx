import React from "react";
import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddProduct from "./pages/AddProduct";
import AllProduct from "./pages/AllProduct";
import Dashboard from "./pages/Dashboard";
import EditProduct from "./pages/EditProduct ";

function App() {
  

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/addProduct" element={<AddProduct/>}/>
        <Route path="allProduct" element={<AllProduct/>}/>
        <Route path="/editProduct/:id" element={<EditProduct />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
