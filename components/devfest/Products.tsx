import Image from "next/image";
import React from "react";
import ArCore from "../shared/icons/ArCore";
import MapIcon from "../shared/icons/MapIcon";

const Products = () => {
  const googleProducts = [
    {
      title: "Accessibility",
      icon: "/accessibility.svg",
    },

    {
      title: "cloud",
      icon: "",
    },

    {
      title: "Firebase",
      icon: "",
    },

    {
      title: "ARCore",
      icon: "",
    },
  ];
  return (
    <section className="w-full h-[650px] bg-[#FFFAEB] mt-20 flex flex-col gap-10 items-center justify-center">
      <h1 className="text-3xl md:text-[40px]  font-medium text-textDark text-center leading-[44px]">
        Stay updated on the products <br /> you love
      </h1>

      <div className="w-full flex flex-col items-center gap-8">
        <div className="flex gap-4 text-textDark">
          <div className=" bg-white rounded-full py-3 px-6 flex items-center justify-center gap-3">
            Accessibility
            <Image
              src="/svgs/google-products/accessibility2.svg"
              alt=""
              height={30}
              width={30}
            />
          </div>

          <div className=" bg-white rounded-full py-3 px-6 flex items-center justify-center gap-3">
            cloud
            <Image
              src="/svgs/google-products/accessibility.svg"
              alt=""
              height={30}
              width={30}
            />
          </div>

          <div className=" bg-white rounded-full py-3 px-6 flex items-center justify-center gap-3">
            Firebase
            <Image
              src="/svgs/google-products/accessibility.svg"
              alt=""
              height={30}
              width={30}
            />
          </div>

          <div className=" bg-white rounded-full py-3 px-6 flex items-center justify-center gap-3">
            ARCore
            <ArCore />
          </div>
        </div>

        <div className="flex gap-4">
          <div className=" bg-white rounded-full py-3 px-6 flex items-center justify-center gap-3">
            Android Studio
            <Image
              src="/svgs/google-products/andstud.svg"
              alt=""
              height={30}
              width={30}
            />
          </div>

          <div className=" bg-white rounded-full py-3 px-6 flex items-center justify-center gap-3">
            TensorFlow
            <Image
              src="/svgs/google-products/accessibility.svg"
              alt=""
              height={30}
              width={30}
            />
          </div>

          <div className=" bg-white rounded-full py-3 px-6 flex items-center justify-center gap-3">
            Google Assistant
            <Image
              src="/svgs/google-products/assistant.svg"
              alt=""
              height={30}
              width={30}
            />
          </div>

          <div className=" bg-white rounded-full py-3 px-6 flex items-center justify-center gap-3">
            Google Maps
            <MapIcon />
          </div>
        </div>

        <div className="flex gap-4">
          <div className=" bg-white rounded-full py-3 px-6 flex items-center justify-center gap-3">
            Flutter
            <Image
              src="/svgs/google-products/flutter.svg"
              alt=""
              height={30}
              width={30}
            />
          </div>

          <div className=" bg-white rounded-full py-3 px-6 flex items-center justify-center gap-3">
            Google Play
          </div>

          <div className=" bg-white rounded-full py-3 px-6 flex items-center justify-center gap-3">
            Google Wallet
            <Image
              src="/svgs/google-products/wallet-icon.svg"
              alt=""
              height={30}
              width={30}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
