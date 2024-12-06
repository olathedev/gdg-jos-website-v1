import Link from "next/link";
import React from "react";

const Speakers = () => {
  return (
    <section className="container mx-auto px-4 md:px-10 mt-10 py-6 flex flex-col items-center gap-4 md:gap-10">
      <h1 className="text-3xl md:text-[40px] font-medium text-textDark">
        Meet Our Speakers
      </h1>

      <div className="w-full grid md:grid-cols-4 gap-4">
        <div className="relative w-full h-[266px] bg-gray-200 rounded-xl overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#4286F2] to-transparent"></div>
          <div className="absolute bottom-4 z-10 text-white px-4">
            <h3 className="">Manji Michael</h3>
            <p className="text-sm">Backend Developer</p>
          </div>
        </div>

        <div className="relative w-full h-[266px] bg-gray-200 rounded-xl overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FF0000] to-transparent"></div>
          <div className="absolute bottom-4 z-10 text-white px-4">
            <h3 className="">Manji Michael</h3>
            <p className="text-sm">Backend Developer</p>
          </div>
        </div>

        <div className="relative w-full h-[266px] bg-gray-200 rounded-xl overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FFA800] to-transparent"></div>
          <div className="absolute bottom-4 z-10 text-white px-4">
            <h3 className="">Manji Michael</h3>
            <p className="text-sm">Backend Developer</p>
          </div>
        </div>

        <div className="relative w-full h-[266px] bg-gray-200 rounded-xl overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#34A853] to-transparent"></div>
          <div className="absolute bottom-4 z-10 text-white px-4">
            <h3 className="">Manji Michael</h3>
            <p className="text-sm">Backend Developer</p>
          </div>
        </div>
      </div>

      <Link href="#" className="text-[#4286F2] text-xl font-inter">
        See all Speakers
      </Link>
    </section>
  );
};

export default Speakers;
