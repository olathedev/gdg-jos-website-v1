import LinkedInIcon from "@/components/shared/icons/LinkedInIcon";
import Twittericon from "@/components/shared/icons/Twittericon";
import React from "react";
import SpeakersCard from "../speakers/SpeakersCard";
import { volunteers } from "@/data/data";

const Volunteers = () => (
  <section className="mt-10 md:mt-20 flex flex-col gap-4">
    <h2 className="text-2xl text-[#4286F2] md:text-[30px] font-semibold text-center md:text-left">
      Meet Our Volunteers
    </h2>
    <hr />
    <div className="grid grid-cols-1 md:grid-cols-6 justify-center items-center gap-4 md:gap-6">
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
