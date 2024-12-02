import AwaitsYou from "@/components/devfest/AwaitsYou";
import DevFestInfo from "@/components/devfest/DevFestInfo";
import FromPrevYear from "@/components/devfest/FromPrevYear";
import Header from "@/components/devfest/Header";
import ImagesMarque from "@/components/devfest/ImagesMarque";
import PhotoGallery from "@/components/devfest/PhotoGallery";
import Products from "@/components/devfest/Products";
import Speakers from "@/components/devfest/Speakers";
import SpiralIcon from "@/components/shared/icons/SpiralIcon";
import AppGradientButton from "@/components/ui/AppGradientButton";
import Image from "next/image";
import Link from "next/link";
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
      <DevFestInfo />
      <ImagesMarque />

      <FromPrevYear />

      <PhotoGallery />

      <Speakers />

      <AwaitsYou />

      <Products />
      <section className="w-full h-[890px] bg-[#F5FCFF] flex flex-col gap-10 items-center justify-center">
        <h1 className="text-[40px]  font-medium text-textDark text-center leading-[44px]">
          Get Your Devfest 2024
          <br /> Swags
        </h1>

        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col gap-3 w-full">
            <Image
              src="/images/swags/swag1.png"
              alt=""
              width={354}
              height={360}
              className="object-cover"
            />
            <div className="flex flex-col gap-0.5 text-textDark">
              <h4 className="text-xl">Silver Package</h4>
              <p>N15000</p>
              <h4 className="text-xl font-medium text-[#F9AB00]">
                Pre-Order Now
              </h4>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Image
              src="/images/swags/swag2.png"
              alt=""
              width={354}
              height={360}
              className="object-cover"
            />
            <div className="flex flex-col gap-0.5 text-textDark">
              <h4 className="text-xl">Silver Package</h4>
              <p>N15000</p>
              <h4 className="text-xl font-medium text-[#F9AB00]">
                Pre-Order Now
              </h4>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Image
              src="/images/swags/swag3.png"
              alt=""
              width={354}
              height={360}
              className="object-cover"
            />
            <div className="flex flex-col gap-0.5 text-textDark">
              <h4 className="text-xl">Silver Package</h4>
              <p>N15000</p>
              <h4 className="text-xl font-medium text-[#F9AB00]">
                Pre-Order Now
              </h4>
            </div>
          </div>
        </div>

        <AppGradientButton className="w-[230px] text-lg font-medium">See all Swags</AppGradientButton>
      </section>

      <section className="my-20"></section>
    </div>
  );
};

export default DevFest;
