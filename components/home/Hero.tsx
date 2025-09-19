"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion as m } from "framer-motion";
import SpiralIcon from "../shared/icons/SpiralIcon";
import Link from "next/link";

const eventSlides = [
  {
    image: "/images/devFest.png",
    year: "2025",
    title: "devfest",
    subtitle: "The most anticipated tech event in Jos, Plateau State.",
    button: {
      text: "Get Your Ticket",
      href: "/devfest",
    },
    stats: [
      { label: "Attendees", value: 312 },
      { label: "Speakers", value: 53 },
    ],
  },

  {
    image: "/images/devFest.png",
    year: "2025",
    title: "devfest",
    subtitle: "The most anticipated tech event in Jos, Plateau State.",
    button: {
      text: "Get Your Ticket",
      href: "/devfest",
    },
    stats: [
      { label: "Attendees", value: 312 },
      { label: "Speakers", value: 53 },
    ],
  },
  // Add more slides here if needed
];

const Hero = () => {
  const textVariants = {
    hidden: { opacity: 0, y: 20 }, // Start hidden and slightly below
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8, // Duration of the animation
        ease: "easeOut",
      },
    },
  };

  // Variants for image animation
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // Scroll-triggered animation
  const scrollVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const iconVariants = {
    hidden: {
      y: -100, // Start off-screen above the viewport
      opacity: 0,
    },
    visible: {
      y: 0, // End at their natural position
      opacity: 1,
      transition: {
        type: "spring", // Gives a natural bounce effect
        stiffness: 50, // Adjusts the bounciness
        damping: 10, // Controls the spring "resistance"
        duration: 1.2, // Time taken to fall
      },
    },
  };

  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % eventSlides.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + eventSlides.length) % eventSlides.length);

  return (
    <div className="w-full flex grow">
      <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-16 h-grow">
        <div className="md:w-1/2 pt-6 md:pt-20 h-[500px] flex flex-col justify-between">
          <m.div
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="flex flex-col gap-6"
          >
            <m.h1
              variants={textVariants}
              className="md:w-1/2 text-center md:text-start font-extrabold text-3xl text-[#3C3C3C] font-inter"
            >
              Connect With Local Developers
            </m.h1>

            <m.p
              variants={textVariants}
              className="text-[#3C3C3C] text-lg text-center md:text-start"
            >
              Google Developer Group (GDG) Jos is a <br />
              Google-supported community where developers and tech enthusiasts
              come together to learn, share, and explore the latest
              technologies.
            </m.p>

            <m.div
              className="w-full flex gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                    delayChildren: 0.5,
                  },
                },
              }}
            >
              <a
                href="https://chat.whatsapp.com/LmwwxuXMprREqMy1aD871a"
                target="_blank"
                className="w-1/2"
              >
                <m.button
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5 },
                    },
                  }}
                  className="py-2.5 w-full bg-gradient-to-r from-[#34A853] to-[#264E8C] flex gap-2 items-center justify-center text-white rounded-md font-semibold"
                >
                  <Image
                    src="/svgs/userGroup.svg"
                    alt=""
                    width={29}
                    height={29}
                  />
                  Become a Member
                </m.button>
              </a>

              <Link prefetch={true} href="/devfest" className="w-1/2">
                <button className="py-2.5 flex w-full gap-3 justify-center items-center text-[#4285F4] border-2 border-[#4285F4] rounded-md font-semibold">
                  <SpiralIcon />
                  Devfest 2025
                </button>
              </Link>
            </m.div>
          </m.div>

          <m.div className="mt-auto flex pt-6  gap-1">
            <m.div variants={iconVariants}>
              <Image
                src="/svgs/solutions-web_720.svg"
                alt=""
                width={70}
                height={60}
              />
            </m.div>
            <m.div variants={iconVariants}>
              <Image
                src="/svgs/solutions-cloud_720.svg"
                alt=""
                width={70}
                height={60}
              />
            </m.div>
            <m.div variants={iconVariants}>
              <Image
                src="/svgs/solutions-mobile_720.svg"
                alt=""
                width={70}
                height={60}
              />
            </m.div>
            <m.div variants={iconVariants}>
              <Image
                src="/svgs/solutions-ai_720.svg"
                alt=""
                width={70}
                height={60}
              />
            </m.div>

            <m.div
              variants={{
                animate: {
                  x: [0, 10, -10, 0], // Move slightly left-right
                  transition: {
                    duration: 2, // Duration of one cycle
                    repeat: Infinity, // Loop the animation
                    ease: "easeInOut", // Smooth easing
                  },
                },
              }}
              animate="animate"
            >
              <Image
                src="/svgs/networking-graphic 1.svg"
                alt=""
                width={258}
                height={60}
              />
            </m.div>
          </m.div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full md:w-2/3 ">
            <p className="text-textDark text-lg text-start mb-2">
              Upcoming Events
            </p>
            <div className="relative w-full h-[490px]  bg-black overflow-hidden rounded-lg flex flex-col">
              {eventSlides.map((slide, idx) => (
                <Image
                  key={slide.image}
                  src={slide.image}
                  alt={slide.title}
                  height={500}
                  width={300}
                  className={`absolute w-full h-full object-cover transition-opacity duration-500 ${
                    idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                />
              ))}
              <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-[#FF0000] to-[#D9D9D900] z-20"></div>
              <div className="absolute bottom-0 left-0 w-full z-30 p-6 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-white text-4xl font-semibold italic font-inter lowercase tracking-wide">
                    {eventSlides[current].title}
                  </span>
                  <span className="bg-white text-[#FF0000] font-bold text-xl px-4 py-1 rounded-full">
                    {eventSlides[current].year}
                  </span>
                </div>
                <p className="text-white text-base md:text-lg font-medium mt-2">
                  {eventSlides[current].subtitle}
                </p>
                <a
                  href={eventSlides[current].button.href}
                  className="mt-2 inline-block text-[#FFD600] text-sm font-semibold"
                >
                  {eventSlides[current].button.text}
                </a>

                {/* Dots */}

                {/* Optional: Prev/Next buttons */}
                {/* <button onClick={prevSlide}>Prev</button>
                <button onClick={nextSlide}>Next</button> */}
              </div>
            </div>

            
            <div className="flex gap-2 mt-4 justify-center">
              {eventSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-3 h-3 rounded-full ${
                    idx === current ? "bg-black" : "bg-black/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
