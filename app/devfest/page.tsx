import CalendarIcon from "@/components/shared/icons/CalendarIcon";
import HamburgerVector from "@/components/shared/icons/HamburgerVector";
import Locationicon from "@/components/shared/icons/Locationicon";
import AppGradientButton from "@/components/ui/AppGradientButton";
import Image from "next/image";
import React from "react";

const DevFest = () => {
  return (
    <div className="w-full">
      {/* header */}

      <div className="relative w-full bg-devfest-hero-banner bg-center bg-cover min-h-[90vh] md:min-h-[95vh]">
        <div className="absolute w-full h-full bg-black bg-opacity-85 z-0"></div>
        <nav className="relative z-10 container mx-auto px-4 md:px-10 py-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image
                src="/images/gdglogo.png"
                alt=""
                height={38}
                width={80}
                className="h-[35px] w-[60px] md:w-[80] md:h-[38]"
              />
              <h3 className="text-xl font-light text-white">
                <span className="font-bold">GDG</span> Jos
              </h3>
            </div>

            <div className="cursor-pointer">
              <HamburgerVector />
            </div>
          </div>
        </nav>
        <div className="relative md:mt-6 z-10 w-full h-full flex items-center justify-center px-4">
          <div className="w-full flex flex-col h-full grow items-center justify-center">
            <Image
              src="/svgs/devfesttext.svg"
              alt=""
              height={700}
              width={200}
              className="h-[150px] w-[400px] md:w-[700px] md:h-[200px]"
            />

            <h3 className="text-white text-center tex-xl md:text-2xl font-medium">
              The most anticipated tech event
              <br /> in Jos, Plateau State
            </h3>

            <div className="w-full md:w-auto flex  gap-4 md:gap-6 mt-8">
              <AppGradientButton className="w-1/2 md:w-[200px]">
                <Image
                  src="/svgs/handshake.svg"
                  alt=""
                  width={29}
                  height={29}
                />
                Become a Partner
              </AppGradientButton>

              <AppGradientButton className="w-1/2 md:w-[200px]">
                <Image src="/svgs/mic.svg" alt="" width={29} height={29} />
                Become a Partner
              </AppGradientButton>
            </div>

            <div className="border-2 border-white rounded-lg py-2 px-8 flex flex-col gap-2 md:flex-row md:gap-10 items-center justify-between mt-8 text-white">
              <div className="flex items-center gap-1">
                <span className=""></span>
                <CalendarIcon />
                7th December, 2024
              </div>
              <div className="flex md:items-center gap-1 justify-center">
                <Locationicon />
                <p className="text-center">
                  Mallam A. Adamu Lecture Theatre, University of Jos Permanent
                  Site
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevFest;
