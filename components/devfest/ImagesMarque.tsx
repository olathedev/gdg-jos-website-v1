import Image from "next/image";
import React from "react";
import Marquee from "react-fast-marquee";

const ImagesMarque = () => {
  return (
    <section className="w-full">
      <Marquee speed={50} pauseOnHover={true}>
        {[1, 2, 3, 4, 5, 6].map((number, index) => (
          <div
            key={index}
            className="w-[304px] h-[360px] mx-2 bg-gray-200 rounded-xl"
          >
            <Image
              src={`/images/image-marque/pic${number}.png`}
              alt=""
              width={304}
              height={360}
              className="object-cover w-full h-full rounded-xl"
            />
          </div>
        ))}
      </Marquee>
    </section>
  );
};

export default ImagesMarque;
