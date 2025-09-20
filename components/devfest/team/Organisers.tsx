import LinkedInIcon from "@/components/shared/icons/LinkedInIcon";
import Twittericon from "@/components/shared/icons/Twittericon";
import { organisers } from "@/data/data";
import Image from "next/image";
import React from "react";
import SpeakersCard from "../speakers/SpeakersCard";

const Organisers = () => {
  return (
    <div className="mt-6 md:mt-20 flex flex-col gap-4">
      <h2 className="text-2xl text-[#4286F2] md:text-[30px]">Organisers</h2>
      <hr />

      <div className="w-full grid grid-cols-4 justify-center gap-x-6">
        {organisers.map((org, idx) => (
          <div className="w-full break-words whitespace-normal" key={idx}>
            <SpeakersCard
              color={org.color}
              name={org.name}
              role={org.role}
              image={org.image}
              height={300}
            />

            <div className=""></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Organisers;
