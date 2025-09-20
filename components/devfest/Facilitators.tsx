'use client'
import React, { useRef } from "react";
import SpeakersCard from "./speakers/SpeakersCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const mentors = [
  {
    name: "Aslem M. Amama",
    role: "CEO, Future Feats & Startup Lab",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758317283/Rectangle_190_qeqzwo.png",
  },
  {
    name: "Robert John",
    role: "GDE (ML & GCP), Arm Ambassador, Edge Impulse Expert",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758316704/Rectangle_187_nb2b5f.png",
  },
  {
    name: "Umar Faruq Zubairu",
    role: "Founder/CEO & Google Developer Expert (Cloud)",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294809/Rectangle_185_ncljgv.png",
  },
];

const Facilitators = () => {
  const scrollRef = useRef(null);

  const scroll = (direction: any) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      //@ts-ignore
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
    <section className="w-full bg-[#4285F4] bg-opacity-5 mt-20 py-8 md:py-20 flex flex-col gap-10 items-center whitespace-nowrap">
      <h1 className="text-2xl md:text-[40px] mb-10 font-semibold font-inter text-textDark text-center leading-[44px]">
        Meet Our Facilitators
      </h1>

      <div className="w-full relative">
        {/* Mobile: horizontal scroll */}
        <div
          className="md:hidden mx-4 flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          ref={scrollRef}
        >
          {mentors.map((speaker, index) => (
            <div className="w-[230px] flex-shrink-0 break-words whitespace-normal" key={index}>
              <SpeakersCard
                color=""
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
          className="md:hidden absolute left-2 top-[130px] z-10 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center"
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
        {/* Desktop: flex row */}
        <div className="hidden md:flex w-full justify-center gap-x-6">
          {mentors.map((speaker, index) => (
            <div className="w-[230px] break-words whitespace-normal" key={index}>
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

export default Facilitators;