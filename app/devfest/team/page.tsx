import Organisers from '@/components/devfest/team/Organisers'
import Volunteers from '@/components/devfest/team/Volunteers'
import DevfestLayout from '@/layouts/DevfestLayout'
import React from 'react'

const page = () => {
    return (
        <DevfestLayout>
            <div className="container mx-auto px-4 md:px-10 py-4 md:py-10">
                <header className='md:my-10 w-full flex flex-col items-center md:gap-3'>
                    <h1 className='text-3xl md:text-[40px] font-semibold text-textDark mb-2'>Meet The <span className='text-[#F9AB00]'>Team</span></h1>
                    <p className='text-textDark md:text-lg text-center md:w-2/3'>Meet the amazing team behind DevFest Jos 2024! Our dedicated organizers and volunteers are the driving force behind this event. Get to know the passionate individuals working to bring you an unforgettable experience and foster innovation in the GDG Jos community!</p>
                </header>

                <Organisers />
                <Volunteers />
            </div>
        </DevfestLayout>
    )
}

export default page