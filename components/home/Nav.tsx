import Image from 'next/image'
import React, { useState } from 'react'
import HamburgerVector from '../shared/icons/HamburgerVector'
import Link from 'next/link'

type Props = {
    openNav: () => void
}

const Nav = ({ openNav }: Props) => {
    return (
        <nav className="w-full py-10">
            <div className="flex justify-between items-center cursor-pointer">
                <Link href='/'>
                    <div className="flex items-center gap-2">
                        <Image src='/images/gdglogo.png' alt="" height={38} width={80} className='h-[35px] w-[60px] md:w-[80] md:h-[38]' />
                        <h3 className="text-xl font-light"><span className="font-bold">GDG</span> Jos</h3>
                    </div>
                </Link>

                <div className="cursor-pointer" onClick={openNav}>
                    <HamburgerVector />
                </div>
            </div>

        </nav>

    )
}

export default Nav