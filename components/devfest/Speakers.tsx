import Link from "next/link";
import React from "react";
import SpeakersCard from "./speakers/SpeakersCard";

const Speakers = () => {
  return (
    <section className="container mx-auto px-4 md:px-10 mt-10 py-6 flex flex-col items-center gap-4 md:gap-10">
      <h1 className="text-3xl md:text-[40px] font-medium text-textDark">
        Meet Our Speakers
      </h1>

      <div className="w-full grid md:grid-cols-4 gap-4">


        <SpeakersCard color='#34A853' name='Wisdom Dee Nimfa;' role='Social media and community Manager' />
        <SpeakersCard color='#4286F2' name='Gar Manji Michael' role='Backend Engineer' />
        <SpeakersCard color='#FF0000' name='Jaycinta Bhattacharya' role='Hackathon Wizard | Official code breaker | Generative Ai | Machine learning | Sodtware Engineering' />
        <SpeakersCard color='#FFA800' name='Emmanuel Nwanochie' role='Senior sofware engineer, Pujano ltd' />

      </div>
      <Link href="/devfest/speakers" className="text-[#4286F2] text-xl font-inter">
        See all Speakers
      </Link>
    </section>
  );
};

export default Speakers;
