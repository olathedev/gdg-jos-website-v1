import Footer from '@/components/devfest/Footer'
import React from 'react'

type Props = {
    children: React.ReactNode
}
const layout = ({ children }: Props) => {
    return (
        <div className="w-full">
            {children}
            <Footer />
        </div>
    )
}

export default layout