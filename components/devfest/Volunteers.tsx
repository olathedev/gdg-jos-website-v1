import LinkedInIcon from "@/components/shared/icons/LinkedInIcon";
import Twittericon from "@/components/shared/icons/Twittericon";
import React from "react";
import SpeakersCard from "./speakers/SpeakersCard";

const volunteers = [
  {
    name: "Aminu Yakubu M.",
    role: "Graphics Designer",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758342013/Rectangle_219_qr6cda.png",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Wuyep Catherine R.",
    role: "Software Engineer",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341835/Rectangle_309_bvtyyj.png",
    unit: "Logistics/Partnership Unit",
  },
  {
    name: "Michael Olapade O.",
    role: "Web Developer",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758342142/WhatsApp_Image_2025-08-22_at_18.25.52_1_icm1xg.jpg",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Akinola David",
    role: "Web Developer",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758342023/Rectangle_295_z1qbfl.png",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Joe Ubong",
    role: "Copywriter, Creative Write",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758342024/Rectangle_297_cz7owc.png",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Mary Madaki",
    role: "Product Manager",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758342027/Rectangle_299_vpwf10.png",
    unit: "Logistics & Vendors Unit",
  },
  {
    name: "Ayam Samuel",
    role: "Web Developer",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341834/Rectangle_306_tdishw.png",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Jubilant Agida",
    role: "Web Developer",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341835/Rectangle_315_k6zoiw.png",
    unit: "Partnership Unit",
  },
  {
    name: "James Peter",
    role: "Web Developer",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341834/Rectangle_310_jhklb3.png",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Ovye Collins Sunday",
    role: "Web Developer",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341834/Rectangle_311_zwf2rl.png",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Ise Collins Arin",
    role: "Web Developer",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341835/Rectangle_308_fi3pfj.png",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Nshe Velnoe",
    role: "Content Creator",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341910/Rectangle_307_ysrn5b.png",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Opajinmi Elisha O.",
    role: "Graphics Designer",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758342014/Rectangle_227_yqvdep.png",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Salim Tasiu Ibrahim",
    role: "Web Developer",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341887/Rectangle_313_t545rw.png",
    unit: "Media & Publicity Unit",
  },
  {
    name: "Musa G. Yohanna",
    role: "Student",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341888/Rectangle_317_fiba3t.png",
    unit: "Logistics Unit",
  },
  {
    name: "Pidima Zumji G.",
    role: "GSM Engineer, Teacher",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341915/Rectangle_319_wfqckp.png",
    unit: "Partnership Unit",
  },
  {
    name: "Retyit Brengshak",
    role: "Data Analyst",
    image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341886/Rectangle_321_kd245u.png",
    unit: "Media & Publicity Unit",
  },
];

const Volunteers = () => (
  <section className="container mx-auto mt-10 md:my-20 flex flex-col  gap-4">
    <h1 className="text-3xl md:text-[40px] mb-14 font-semibold font-inter text-textDark text-center leading-[44px]">
      Meet Our Volunteers
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-6 justify-center items-center gap-4 md:gap-6">
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
