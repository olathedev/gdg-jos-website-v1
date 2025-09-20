
'use client'
import Link from "next/link";
import React, { useRef } from "react";
import SpeakersCard from "./speakers/SpeakersCard";
import { speakers } from "@/data/data";
import { ChevronLeft, ChevronRight } from "lucide-react";

const lasttwo = [
  {
    name: "Gabriella Amaefule",
    role: "Backend Engineer - Fintech",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758295041/Rectangle_220_i8cmh7.png",
    color: "#FF0000",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Omar Faruk",
    role: "Google Developer Expert",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294225/Rectangle_169_fxrf1e.png",
    color: "#34A853",
    linkedin: "#",
    twitter: "#",
  },
];

export const mentors = [
  {
    name: "Robert John",
    role: "GDE, Arm Innovator",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758316704/Rectangle_187_nb2b5f.png",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Sodiq Akinjobi",
    role: "Google Developer Relations",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758313230/Rectangle_232_iqptdm.png",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Muhammad (Auwal MS) Samu",
    role: "Google Developer Communities Lead, SSA",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758316692/Rectangle_189_p4v5ar.png",
    linkedin: "#",
    twitter: "#",
  },
];

const Speakers = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - clientWidth
            : scrollLeft + clientWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="md:container md:mx-auto  md:px-10 md:mt-10 mt-6 py-6 flex flex-col items-center gap-4 md:gap-10">
      <h1 className="text-2xl md:text-[40px] font-semibold font-inter text-textDark">
        Meet Our Speakers
      </h1>

      <div className="w-full relative mt-6">
        {/* Mobile: horizontal scroll, Desktop: grid */}
        <div
          className="md:hidden mx-4 flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          ref={scrollRef}
        >
          {speakers.map((speaker, index) => (
            <div className="w-[220px] flex-shrink-0" key={index}>
              <SpeakersCard
                color={speaker.color}
                name={speaker.name}
                role={speaker.role}
                image={speaker.image}
              />
            </div>
          ))}
        </div>
        {/* Left Arrow */}
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scroll("left")}
          className="md:hidden absolute left-2  top-[130px] z-10 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center"
        >
          <ChevronLeft className="text-[#4285F4] text-sm" />
        </button>
        {/* Right Arrow */}
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scroll("right")}
          className="md:hidden absolute right-2 top-[130px] bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center"
        >
          <ChevronRight className="text-[#4285F4] text-sm" />
        </button>
        {/* Desktop grid */}
        <div className="hidden  md:grid md:grid-cols-5 gap-x-6 gap-y-8">
          {speakers.map((speaker, index) => (
            <SpeakersCard
              key={index} 
              color={speaker.color}
              name={speaker.name}
              role={speaker.role}
              image={speaker.image}
            />
          ))}
        </div>
      </div>
      <div className="hidden w-full md:flex justify-center gap-x-6 mt-8">
        {lasttwo.map((speaker, index) => (
          <div className="w-1/5" key={index}>
            <SpeakersCard
              color={speaker.color}
              name={speaker.name}
              role={speaker.role}
              image={speaker.image}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 md:mt-12 ">
        <h1 className="text-2xl text-center font-inter md:text-[40px] font-semibold text-textDark">
          Meet Our Mentors
        </h1>

        <div className="w-full flex flex-col md:flex-row justify-center gap-x-6 mt-6 md:mt-16">
          {mentors.map((speaker, index) => (
            <div className=" w-full md:w-[230px]" key={index}>
              <SpeakersCard
                color=""
                name={speaker.name}
                role={speaker.role}
                image={speaker.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Speakers;
