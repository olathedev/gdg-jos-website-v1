import Image from 'next/image'
import React from 'react'
import AppGradientButton from '../ui/AppGradientButton'

const Swags = () => {
    return (
        <section className="w-full py-10 md:py-2 md:h-[890px] bg-[#F5FCFF] flex flex-col gap-4 md:gap-10 items-center justify-center">
            <h1 className="text-3xl md:text-[40px]  font-medium text-textDark text-center leading-[44px]">
                Get Your Devfest 2025
                <br /> Swags
            </h1>

            <div className="grid justify-center md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-3 w-full">
                    <Image
                        src="/images/swags/swag1.png"
                        alt=""
                        width={354}
                        height={360}
                        className="object-cover"
                    />
                    <div className="flex flex-col gap-0.5 text-textDark">
                        <h4 className="text-xl">Silver Package</h4>
                        <p>N15000</p>
                        <h4 className="text-xl font-medium text-[#F9AB00]">
                            Pre-Order Now
                        </h4>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <Image
                        src="/images/swags/swag2.png"
                        alt=""
                        width={354}
                        height={360}
                        className="object-cover"
                    />
                    <div className="flex flex-col gap-0.5 text-textDark">
                        <h4 className="text-xl">Silver Package</h4>
                        <p>N15000</p>
                        <h4 className="text-xl font-medium text-[#F9AB00]">
                            Pre-Order Now
                        </h4>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <Image
                        src="/images/swags/swag3.png"
                        alt=""
                        width={354}
                        height={360}
                        className="object-cover"
                    />
                    <div className="flex flex-col gap-0.5 text-textDark">
                        <h4 className="text-xl">Silver Package</h4>
                        <p>N15000</p>
                        <h4 className="text-xl font-medium text-[#F9AB00]">
                            Pre-Order Now
                        </h4>
                    </div>
                </div>
            </div>

            <a href="https://chat.whatsapp.com/LmwwxuXMprREqMy1aD871a" target="_blank" className="w">
                <AppGradientButton className="w-[230px] text-lg font-medium">See all Swags</AppGradientButton>
            </a>

        </section>
    )
}

export default Swags