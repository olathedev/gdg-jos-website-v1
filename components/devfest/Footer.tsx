import Image from 'next/image'
import React from 'react'
import Socials from '../home/Socials'

const Footer = () => {
    return (
        <footer className="w-full mt-20">
            <div className="h-[300px] bg-[#FFFAEB] flex flex-col gap-4 justify-center items-center text-textDark px-6">
                <h1 className="text-[28px] md:text-[38px] font-bold font-inter">Devfest Jos 2024</h1>
                <p className="text-lg text-center">We are looking forward to seeing you at DevFest Jos 2024! Get ready for an exciting day of <br /> tech, innovation, and community. Don’t miss out on this incredible event!</p>
            </div>

            <div className="w-full pt-16 pb-8 bg-[#011433] md:px-24 px-4 flex flex-col gap-10">
                <div className="w-full flex justify-between">
                    <div className="flex w-2/3 md:w-1/3 flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/images/gdglogo.png"
                                alt=""
                                height={38}
                                width={80}
                                className="h-[35px] w-[60px] md:w-[85] md:h-[38]"
                            />
                            <div className="text-xl font-light text-white ">
                                <p className="font-bold text-lg">Devfest</p>
                                <p className='text-lg -mt-2'>Jos</p>
                            </div>
                        </div>

                        <p className='text-white '>Join us at DevFest Jos to connect with tech leaders, explore innovation, and be part of a growing community shaping the future!</p>
                    </div>

                    <div className="flex grow justify-end">
                        <ul className='flex flex-col gap-2 font-bold text-white'>
                            <li>Get Your Swag</li>
                            <li>Become a Partners</li>
                            <li>Book a Ticket</li>
                            <li>Become a Speaker</li>
                            <li>Team</li>
                        </ul>
                    </div>
                </div>

                <div className="text-white">
                    <Socials />
                </div>

                <div className="w-full text-white flex justify-between text-xs">
                    <p>All rights reserved. (c) GDG Jos 2024</p>
                    <p>Privacy Policy</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer