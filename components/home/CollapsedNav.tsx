"use client";
import React from "react";
import Image from "next/image";
import { motion as m } from "framer-motion";
import BigSpiral from "../shared/icons/BigSpiral";
import Link from "next/link";
import Socials from "./Socials";

type Props = {
  closeNav: () => void;
}

const CollapsedNav = ({ closeNav }: Props) => {
  return (
    <m.div
      initial={{ opacity: 0 }} // Start invisible
      animate={{ opacity: 1 }} // Fade in
      exit={{ opacity: 0 }} // Fade out
      transition={{ duration: 0.5 }}
      className="fixed inset-0  w-full h-screen overflow-hidden bg-white py-10 container mx-auto px-10 z-40"
    >

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/images/gdglogo.png"
            alt=""
            height={38}
            width={80}
            className="h-[35px] w-[60px] md:w-[85] md:h-[38]"
          />
          <h3 className="text-xl font-light text-black">
            <span className="font-bold">GDG</span> Jos
          </h3>
        </div>

        <div className="cursor-pointer" onClick={closeNav}>
          close
        </div>
      </div>


      <div className="w-full h-full relative flex flex-col py-20  md:py-32 ">
        <Image
          src="/svgs/sting.svg"
          alt=""
          height={400}
          width={450}
          className="md:w-full md:h-full w-[200px] h-[150px] absolute md:right-0 md:top-0 bottom-32 right-9 -z-10"
        />
        <span className="absolute left-[24rem] bottom-20">
          <BigSpiral />
        </span>
        <div className="flex flex-col gap-4 cursor-pointer">
          <a href="" className="text-2xl md:text-3xl font-bold text-textDark">
            Become a Member
          </a>
          <div className="text-2xl md:text-3xl font-bold text-textDark">Events</div>
          <a href="/devfest" className="text-2xl md:text-3xl font-bold text-textDark">DevFest</a>
          <a href="#" className="text-2xl md:text-3xl font-bold text-textDark">
            Become a Partner
          </a>

          <Link href='/devfest/team' className="text-2xl md:text-3xl font-bold text-textDark">Team</Link>
          <div className="text-2xl md:text-3xl font-bold text-textDark">Contact Us</div>
        </div>

        <div className="mt-auto flex gap-2 items-center">
          <p>Follow us on</p>

          <div className="inline-flex gap-1">
            <Socials />
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default CollapsedNav;
