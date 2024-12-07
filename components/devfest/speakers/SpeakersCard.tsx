import React from 'react'

type Props = {
    color: string,
    name: string,
    role: string,
    image: string
}

const SpeakersCard = ({ color, name, role, image }: Props) => {
    return (
        <div className="relative w-full h-[266px] bg-gray-200 rounded-xl overflow-hidden">
            <img src={`/images/speakers${image}`} alt="" className='h-full w-full object-cover transition-all duration-500 ease-in-out hover:scale-125' />
            <div className={`absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t ${`from-[${color}]`} to-transparent`}></div>
            <div className="absolute bottom-4 z-10 text-white px-4">
                <h3 className="">{name}</h3>
                <p className="text-sm">{role}</p>
            </div>
        </div>
    )
}

export default SpeakersCard