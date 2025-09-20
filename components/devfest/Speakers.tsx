import Link from "next/link";
import React from "react";
import SpeakersCard from "./speakers/SpeakersCard";
import { speakers } from "@/data/data";



const lasttwo = [
  {
    name: "Gabriella Amaefule",
    role: "Backend Engineer - Fintech",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758295041/Rectangle_220_i8cmh7.png",
    color: "#FF0000",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Omar Faruk",
    role: "Google Developer Expert",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294225/Rectangle_169_fxrf1e.png",
    color: "#34A853",
    linkedin: "#",
    twitter: "#",
  },
];

export const mentors = [
  {
    name: "Robert John",
    role: "GDE, Arm Innovator",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758316704/Rectangle_187_nb2b5f.png",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Sodiq Akinjobi",
    role: "Google Developer Relations",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758313230/Rectangle_232_iqptdm.png",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Muhammad (Auwal MS) Samu",
    role: "Google Developer Communities Lead, SSA",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758316692/Rectangle_189_p4v5ar.png",
    linkedin: "#",
    twitter: "#",
  },
];

const Speakers = () => {
  return (
    <section className="container mx-auto px-4 md:px-10 mt-10 py-6 flex flex-col items-center gap-4 md:gap-10">
      <h1 className="text-2xl md:text-[40px] font-semibold font-inter text-textDark">
        Meet Our Speakers
      </h1>

      <div className="w-full grid md:grid-cols-5 gap-x-6 gap-y-8">
        {speakers.map((speaker, index) => (
          <SpeakersCard
            key={index}
            color={speaker.color}
            name={speaker.name}
            role={speaker.role}
            image={speaker.image}
          />
        ))}
      </div>
      <div className="hidden w-full md:flex justify-center gap-x-6 mt-8">
        {lasttwo.map((speaker, index) => (
          <div className="w-1/5" key={index}>
            <SpeakersCard
              color={speaker.color}
              name={speaker.name}
              role={speaker.role}
              image={speaker.image}
            />
          </div>
        ))}
      </div>

      <div className="mt-12 ">
        <h1 className="text-2xl text-center font-inter md:text-[40px] font-semibold text-textDark">
          Meet Our Mentors
        </h1>

        <div className="w-full flex justify-center gap-x-6 mt-16">
          {mentors.map((speaker, index) => (
            <div className="w-[230px]" key={index}>
              <SpeakersCard
                color=""
                name={speaker.name}
                role={speaker.role}
                image={speaker.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Speakers;
