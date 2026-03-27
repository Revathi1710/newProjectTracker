import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import React from "react";
import axios from "axios";
import Header from "../components/Header";
import HomePageProducts from "../components/HomePageProducts";
import Footer from "../components/Footer";

export default function Home() {
  
  return (
    <>
      <Header />
      <HomePageProducts/>
      <Footer/>
    </>
  );
}