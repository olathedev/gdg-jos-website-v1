"use client";
import React, { useState } from "react";
import CalendarIcon from "@/components/shared/icons/CalendarIcon";
import Locationicon from "@/components/shared/icons/Locationicon";
import AppGradientButton from "@/components/ui/AppGradientButton";
import Image from "next/image";
import { motion as m } from "framer-motion";
import HamburgerwhiteIcon from "../shared/icons/HamburgerwhiteIcon";
import CollapsedNav from "./CollpasedNav2";

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Parent container animation variants for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Child animation variants
  const childVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.3, 0, 0.1, 1],
      },
    },
  };

  // Button-specific animation with spring effect
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring", // Spring animation for a lively, modern effect
        stiffness: 120,
        damping: 15,
        duration: 0.5,
      },
    },
  };

  return (
    <>
      {isNavOpen && <CollapsedNav closeNav={() => setIsNavOpen(false)} />}
      {/* Use a normal <Image> for the background to improve loading performance */}
      <div className="relative w-full min-h-[85vh] md:min-h-[98vh] flex flex-col bg-black">
        <Image
          src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758289190/devfestbanner_v12utp.jpg"
          alt="DevFest Banner"
          fill
          priority
          className="object-cover object-center z-0"
          style={{ opacity: 0.85 }}
        />
        <div className="absolute w-full h-full bg-black bg-opacity-85 z-0"></div>
        <nav className="relative z-10 container mx-auto px-4 md:px-10 py-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image
                src="/images/gdglogo.png"
                alt=""
                height={30}
                width={70}
                className="h-[30px] w-[60px] md:w-[75] md:h-[30]"
              />
              <h3 className="text-xl font-light text-white">
                <span className="font-bold">GDG</span> Jos
              </h3>
            </div>

            <div
              className="cursor-pointer z-20"
              onClick={() => setIsNavOpen(true)}
            >
              <HamburgerwhiteIcon />
            </div>
          </div>
        </nav>
        <div className="relative z-10 w-full flex-1 flex items-center  justify-center px-4 h-full">
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full flex flex-col h-full grow items-center justify-center"
          >
            <m.div variants={childVariants}>
              <Image
                src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758344210/DF_23_Logo_White_e80db058e6_1_lk9eqq.svg"
                alt=""
                height={300}
                width={150}
                className="h-[90px] w-[300px] md:w-[600px] md:h-[200px]"
              />
            </m.div>

            <m.h3
              variants={childVariants}
              className="text-white text-center md:text-[22px] font-medium"
            >
              The most anticipated tech event
              <br /> in Jos, Plateau State
            </m.h3>

            <m.div
              variants={containerVariants}
              className="w-full md:w-auto flex gap-4 md:gap-6 mt-8"
            >
              <m.a
                variants={buttonVariants}
                href="https://bit.ly/devfestjos2025"
                target="_blank"
                className="w-1/2 md:w-[200px]"
              >
                <AppGradientButton className="w-full">
                  <Image
                    src="/svgs/handshake.svg"
                    alt=""
                    width={29}
                    height={29}
                    sizes="(max-width: 768px) 24px, 29px"
                  />
                  Become a Partner
                </AppGradientButton>
              </m.a>

              <m.a
                variants={buttonVariants}
                href="https://bit.ly/DevfestJos_Speakers"
                target="_blank"
                className="w-1/2 md:w-[200px]"
              >
                <AppGradientButton className="w-full">
                  <Image
                    src="/svgs/mic.svg"
                    alt=""
                    width={25}
                    height={25}
                    sizes="(max-width: 768px) 24px, 29px"
                  />
                  Become a Speaker
                </AppGradientButton>
              </m.a>
            </m.div>

            <m.div
              variants={childVariants}
              className="border-2 border-white rounded-lg py-2 px-8 flex flex-col gap-2 md:flex-row md:gap-10 items-center justify-between mt-8 text-white"
            >
              <div className="flex items-center gap-1">
                <CalendarIcon />
                20th September, 2025
              </div>
              <div className="flex md:items-center gap-1 justify-center">
                <Locationicon />
                <p className="text-center">
                  Sarau Event Center, Jos, Plateau State
                </p>
              </div>
            </m.div>
          </m.div>
        </div>
      </div>
    </>
  );
};

export default Header;
