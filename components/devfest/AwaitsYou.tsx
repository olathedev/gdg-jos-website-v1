import Image from "next/image";
import React from "react";

const AwaitsYou = () => {
  return (
    <section className="mt-10 container mx-auto px-4 md:px-10 flex flex-col items-center md:items-start gap-5">
      <Image
        src="/images/devfestabout.png"
        alt=""
        height={600}
        width={1100}
        className="w-full h-full md:w-[1100px] md:h-[600]"
      />

      <h1 className="text-3xl md:text-[40px] font-medium text-textDark text-center md:text-start w-2/3 md:w-full">
        What Awaits You at DevFest Jos
      </h1>

      <div className="flex flex-col items-center md:items-start gap-10 md:w-1/2 mt-4">
        <div className="w-full flex flex-col gap-2 md:flex-row items-center md:items-start md:gap-[65px]">
          <div className="md:w-1/2">
            <Image
              src="/svgs/technicalcontent.svg"
              alt=""
              height={80}
              width={91}
              className=""
            />
          </div>

          <div className="flex flex-col items-center md:items-start grow text-textDark">
            <h3 className="text-xl font-medium text-center md:text-start">Technical content</h3>
            <p className="text-center md:text-start px-6 md:px-0">
              Worldwide events hosted by the Google Developer Groups community,
              featuring leading experts on Google technologies in areas like
              Android, Firebase, Flutter, Machine Learning and so much more
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2 md:flex-row items-center md:items-start ">
          <div className="md:w-1/2">
            <Image
              src="/svgs/workshops.svg"
              alt=""
              height={80}
              width={91}
              className=""
            />
          </div>

          <div className="flex flex-col items-center md:items-start grow text-textDark">
            <h3 className="text-xl font-medium text-center md:text-start">Workshops</h3>
            <p className="text-center px-6 md:px-0 md:text-start">
              Full-day workshops, hands-on experiences, hacking and debugging
              events, all centered on your favorite Google technologies.
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2 md:flex-row items-center md:items-start md:gap-[80px]">
          <div className="md:1/3">
            <Image
              src="/svgs/networking.svg"
              alt=""
              height={66}
              width={70}
              className=""
            />
          </div>

          <div className="flex flex-col items-center md:items-start md:w-2/3 text-textDark">
            <h3 className="text-xl font-medium">Networking</h3>
            <p className="text-center md:text-start px-6 md:px-0">Meet and connect with other developers in your community.</p>
          </div>
        </div>
      </div>

      
    </section>
  );
};

export default AwaitsYou;
