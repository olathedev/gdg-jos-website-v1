import Image from "next/image";
import React from "react";

const FromPrevYear = () => {
  return (
    <section className="w-full px-4 mt-10 md:mt-20 py-6 flex flex-col items-center gap-6">
      <h1 className="text-3xl md:text-[45px] font-medium text-textDark mb-6">
        From <span className="text-[#FFA800]">Devfest</span> Jos 2024
      </h1>

      <div className="w-full md:w-[840px] h-[475px] bg-slate-400 rounded-lg relative flex items-center justify-center">
        <Image
          src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758291332/Rectangle_63_2x_1_kyobea.png"
          alt=""
          fill
          className="object-cover rounded-lg"
        />
        <Image
          src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758292937/Group_10_msdbfe.svg"
          alt=""
          height={75}
          width={75}
          className="z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
        />
      </div>
    </section>
  );
};

export default FromPrevYear;
