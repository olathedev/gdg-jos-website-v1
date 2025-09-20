import Image from "next/image";
import React from "react";
import Marquee from "react-fast-marquee";

const ImagesMarque = () => {
  return (
    <section className="w-full">
      <Marquee speed={50} pauseOnHover={true}>
        {[
          "https://res.cloudinary.com/dxssytv0p/image/upload/v1758292408/pic2_cwzwle.jpg",
          "https://res.cloudinary.com/dxssytv0p/image/upload/v1758292385/pic6_nq2ydy.png",
          "https://res.cloudinary.com/dxssytv0p/image/upload/v1758292394/pic1_ssmzx7.jpg",
          "https://res.cloudinary.com/dxssytv0p/image/upload/v1758289190/devfestbanner_v12utp.jpg",
          "https://res.cloudinary.com/dxssytv0p/image/upload/v1758292404/pic4_aphqof.jpg",
          "https://res.cloudinary.com/dxssytv0p/image/upload/v1758292385/pic5_gifxgq.png",
          "https://res.cloudinary.com/dxssytv0p/image/upload/v1758292408/pic2_cwzwle.jpg",
          "https://res.cloudinary.com/dxssytv0p/image/upload/v1758371946/WhatsApp_Image_2025-09-20_at_11.40.01_c4i71t.jpg",
          "https://res.cloudinary.com/dxssytv0p/image/upload/v1758371949/WhatsApp_Image_2025-09-20_at_11.40.00_ytlbpn.jpg",
          "https://res.cloudinary.com/dxssytv0p/image/upload/v1758371963/WhatsApp_Image_2025-09-20_at_11.40.00_1_kelwit.jpg",
          "https://res.cloudinary.com/dxssytv0p/image/upload/v1758371954/WhatsApp_Image_2025-09-20_at_11.40.02_3_dhw8th.jpg",
        ].map((number, index) => (
          <div
            key={index}
            className="w-[304px] h-[360px] mx-2  rounded-xl relative"
          >
            <Image
              src={number}
              alt=""
              className="object-cover w-full h-full rounded-xl"
              fill
            />
          </div>
        ))}
      </Marquee>
    </section>
  );
};

export default ImagesMarque;
