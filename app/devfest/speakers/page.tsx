"use client";
import FromPrevYear from "@/components/devfest/FromPrevYear";
import Moderators, { moderators } from "@/components/devfest/Moderators";
import PhotoGallery from "@/components/devfest/PhotoGallery";
import { mentors } from "@/components/devfest/Speakers";
import SpeakersCard from "@/components/devfest/speakers/SpeakersCard";
import { organisers, speakers } from "@/data/data";
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

        <div className="mt-6 md:mt-20">
          <h1 className="text-2xl text-center font-inter md:text-[40px] font-semibold text-textDark">
            Meet Our Mentors
          </h1>

          <div className="w-full flex flex-col md:flex-row justify-center gap-x-6 mt-6 md:mt-16">
            {mentors.map((speaker, index) => (
              <div className=" w-full md:w-[230px]" key={index}>
                <SpeakersCard
                  color=""
                  name={speaker.name}
                  role={speaker.role}
                  image={speaker.image}
                  isCentered
                />
              </div>
            ))}
          </div>

          <section className="w-full mt-10 px-5 py-8 flex flex-col gap-10 items-center">
            <h1 className="text-2xl md:text-[40px] font-inter md:mb-10 font-semibold text-textDark text-center leading-[44px]">
              Meet Our Moderators
            </h1>
            <div className="w-full flex flex-col md:flex-row  justify-center items-center gap-x-6">
              {moderators.map((mod, idx) => (
                <div
                  className="w-[230px] break-words whitespace-normal"
                  key={idx}
                >
                  <SpeakersCard
                    color={mod.color}
                    name={mod.name}
                    role={mod.role}
                    image={mod.image}
                    isCentered
                  />
                </div>
              ))}
            </div>

            <h1 className="text-2xl md:text-[40px] font-inter  md:mt-8 md:mb-6 font-semibold text-textDark text-center leading-[44px]">
              Meet Our Host
            </h1>

            <div className="w-[230px] break-words whitespace-normal">
              <SpeakersCard
                isCentered
                name="Loreta Katok Tohomdet"
                role="C.E.O Double Diverge Consult"
                image="https://res.cloudinary.com/dxssytv0p/image/upload/v1758318012/Rectangle_176_xxtkaw.png"
              />
            </div>

           

        
          </section>
        </div>
      </div>
    </DevfestLayout>
  );
};

export default Speakers;
