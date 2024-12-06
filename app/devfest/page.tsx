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

      <section className="my-20 container mx-auto px-10 flex gap-10 items-center ">
        <div className="w-1/2 flex flex-col gap-6">
          <h1 className="text-[40px]  font-medium text-textDark leading-[44px]">
            Join The <br />
            Community
          </h1>

          <p className="text-lg text-textDark ">Join the GDG Jos community to connect with developers,
            designers, and tech enthusiasts. Share ideas, learn new skills, and collaborate on exciting projects to grow in your tech journey!</p>

          <div>
            <AppGradientButton className="px-8">
              <Image
                src="/svgs/userGroup.svg"
                alt=""
                width={29}
                height={29}
              />
              Become a Member
            </AppGradientButton>
          </div>
        </div>
        <div className="grow">
          <img src='/images/community.png' alt='' />
        </div>
      </section>

      <section className="my-20 container mx-auto px-10 flex flex-col gap-14 justify-center items-center text-textDark">
        <h1 className="text-[40px]  font-medium text-textDark">Sponsors/Partners</h1>
        <div className="flex items-center gap-10">
          <div className="">
            <Image src='/images/partners/wtm.png' alt="" width={200} height={80} />
          </div>
          <div>
            <Image src='/images/partners/onep.png' alt="" width={170} height={40} className="o" />

          </div>
          <Image src='/images/partners/cenaro.png' alt="" width={119} height={60} />
          <div className="">
            <Image src='/images/partners/malt.png' alt="" width={150} height={35} />
          </div>
          <div>
            <Image src='/images/partners/aiti.png' alt="" width={120} height={53} />
          </div>
          <div>
            <Image src='/images/partners/cardify.png' alt="" width={150} height={35} />
          </div>



        </div>

        <div className="flex items-center gap-10 mt-2">
          <div className="">
            <Image src='/images/partners/google.png' alt="" width={160} height={50} />
          </div>
          <div>
            <Image src='/images/partners/block.png' alt="" width={200} height={40} className="o" />

          </div>
          <Image src='/images/partners/codemagic.png' alt="" width={200} height={40} />
        </div>

        <div>
          <AppGradientButton className="px-8 mt-6">
            <Image
              src="/svgs/handshake.svg"
              alt=""
              width={29}
              height={29}
            />
            Become a Partner
          </AppGradientButton>
        </div>
      </section>

  
    </div>
  );
};

export default DevFest;
