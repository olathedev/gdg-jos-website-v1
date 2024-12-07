"use client";
import React from "react";
import Image from "next/image";
import { motion as m } from "framer-motion";
import BigSpiral from "../shared/icons/BigSpiral";
import HamburgerwhiteIcon from "../shared/icons/HamburgerwhiteIcon";
import Link from "next/link";

type Props = {
    closeNav: () => void;
}

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
                    <a href=''>
                        <span className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300">
                            Get Your Swag
                        </span>
                    </a>
                    <div className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300">Become a Partner</div>

                    <a href="https://gdg.community.dev/events/details/google-gdg-jos-presents-devfest-2024/" target="_blank" className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300">Book a Ticket</a>

                    <Link href='/devfest/speakers'>
                        <div className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300">
                            Our Speakers
                        </div>
                    </Link>

                    <Link href='/devfest/team'>
                        <div className="text-2xl md:text-3xl font-bold text-textDark hover:translate-x-2 transition-transform duration-300">
                            Team
                        </div>
                    </Link>

                </div>

                <div className="mt-auto flex gap-2 items-center">
                    <p>Follow us on</p>

                    <div className="inline-flex gap-1">
                        <span className="h-[30px] w-[30px] rounded-full flex items-center justify-center bg-[#F9AB00]">
                            <svg
                                width="19"
                                height="15"
                                viewBox="0 0 19 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M18.1878 1.78071C17.545 2.06575 16.8535 2.25853 16.1284 2.34463C16.8688 1.90103 17.437 1.19914 17.7052 0.361407C17.0124 0.772384 16.2447 1.07052 15.4284 1.23122C14.7743 0.534675 13.8425 0.0993652 12.8106 0.0993652C10.8309 0.0993652 9.22524 1.70504 9.22524 3.68479C9.22524 3.96581 9.25706 4.23935 9.31856 4.50193C6.3388 4.35246 3.69675 2.92513 1.92826 0.755271C1.61969 1.2847 1.44268 1.90103 1.44268 2.55801C1.44268 3.80164 2.07612 4.89954 3.03764 5.54234C2.4502 5.52389 1.89697 5.36266 1.4138 5.09339C1.41354 5.10864 1.41354 5.12388 1.41354 5.13885C1.41354 6.87608 2.64993 8.32506 4.28982 8.65422C3.98927 8.73657 3.67189 8.78016 3.34541 8.78016C3.11385 8.78016 2.88951 8.75796 2.67079 8.71625C3.12695 10.1404 4.45078 11.177 6.02008 11.2062C4.79277 12.168 3.24701 12.741 1.56675 12.741C1.27797 12.741 0.991868 12.7241 0.711914 12.6907C2.29779 13.7084 4.18286 14.3017 6.20752 14.3017C12.8023 14.3017 16.4089 8.83845 16.4089 4.10004C16.4089 3.94469 16.4054 3.78987 16.3984 3.63639C17.0995 3.13102 17.7073 2.49972 18.1878 1.78071Z"
                                    fill="white"
                                />
                            </svg>
                        </span>

                        <span className="h-[30px] w-[30px] rounded-full flex items-center justify-center bg-[#F9AB00]"></span>
                        <span className="h-[30px] w-[30px] rounded-full flex items-center justify-center bg-[#F9AB00]">
                            <svg
                                width="10"
                                height="21"
                                viewBox="0 0 10 21"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M8.77106 10.5871H6.0945V20.3928H2.03927V10.5871H0.110596V7.14097H2.03927V4.91095C2.03927 3.31624 2.79679 0.819092 6.1306 0.819092L9.13444 0.831659V4.1767H6.95496C6.59746 4.1767 6.09477 4.35531 6.09477 5.11604V7.14418H9.12535L8.77106 10.5871Z"
                                    fill="white"
                                />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        </m.div>
    );
};

export default CollapsedNav;
