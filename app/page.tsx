'use client'
import Footer from "@/components/home/Footer";
import BigSpiral from "@/components/shared/icons/BigSpiral";
import HamburgerVector from "@/components/shared/icons/HamburgerVector";
import SpiralIcon from "@/components/shared/icons/SpiralIcon";
import Image from "next/image";
import { motion as m } from 'framer-motion';
import Nav from "@/components/home/Nav";
import Hero from "@/components/home/Hero";
import { main } from "framer-motion/client";
import CollapsedNav from "@/components/home/CollapsedNav";
import { useState } from "react";

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  return (
    <main>
      <m.div className="w-full flex flex-col relative container overflow-x-hidden mx-auto px-10 min-h-screen" initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.3 } } }}>
        <m.span className="absolute bottom-16 right-10">
          <BigSpiral />
        </m.span>
        <Nav openNav={() => setIsNavOpen(!isNavOpen)} />
        <Hero />
        <div className="py-6"></div>
        <Footer />
      </m.div>

      {isNavOpen && (
        <CollapsedNav />
      )}
    </main>
  );
}
