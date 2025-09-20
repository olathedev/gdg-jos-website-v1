import Link from "next/link";
import React from "react";
import SpeakersCard from "./speakers/SpeakersCard";

export const speakers = [
  {
    name: "Sodiq Akinjobi",
    role: "Google Developer Relations",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758313230/Rectangle_232_iqptdm.png",
    color: "#4286F2",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Daser David",
    role: "Digital Bridge Institute President",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294422/Rectangle_116_obsgvk.png",
    color: "#4286F2",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Dickson Nsofor",
    role: "CEO, Kora",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294232/Rectangle_120_e847ro.png",
    color: "#FF0000",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Samuel Jok Gwott",
    role: "CEO Kefiano Group",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758313864/Rectangle_170_pyyyzd.png",
    color: "#FFA800",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Kefiano Kefas Ropshik",
    role: "CEO Kefiano Group",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294225/Rectangle_179_iu9dca.png",
    color: "#FFA800",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Yusuf Ahmed",
    role: "Thrive Media",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294225/Rectangle_165_q5kujc.png",
    color: "#4286F2",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Johnstone Kpilaakaa",
    role: "HumAngle Media Sub-editor",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294926/Rectangle_215_jzwyt3.png",
    color: "#FF0000",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Paul Umaru",
    role: "Microsoft Jos Community MTC",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294225/Rectangle_169_fxrf1e.png",
    color: "#FFA800",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Umar Zubairu",
    role: "Google Developer Expert",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294809/Rectangle_185_ncljgv.png",
    color: "#FFA800",
    linkedin: "#",
    twitter: "#",
  },

  {
    name: "Prince Konwea",
    role: "CP365 Backend Engineer",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758314648/Rectangle_229_1_ny93k3.png",
    color: "#FF0000",
    linkedin: "#",
    twitter: "#",
  },

  {
    name: "Oluwatobi Akanji",
    role: "Software Engineer",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294225/Rectangle_175_naxn5l.png",
    color: "#4286F2",
    linkedin: "#",
    twitter: "#",
  },

  {
    name: "Atuoha Anthony",
    role: "Fit Company FZ-LLC | Google Developer Expert (Flutter/Dart) & Mobile Software Engineer",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758295053/Rectangle_217_hzii0l.png",
    color: "#FF0000",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Joshua Ajagbe",
    role: "Senior Software Backend Engineers",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294226/Rectangle_161_g5xmrx.png",
    color: "#FF0000",
    linkedin: "#",
    twitter: "#",
  },

  {
    name: "Jatau Shedrack",
    role: "DIKOLUD CONSULTING LIMITED Salesforce Consultant/Developer",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294224/Rectangle_180_nuvyfe.png",
    color: "#34A853",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Mileke Kolawale",
    role: "Cloud Engineer",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758315118/Rectangle_230_aiizfk.png",
    color: "#FF0000",
    linkedin: "#",
    twitter: "#",
  },
];

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
