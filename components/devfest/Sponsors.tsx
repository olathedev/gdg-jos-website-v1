'use client';
import React from 'react';
import Image from 'next/image';
import AppGradientButton from '../ui/AppGradientButton';

const SponsorsPartners: React.FC = () => {
  return (
    <section className="my-20  container mx-auto px-4 md:px-10 flex flex-col justify-center items-center text-textDark">
      <h1 className="text-3xl md:text-[40px] mb-10 font-medium text-textDark">
        Sponsors/Partners
      </h1>
      <div className="w-full grid grid-cols-2 gap-4 md:flex md:flex-col md:gap-10">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
          <div>
            <Image
              src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/Google_logo_yavnha.png"
              alt="Google"
              width={120}
              height={40}
              className="object-contain md:w-[170px] md:h-[56px]"
            />
          </div>
          <div>
            <Image
              src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364875/Startuplab_logo_tq73dh.png"
              alt="Startup Lab"
              width={140}
              height={42}
              className="object-contain md:w-[200px] md:h-[60px]"
            />
          </div>
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364869/Kora_logo_olzzpo.png"
            alt="Kora"
            width={80}
            height={42}
            className="object-contain md:w-[119px] md:h-[60px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364868/Kefiano_global_foundaion_logo_gax88t.png"
            alt="Kefiano Global Foundation"
            width={80}
            height={42}
            className="object-contain md:w-[119px] md:h-[60px]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
          <div>
            <Image
              src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364874/nhub_logo_rgabpz.png"
              alt="nHUB"
              width={70}
              height={66}
              className="object-contain md:w-[102px] md:h-[95px]"
            />
          </div>
          <div>
            <Image
              src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/Axia_Hub_Logo_zvvjji.png"
              alt="Axia Hub"
              width={84}
              height={37}
              className="object-contain md:w-[120px] md:h-[53px]"
            />
          </div>
          <div>
            <Image
              src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364901/TAG_logo_cktzpg.png"
              alt="TAG"
              width={100}
              height={49}
              className="object-contain md:w-[143px] md:h-[70px]"
            />
          </div>
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364855/Colab_logo_cxbh5x.png"
            alt="Colab"
            width={130}
            height={35}
            className="object-contain md:w-[190px] md:h-[50px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364868/KIMS_Caffe_logo_iqtd9g.png"
            alt="KIMS Caffe"
            width={130}
            height={35}
            className="object-contain md:w-[190px] md:h-[50px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/Futurefeat_logo_nxumgu.png"
            alt="Futurefeat"
            width={130}
            height={35}
            className="object-contain md:w-[190px] md:h-[50px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364855/ignite_logo_agf7km.png"
            alt="Ignite"
            width={130}
            height={35}
            className="object-contain md:w-[190px] md:h-[50px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364864/kchub_logo_cwp0ku.png"
            alt="KCHub"
            width={130}
            height={35}
            className="object-contain md:w-[190px] md:h-[50px]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364901/tedge_news_africa_logo_mlqtf9.png"
            alt="Tedge News Africa"
            width={190}
            height={42}
            className="object-contain md:w-[270px] md:h-[60px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364901/women_technmakers_logo_i6mgug.png"
            alt="Women Techmakers"
            width={130}
            height={35}
            className="object-contain md:w-[190px] md:h-[50px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/Bluehouse_logo_p1gf7m.png"
            alt="Bluehouse"
            width={130}
            height={35}
            className="object-contain md:w-[190px] md:h-[50px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/A__logo_p9v7ch.png"
            alt="A Logo"
            width={130}
            height={35}
            className="object-contain md:w-[190px] md:h-[50px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364855/Joey_offair_logo_dfee0y.png"
            alt="Joey Offair"
            width={130}
            height={35}
            className="object-contain md:w-[190px] md:h-[50px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364874/media_center_logo_fuuxel.png"
            alt="Media Center"
            width={130}
            height={35}
            className="object-contain md:w-[190px] md:h-[50px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364854/chillers_logo_pzqhwh.png"
            alt="Chillers"
            width={130}
            height={35}
            className="object-contain md:w-[190px] md:h-[50px]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364875/plateau_exptress_services_group_logo_utsrxu.png"
            alt="Plateau Express Services Group"
            width={130}
            height={56}
            className="object-contain md:w-[186px] md:h-[80px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364869/Learn_Africa_Logo_kuiiem.png"
            alt="Learn Africa"
            width={130}
            height={56}
            className="object-contain md:w-[190px] md:h-[80px]"
          />
          <Image
            src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758364855/codeplay72_logo_z98ukx.png"
            alt="Codeplay72"
            width={154}
            height={56}
            className="object-contain md:w-[220px] md:h-[80px]"
          />
        </div>
      </div>
      <div className="mt-10">
        <AppGradientButton className="px-8">
          <Image src="/svgs/handshake.svg" alt="Handshake" width={29} height={29} />
          Become a Partner
        </AppGradientButton>
      </div>
    </section>
  );
};

export default SponsorsPartners;