import LinkedInIcon from "@/components/shared/icons/LinkedInIcon";
import Twittericon from "@/components/shared/icons/Twittericon";
import Image from "next/image";
import React from "react";

type Props = {
  color?: string;
  name: string;
  role: string;
  image: string;
  isSpeaker?: boolean;
  unit?: string;
  height?: number;
};

const SpeakersCard = ({
  color,
  name,
  role,
  image,
  isSpeaker = true,
  unit,
  height,
}: Props) => {
  return (
    <div className="flex flex-col">
      <div className="relative w-full bg-gray-200 rounded-xl overflow-hidden" style={{ height: `${height ?? 266}px` }}>
        <Image
          src={image}
          alt={name}
          fill
          quality={100}
          priority
          sizes="(max-width: 768px) 100vw, 400px"
          className="h-full w-full object-cover transition-all duration-500 ease-in-out hover:scale-110"
        />

        {color && (
          <div
            className="absolute bottom-0 left-0 w-full h-24"
            style={{
              background: `linear-gradient(to top, ${color}, transparent)`,
            }}
          ></div>
        )}
      </div>
      <div className=" grow mt-2 flex flex-col gap-1">
        <h3 className="text-xl md:text-lg font-bold">{name}</h3>
        <p className="text-sm text-[#3C3C3C]">{role}</p>
      </div>

      {isSpeaker ? (
        <div className="mt-auto flex gap-2 py-4">
          <div className="size-9 rounded-full bg-[#F9AB00] flex items-center justify-center">
            <LinkedInIcon />
          </div>
          <div className="size-9 rounded-full bg-[#F9AB00] flex items-center justify-center">
            <Twittericon />
          </div>
        </div>
      ) : (
        <div className="my-3 w-full h-8 flex items-center justify-center  bg-[#E4EEFF] rounded-full text-[#3C3C3C] text-sm">{unit}</div>
      )}
    </div>
  );
};

export default SpeakersCard;
