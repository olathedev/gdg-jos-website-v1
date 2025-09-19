import React from "react";
import SpeakersCard from "./speakers/SpeakersCard";

const mentors = [
  {
    name: "Aslem M. Amama",
    role: "CEO, Future Feats & Startup Lab",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758317283/Rectangle_190_qeqzwo.png",
  },
  {
    name: "Robert John",
    role: "GDE (ML & GCP), Arm Ambassador, Edge Impulse Expert",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758316704/Rectangle_187_nb2b5f.png",
  },
  {
    name: "Umar Faruq Zubairu",
    role: "Founder/CEO & Google Developer Expert (Cloud)",
    image:
      "https://res.cloudinary.com/dxssytv0p/image/upload/v1758294809/Rectangle_185_ncljgv.png",
  },
];

const Facilitators = () => {
  return (
    <section className="w-full  bg-[#4285F4] bg-opacity-5 mt-20 py-8 md:py-20 flex flex-col gap-10 *:justify-center whitespace-nowrap">
      <h1 className="text-3xl md:text-[40px] mb-10  font-medium text-textDark text-center leading-[44px]">
        Meet Our Facilitators
      </h1>

      <div className="w-full flex justify-center gap-x-6">
        {mentors.map((speaker, index) => (
          <div className="w-[230px] break-words whitespace-normal" key={index}>
            <SpeakersCard
              color=""
              name={speaker.name}
              role={speaker.role}
              image={speaker.image}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Facilitators;
