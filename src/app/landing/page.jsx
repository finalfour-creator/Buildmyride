'use client';

import React from "react";
import Navbar from "../../components/navbar/navbar";
import Home from "../../components/home/home";
import About from "../../components/about/About";
import Explore from "../../components/explore/Explore";
import Contact from "../../components/contact/Contact";
import Footer from "../../components/footer/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Home />
      <About />
      <Explore />
      <Contact />
      <Footer />
    </>
  );
}

