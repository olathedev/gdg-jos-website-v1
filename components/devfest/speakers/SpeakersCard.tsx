import React from 'react'

type Props = {
    color: string,
    name: string,
    role: string,
}

const SpeakersCard = ({ color, name, role }: Props) => {
    return (
        <div className="relative w-full h-[266px] bg-gray-200 rounded-xl overflow-hidden">
            <div className={`absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t ${`from-[${color}]`} to-transparent`}></div>
            <div className="absolute bottom-4 z-10 text-white px-4">
                <h3 className="">{name}</h3>
                <p className="text-sm">{role}</p>
            </div>
        </div>
    )
}

export default SpeakersCard