import React from "react";
import AppGradientButton from "../ui/AppGradientButton";
import SpiralIcon from "../shared/icons/SpiralIcon";

const PhotoGallery = () => {
  return (
    <section className="w-full mt-10 py-6 flex flex-col items-center gap-6">
      <h1 className="text-[40px] font-medium text-textDark">Photo Gallery</h1>

      <div className="flex gap-4">
        <AppGradientButton className="w-1/2 md:w-[200px]">
          <SpiralIcon />
          DevFest 2021
        </AppGradientButton>

        <AppGradientButton className="w-1/2 md:w-[200px]">
          <SpiralIcon />
          DevFest 2022
        </AppGradientButton>

        <AppGradientButton className="w-1/2 md:w-[200px]">
          <SpiralIcon />
          DevFest 2023
        </AppGradientButton>
      </div>

      <div className="h-28"></div>
    </section>
  );
};

export default PhotoGallery;
