import Header from "@/components/devfest/Header";
import Image from "next/image";
import React from "react";

const DevFest = () => {
  return (
    <div className="w-full min-h-screen">
      {/* header */}
      <div className="relative w-full h-auto pb-20">
        <Image
          src="/svgs/arrowrightrounded.svg"
          alt=""
          height={180}
          width={260}
          className="absolute -bottom-[4rem] md:-bottom-14 right-[10rem] md:right-[30rem] z-20"
        />
        <Header />
      </div>
    </div>
  );
};

export default DevFest;
