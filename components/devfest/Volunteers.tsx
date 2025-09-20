import LinkedInIcon from "@/components/shared/icons/LinkedInIcon";
import Twittericon from "@/components/shared/icons/Twittericon";
import React from "react";
import SpeakersCard from "./speakers/SpeakersCard";
import { volunteers } from "@/data/data";

const Volunteers = () => (
  <section className="container px-5 mx-auto mt-10 md:my-20 flex flex-col  gap-4">
    <h1 className="text-2xl md:text-[40px] mb-6 md:mb-14 font-semibold font-inter text-textDark text-center leading-[44px]">
      Meet Our Volunteers
    </h1>
    <div className="grid grid-cols-2 md:grid-cols-6 justify-center items-center gap-4 md:gap-6">
      {volunteers.map((vol, idx) => (
        <SpeakersCard
          key={idx}
          name={vol.name}
          role={vol.role}
          image={vol.image}
          isSpeaker={false}
          unit={vol.unit}
          height={220}
        />
      ))}
    </div>
  </section>
);

export default Volunteers;
