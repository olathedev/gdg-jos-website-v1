import Image from 'next/image'
import React, { useState } from 'react'
import HamburgerVector from '../shared/icons/HamburgerVector'

type Props = {
    openNav: () => void
}

const Nav = ({ openNav }: Props) => {
    return (
        <nav className="w-full py-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Image src='/images/gdglogo.png' alt="" height={42} width={97} className='h-[35px] w-[60px] md:w-full md:h-full' />
                    <h3 className="text-xl font-light"><span className="font-bold">GDG</span> Jos</h3>
                </div>

                <div className="cursor-pointer" onClick={openNav}>
                    <HamburgerVector />
                </div>
            </div>

        </nav>

    )
}

export default Nav