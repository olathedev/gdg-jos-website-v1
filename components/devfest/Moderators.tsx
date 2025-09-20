import React from "react";
import SpeakersCard from "./speakers/SpeakersCard";
import { organisers } from "@/data/data";

const moderators = [
  {
    name: "Nana Timothy",
    role: "IT Edge News",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758319089/Rectangle_215_1_ezsy5d.png", // replace with actual image path
    color: "",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Catherine Wuyep",
    role: "PICTDA Software Engineer",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758319093/Rectangle_216_n3ixr2.png", // replace with actual image path
    color: "",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Stephanie Ideho-Iraoya",
    role: "Awarded Microsoft MVP | Founder BESTECH | Web & UI/UX Designer | WordPress, SEO, Branding Expert",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758319094/Rectangle_217_1_vnlayp.png", // replace with actual image path
    color: "",
    linkedin: "#",
    twitter: "#",
  },
];

const Moderators = () => {
  return (
    <section className="w-full mt-10 px-5 py-8 md:py-20 flex flex-col gap-10 items-center">
      <h1 className="text-2xl md:text-[40px] font-inter md:mb-10 font-semibold text-textDark text-center leading-[44px]">
        Meet Our Moderators
      </h1>
      <div className="w-full flex flex-col md:flex-row  justify-center items-center gap-x-6">
        {moderators.map((mod, idx) => (
          <div className="w-[230px] break-words whitespace-normal" key={idx}>
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

      <h1 className="text-2xl md:text-[40px] font-inter  md:mt-10 md:mb-5 font-semibold text-textDark text-center leading-[44px]">
        Meet Our Organisers
      </h1>

      <div className="w-full  flex flex-col md:flex-row justify-center items-center gap-x-6">
        {organisers.map((org, idx) => (
          <div className="w-[230px] break-words whitespace-normal" key={idx}>
            <SpeakersCard
              color={org.color}
              name={org.name}
              role={org.role}
              image={org.image}
              isCentered
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Moderators;
