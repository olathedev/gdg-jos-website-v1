import Image from "next/image";
import React from "react";
import AppGradientButton from "../ui/AppGradientButton";
import Link from "next/link";

const EventSchedule = () => {
  return (
    <section className="md:container md:mx-auto  md:px-10 md:mt-10 mt-6 py-6 flex flex-col items-center gap-4 md:gap-10">
      <header className="mt-8 w-full flex flex-col items-center md:gap-4">
        <h1 className="text-2xl md:text-[40px] font-semibold font-inter text-textDark">
          Explore Our Event Schedule
        </h1>
        <p className="text-textDark md:text-lg text-center md:w-2/3">
          From inspiring keynotes to interactive workshops and panel
          discussions, our carefully curated program offers something for every
          developer and tech enthusiast.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
        <div className="w-[282px] h-[190px] bg-[#E9F9FF] rounded-2xl flex flex-col items-center justify-center p-4">
          <Image src="/svgs/event3.svg" alt="" height={35} width={35} />
          <h2 className="text-lg mb-2 font-semibold md:text-xl mt-4 font-inter text-[#0051FF]">
            Keynote & Talks
          </h2>
          <p className="text-sm text-center md:text-base text-[#3C3C3C]">
            Hear from industry leaders and Google experts
          </p>
        </div>

        <div className="w-[282px] h-[190px] bg-[#E9F9FF] rounded-2xl flex flex-col items-center justify-center p-4">
          <Image src="/svgs/event2.svg" alt="" height={35} width={35} />
          <h2 className="text-lg mb-2 font-semibold md:text-xl mt-4 font-inter text-[#0051FF]">
            Keynote & Talks
          </h2>
          <p className="text-sm text-center md:text-base text-[#3C3C3C]">
            Hear from industry leaders and Google experts
          </p>
        </div>

        <div className="w-[282px] h-[190px] bg-[#E9F9FF] rounded-2xl flex flex-col items-center justify-center p-4">
          <Image src="/svgs/event1.svg" alt="" height={35} width={35} />
          <h2 className="text-lg mb-2 font-semibold md:text-xl mt-4 font-inter text-[#0051FF]">
            Keynote & Talks
          </h2>
          <p className="text-sm text-center md:text-base text-[#3C3C3C]">
            Hear from industry leaders and Google experts
          </p>
        </div>
      </div>

      <Link href="/devfest/outline">
        <AppGradientButton className="w-[200px] mt-8">
          View Schedules
        </AppGradientButton>
      </Link>
    </section>
  );
};

export default EventSchedule;
