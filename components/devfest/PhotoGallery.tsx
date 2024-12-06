import React from "react";
import AppGradientButton from "../ui/AppGradientButton";
import SpiralIcon from "../shared/icons/SpiralIcon";

const PhotoGallery = () => {
  return (
    <section className="w-full mt-10 py-6 flex flex-col items-center gap-6 px-4">
      <h1 className="text-3xl md:text-[40px] font-medium text-textDark">Photo Gallery</h1>

      <div className="w-full flex justify-center gap-2">
        <AppGradientButton className="w-1/3 md:w-[200px]">
          <SpiralIcon />
          DevFest 2021
        </AppGradientButton>

        <AppGradientButton className="w-1/3 md:w-[200px]">
          <SpiralIcon />
          DevFest 2022
        </AppGradientButton>

        <AppGradientButton className="w-1/3 md:w-[200px]">
          <SpiralIcon />
          DevFest 2023
        </AppGradientButton>
      </div>

      <div className="h-28"></div>
    </section>
  );
};

export default PhotoGallery;
