import LinkedInIcon from "@/components/shared/icons/LinkedInIcon";
import Twittericon from "@/components/shared/icons/Twittericon";
import React from "react";
import SpeakersCard from "./speakers/SpeakersCard";

const volunteers = [
  {
    name: "Aminu Yakubu M.",
    role: "Graphics Designer",
    image: "/images/volunteers/aminu.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Wuyep Catherine R.",
    role: "Software Engineer",
    image: "/images/volunteers/wuyep-catherine.jpg",
    unit: "Logistics/Partnership Unit",
  },
  {
    name: "Michael Olapade O.",
    role: "Web Developer",
    image: "/images/volunteers/michael-olapade.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Akinola David",
    role: "Web Developer",
    image: "/images/volunteers/akinola-david.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Joe Ubong",
    role: "Copywriter, Creative Write",
    image: "/images/volunteers/joe-ubong.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Mary Madaki",
    role: "Product Manager",
    image: "/images/volunteers/mary-madaki.jpg",
    unit: "Logistics & Vendors Unit",
  },
  {
    name: "Ayam Samuel",
    role: "Web Developer",
    image: "/images/volunteers/ayam-samuel.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Jubilant Agida",
    role: "Web Developer",
    image: "/images/volunteers/jubilant-agida.jpg",
    unit: "Partnership Unit",
  },
  {
    name: "James Peter",
    role: "Web Developer",
    image: "/images/volunteers/james-peter.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Ovye Collins Sunday",
    role: "Web Developer",
    image: "/images/volunteers/ovye-collins.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Ise Collins Arin",
    role: "Web Developer",
    image: "/images/volunteers/ise-collins.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Nshe Velnoe",
    role: "Content Creator",
    image: "/images/volunteers/nshe-velnoe.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Opaignmi Elisha O.",
    role: "Graphics Designer",
    image: "/images/volunteers/opaignmi-elisha.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Salim Tasiu Ibrahim",
    role: "Web Developer",
    image: "/images/volunteers/salim-tasiu.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Musa G. Yohanna",
    role: "Student",
    image: "/images/volunteers/musa-yohanna.jpg",
    unit: "Logistics Unit",
  },
  {
    name: "Pidima Zumji G.",
    role: "GSM Engineer, Teacher",
    image: "/images/volunteers/pidima-zumji.jpg",
    unit: "Partnership Unit",
  },
  {
    name: "Retyit Brengshak",
    role: "Data Analyst",
    image: "/images/volunteers/retyit-brengshak.jpg",
    unit: "Media & Publicity Unit",
  },
];

const Volunteers = () => (
  <section className="container mx-auto mt-10 md:my-20 flex flex-col  gap-4">
    <h1 className="text-3xl md:text-[40px] mb-14 font-medium text-textDark text-center leading-[44px]">
      Meet Our Volunteers
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-5 justify-center items-center gap-4 md:gap-6">
      {volunteers.map((vol, idx) => (
        <SpeakersCard
          key={idx}
          name={vol.name}
          role={vol.role}
          image={vol.image}
          isSpeaker={false}
          unit={vol.unit}
        />
      ))}
    </div>
  </section>
);

export default Volunteers;
