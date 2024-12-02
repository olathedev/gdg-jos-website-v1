import Image from "next/image";
import React from "react";

const AwaitsYou = () => {
  return (
    <section className="mt-10 container mx-auto px-10 flex flex-col gap-5">
      <Image
        src="/images/devfestabout.png"
        alt=""
        height={600}
        width={1100}
        className=""
      />

      <h1 className="text-[40px] font-medium text-textDark">
        What Awaits You at DevFest Jos
      </h1>

      <div className="flex flex-col gap-10 md:w-1/2">
        <div className="w-full flex flex-col md:flex-row md:gap-[65px]">
          <div className="w-1/2">
            <Image
              src="/svgs/technicalcontent.svg"
              alt=""
              height={80}
              width={91}
              className=""
            />
          </div>

          <div className="flex flex-col grow text-textDark">
            <h3 className="text-xl font-medium">Technical content</h3>
            <p>
              Worldwide events hosted by the Google Developer Groups community,
              featuring leading experts on Google technologies in areas like
              Android, Firebase, Flutter, Machine Learning and so much more
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row ">
          <div className="w-1/2">
            <Image
              src="/svgs/workshops.svg"
              alt=""
              height={80}
              width={91}
              className=""
            />
          </div>

          <div className="flex flex-col grow text-textDark">
            <h3 className="text-xl font-medium">Workshops</h3>
            <p>
              Full-day workshops, hands-on experiences, hacking and debugging
              events, all centered on your favorite Google technologies.
            </p>
          </div>
        </div>

        <div className="w-full flex gap-[80px]">
          <div className="1/3">
            <Image
              src="/svgs/networking.svg"
              alt=""
              height={66}
              width={70}
              className=""
            />
          </div>

          <div className="flex flex-col w-2/3 text-textDark">
            <h3 className="text-xl font-medium">Networking</h3>
            <p>Meet and connect with other developers in your community.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AwaitsYou;
