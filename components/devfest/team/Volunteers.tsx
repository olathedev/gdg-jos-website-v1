import LinkedInIcon from '@/components/shared/icons/LinkedInIcon'
import Twittericon from '@/components/shared/icons/Twittericon'
import React from 'react'

const Volunteers = () => {
    const volunteersData = [
        {
            name: 'David Akinola',
            team: 'Media and Publicity',
            image: '/',
            x: '',
            ig: '',
            in: '',
            gh: ''
        },

        {
            name: 'Ola Michael',
            team: 'Dev Team/Speaker and Guests',
            image: '/',
            x: '',
            ig: '',
            in: '',
            gh: ''
        },

        {
            name: 'Daniel Lawson',
            team: 'Media and Publicity',
            image: '/',
            x: '',
            ig: '',
            in: '',
            gh: ''
        },
        {
            name: 'Ayam Samuel',
            team: 'Dev Team',
            image: '/',
            x: '',
            ig: '',
            in: '',
            gh: ''
        },

        {
            name: 'Victor Samuel',
            team: 'Dev Team',
            image: '/',
            x: '',
            ig: '',
            in: '',
            gh: ''
        },

        {
            name: 'Ayam Samuel',
            team: 'Dev Team',
            image: '/',
            x: '',
            ig: '',
            in: '',
            gh: ''
        },

        {
            name: 'Ayam Samuel',
            team: 'Dev Team',
            image: '/',
            x: '',
            ig: '',
            in: '',
            gh: ''
        },

        {
            name: 'Ayam Samuel',
            team: 'Dev Team',
            image: '/',
            x: '',
            ig: '',
            in: '',
            gh: ''
        },

        {
            name: 'Ayam Samuel',
            team: 'Dev Team',
            image: '/',
            x: '',
            ig: '',
            in: '',
            gh: ''
        },

        {
            name: 'Ayam Samuel',
            team: 'Dev Team',
            image: '/',
            x: '',
            ig: '',
            in: '',
            gh: ''
        }


    ]
    return (
        <div className='mt-10 md:mt-20 flex flex-col gap-4'>
            <h2 className='text-2xl text-[#4286F2] md:text-[30px]'>Volunteers</h2>
            <hr />

            <div className="grid grid-cols-1 md:grid-cols-5 justify-center items-center gap-4 md:gap-6">
                {volunteersData.map((organiser, index) => (
                    <div className="flex flex-col gap-2" key={index}>
                        <div className='h-[240px] md:w-full rounded-xl bg-[#D9D9D9]'>

                        </div>

                        <div className="text-textDark">
                            <h4 className=''> {organiser.name} </h4>
                            <p className='text-sm font-light'> {organiser.team} </p>
                        </div>

                        <div className="flex gap-2">
                            <a href={organiser.x} target='_blank' className='h-5 w-5 flex items-center justify-center bg-[#F9AB00] rounded-full'>
                                <Twittericon />
                            </a>

                            <a href={organiser.in} target='_blank' className='h-5 w-5 flex items-center justify-center bg-[#F9AB00] rounded-full'>
                                <LinkedInIcon />
                            </a>

                            <a href={organiser.ig} target='_blank' className='h-5 w-5 flex items-center justify-center bg-[#F9AB00] rounded-full'>
                                <LinkedInIcon />
                            </a>
                            <a href={organiser.gh} target='_blank' className='h-5 w-5 flex items-center justify-center bg-[#F9AB00] rounded-full'>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 0C8.68678 0 7.38642 0.265079 6.17317 0.780103C4.95991 1.29513 3.85752 2.05001 2.92893 3.00165C1.05357 4.92357 0 7.53026 0 10.2483C0 14.778 2.87 18.6211 6.84 19.9841C7.34 20.0661 7.5 19.7484 7.5 19.4717V17.7398C4.73 18.3547 4.14 16.3665 4.14 16.3665C3.68 15.1777 3.03 14.86 3.03 14.86C2.12 14.2246 3.1 14.2451 3.1 14.2451C4.1 14.3168 4.63 15.3007 4.63 15.3007C5.5 16.8584 6.97 16.3972 7.54 16.1513C7.63 15.4851 7.89 15.0342 8.17 14.778C5.95 14.5218 3.62 13.6404 3.62 9.73586C3.62 8.5983 4 7.6862 4.65 6.95858C4.55 6.70237 4.2 5.63655 4.75 4.25303C4.75 4.25303 5.59 3.97633 7.5 5.29836C8.29 5.07289 9.15 4.96016 10 4.96016C10.85 4.96016 11.71 5.07289 12.5 5.29836C14.41 3.97633 15.25 4.25303 15.25 4.25303C15.8 5.63655 15.45 6.70237 15.35 6.95858C16 7.6862 16.38 8.5983 16.38 9.73586C16.38 13.6507 14.04 14.5115 11.81 14.7678C12.17 15.0855 12.5 15.7106 12.5 16.6637V19.4717C12.5 19.7484 12.66 20.0764 13.17 19.9841C17.14 18.6109 20 14.778 20 10.2483C20 8.90245 19.7413 7.5698 19.2388 6.32643C18.7362 5.08305 17.9997 3.95329 17.0711 3.00165C16.1425 2.05001 15.0401 1.29513 13.8268 0.780103C12.6136 0.265079 11.3132 0 10 0Z" fill="#F9AB00" />
                                </svg>

                            </a>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Volunteers