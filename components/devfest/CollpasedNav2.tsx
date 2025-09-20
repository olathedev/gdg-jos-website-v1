"use client";
import React from "react";
import Image from "next/image";
import { motion as m } from "framer-motion";
import BigSpiral from "../shared/icons/BigSpiral";
import HamburgerwhiteIcon from "../shared/icons/HamburgerwhiteIcon";
import Link from "next/link";
import Socials from "../home/Socials";

type Props = {
  closeNav: () => void;
};

const CollapsedNav = ({ closeNav }: Props) => {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-20 w-full h-screen overflow-hidden bg-white py-6  px-10"
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

      <div className="w-full h-full relative flex flex-col py-16 md:py-32 ">
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
          <Link href="/devfest">
            <div className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300">
              Home
            </div>
          </Link>
          <Link href="/devfest/outline">
            <div className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300">
              Event outline
            </div>
          </Link>
          <a href="">
            <span className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300">
              Get Your Swag
            </span>
          </a>
          <div className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300">
            Become a Partner
          </div>

          <a
            href="https://gdg.community.dev/events/details/google-gdg-jos-presents-devfest-2025/"
            target="_blank"
            className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300"
          >
            Book a Ticket
          </a>

          <Link href="/devfest/speakers">
            <div className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300">
              Our Speakers
            </div>
          </Link>

          <Link href="/devfest/team">
            <div className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300">
              Team
            </div>
          </Link>
        </div>

        <div className="mt-auto flex gap-2 items-center">

          <Socials />
        </div>
      </div>
    </m.div>
  );
};

export default CollapsedNav;
