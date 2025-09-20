'use client'
import CollapsedNav from '@/components/devfest/CollpasedNav2'
import HamburgerVector from '@/components/shared/icons/HamburgerVector'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

type Props = {
    children: React.ReactNode
}

const DevfestLayout = ({ children }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className='w-full'>

            {isOpen && (
                <CollapsedNav closeNav={() => setIsOpen(false)} />
            )}

            <nav className="w-full py-10 container mx-auto px-4 md:px-10">
                <div className="flex justify-between items-center">

                    <Link href='/'>
                        <div className="flex items-center gap-2">
                            <Image src='/images/gdglogo.png' alt="" height={38} width={80} className='h-[30px] w-[50px]  md:h-[30px]' />
                            <h3 className="text-xl font-light"><span className="font-bold">GDG</span> Jos</h3>
                        </div>
                    </Link>

                    <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
                        <HamburgerVector />
                    </div>
                </div>
            </nav>
            {children}
        </div>
    )
}

export default DevfestLayout