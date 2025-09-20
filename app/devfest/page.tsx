import AwaitsYou from "@/components/devfest/AwaitsYou";
import Community from "@/components/devfest/Community";
import DevFestInfo from "@/components/devfest/DevFestInfo";
import EventSchedule from "@/components/devfest/EventSchedule";
import Facilitators from "@/components/devfest/Facilitators";
import FromPrevYear from "@/components/devfest/FromPrevYear";
import Header from "@/components/devfest/Header";
import ImagesMarque from "@/components/devfest/ImagesMarque";
import Moderators from "@/components/devfest/Moderators";
import Pannelists from "@/components/devfest/Pannelists";
import PhotoGallery from "@/components/devfest/PhotoGallery";
import Products from "@/components/devfest/Products";
import Speakers from "@/components/devfest/Speakers";
import Swags from "@/components/devfest/Swags";
import Volunteers from "@/components/devfest/Volunteers";
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
      <EventSchedule />
      <Speakers />

      <Facilitators />
      <Pannelists />
      <Moderators />

      <Volunteers />

      <AwaitsYou />

      <Products />
      <Swags />

      <Community />

      <section className="my-20 hidden container mx-auto px-10 md:flex flex-col g justify-center items-center text-textDark">
        <h1 className="text-3xl md:text-[40px] mb-10  font-medium text-textDark">
          Sponsors/Partners
        </h1>
        <div className="flex items-center gap-10">
          <div className="">
            <Image
              src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/Google_logo_yavnha.png"
              alt=""
              width={170}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <Image
              src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364875/Startuplab_logo_tq73dh.png"
              alt=""
              width={200}
              height={60}
              className="object-cover"
            />
          </div>
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364869/Kora_logo_olzzpo.png"
            alt=""
            width={119}
            height={60}
          />

          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364868/Kefiano_global_foundaion_logo_gax88t.png"
            alt=""
            width={119}
            height={60}
          />
        </div>

        <div className="flex items-center gap-10 ">
          <div className="">
            <Image
              src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364874/nhub_logo_rgabpz.png"
              alt=""
              width={102}
              height={95}
            />
          </div>
          <div>
            <Image
              src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/Axia_Hub_Logo_zvvjji.png"
              alt=""
              width={120}
              height={53}
            />
          </div>

          <div>
            <Image
              src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364901/TAG_logo_cktzpg.png"
              alt=""
              width={143}
              height={70}
              className="object-cover"
            />
          </div>
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364855/Colab_logo_cxbh5x.png"
            alt=""
            width={190}
            height={50}
            className="object-cover"
          />

          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364868/KIMS_Caffe_logo_iqtd9g.png"
            alt=""
            width={190}
            height={50}
            className="object-cover"
          />

          <img
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/Futurefeat_logo_nxumgu.png"
            alt=""
            className="object-cover"
          />
          <img
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364855/ignite_logo_agf7km.png"
            alt=""
            className="object-cover"
          />
          <img
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364864/kchub_logo_cwp0ku.png"
            alt=""
            className="object-cover"
          />
        </div>

        <div className="flex items-center gap-10">
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364901/tedge_news_africa_logo_mlqtf9.png"
            alt=""
            width={270}
            height={60}
            className="object-cover"
          />
          <img
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364901/women_technmakers_logo_i6mgug.png"
            alt=""
            className="object-cover"
          />

          <img
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/Bluehouse_logo_p1gf7m.png"
            alt=""
            className="object-cover"
          />

          <img
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/A__logo_p9v7ch.png"
            alt=""
            className="object-cover"
          />

          <img
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364855/Joey_offair_logo_dfee0y.png"
            alt=""
            className="object-cover"
          />

          <img
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364874/media_center_logo_fuuxel.png"
            alt=""
            className="object-cover"
          />

          <img
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/chillers_logo_pzqhwh.png"
            alt=""
            className="object-cover"
          />
        </div>

        <div className="flex items-center gap-10">
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364875/plateau_exptress_services_group_logo_utsrxu.png"
            alt=""
            width={186}
            height={80}
            className="object-cover"
          />
          <img
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364869/Learn_Africa_Logo_kuiiem.png"
            alt=""
            className="object-cover"
          />

          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364855/codeplay72_logo_z98ukx.png"
            alt=""
            width={220}
            height={80}
            className="object-cover"
          />
        </div>

        <div>
          <AppGradientButton className="px-8 mt-10">
            <Image src="/svgs/handshake.svg" alt="" width={29} height={29} />
            Become a Partner
          </AppGradientButton>
        </div>
      </section>
    </div>
  );
};

export default DevFest;
