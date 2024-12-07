"use client";
import Footer from "@/components/home/Footer";
import BigSpiral from "@/components/shared/icons/BigSpiral";
import { motion as m } from "framer-motion";
import Nav from "@/components/home/Nav";
import Hero from "@/components/home/Hero";
import CollapsedNav from "@/components/home/CollapsedNav";
import { useState } from "react";

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <main className="w-full  overflow-x-hidden">
      <m.div
        className="w-full flex flex-col relative min-h-screen container h-full  mx-auto px-4 md:px-10 "
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
      >
        <m.span className="absolute bottom-16 right-10">
          <BigSpiral />
        </m.span>
        <Nav openNav={() => setIsNavOpen(true)} />
        <Hero />
        <div className="py-6"></div>
        <Footer />
      </m.div>

      {isNavOpen && <CollapsedNav closeNav={() => setIsNavOpen(false)} />}
    </main>
  );
}
