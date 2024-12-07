import React from 'react'
import AppGradientButton from '../ui/AppGradientButton'
import Image from 'next/image'

const Community = () => {
    return (
        <section className="my-20 container mx-auto px-4 md:px-10 flex flex-col md:flex-row gap-10 md:items-center ">
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-4 md:gap-6">
                <h1 className="text-3xl md:text-[40px] text-center md:text-start  font-medium text-textDark leading-[44px] mb-4 md:mb-0">
                    Join The <br />
                    Community
                </h1>

                <img src='/images/community.png' className='md:hidden' alt='' />


                <p className="text-lg text-textDark text-center md:text-start">Join the GDG Jos community to connect with developers,
                    designers, and tech enthusiasts. Share ideas, learn new skills, and collaborate on exciting projects to grow in your tech journey!</p>

                <a href="https://chat.whatsapp.com/LmwwxuXMprREqMy1aD871a" target="_blank" className="w">

                    <AppGradientButton className="px-8">
                        <Image
                            src="/svgs/userGroup.svg"
                            alt=""
                            width={29}
                            height={29}
                        />
                        Become a Member
                    </AppGradientButton>
                </a>
            </div>
            <div className="grow hidden md:flex">
                <img src='/images/community.png' alt='' />
            </div>
        </section >
    )
}

export default Community