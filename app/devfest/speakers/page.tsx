import SpeakersCard from "@/components/devfest/speakers/SpeakersCard";
import { speakers } from "@/data/data";
import DevfestLayout from "@/layouts/DevfestLayout";
import React from "react";

const Speakers = () => {
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
  return (
    <DevfestLayout>
      <div className="container mx-auto px-4 md:px-10 py-4 md:py-10">
        <header className="md:mt-8 mb-14 w-full flex flex-col items-center md:gap-3">
          <h1 className="text-2xl md:text-[40px] font-semibold font-inter text-textDark mb-2">
            Meet Our Speakers
          </h1>
          <p className="text-textDark md:text-lg text-center md:w-2/3">
            Meet the inspiring speakers of DevFest Jos! Gain insights from
            industry leaders and tech experts who are shaping the future of
            innovation. Interested in joining them? Apply below to share your
            ideas and make an impact within our vibrant community.
          </p>
        </header>

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
          {lasttwo.map((speaker, index) => (
            <SpeakersCard
              key={index}
              color={speaker.color}
              name={speaker.name}
              role={speaker.role}
              image={speaker.image}
            />
          ))}
        </div>
      </div>
    </DevfestLayout>
  );
};

export default Speakers;
