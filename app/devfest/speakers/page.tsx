import SpeakersCard from '@/components/devfest/speakers/SpeakersCard'
import DevfestLayout from '@/layouts/DevfestLayout'
import React from 'react'

const Speakers = () => {
  return (
    <DevfestLayout>
      <div className="container mx-auto px-4 md:px-10 py-4 md:py-10">
        <header className='md:my-10 w-full flex flex-col items-center md:gap-3'>
          <h1 className='text-2xl md:text-[40px] font-semibold text-textDark mb-2'>Meet Our Speakers</h1>
          <p className='text-textDark md:text-lg text-center md:w-2/3'>Meet the inspiring speakers of DevFest Jos! Gain insights from industry leaders and tech experts who are shaping the future of innovation. Interested in joining them? Apply below to share your ideas and make an impact within our vibrant community.</p>
        </header>

        <div className="mt-6 md:mt-16 grid md:grid-cols-4 gap-4 md:gap-6">
          <SpeakersCard color='#FF0000' name='Wisdom Dee Nimfa;' role='Social media and community Manager' image='/wisdom.png' />
          <SpeakersCard color='#4286F2' name='Gar Manji Michael' role='Backend Engineer' image='/gar.jpeg' />
          <SpeakersCard color='#34A853' name='Jaycinta Bhattacharya' role='Hackathon Wizard | Official code breaker | Generative Ai | Machine learning | Sodtware Engineering' image='/jay.jpeg' />
          <SpeakersCard color='#FFA800' name='Emmanuel Nwanochie' role='Senior sofware engineer, Pujano ltd' image='/emma.png' />
          <SpeakersCard color='#34A853 ' name='Kingsley Ezekiel;' role='Cyber Security Analyst, USCO' image='/kingsley.jpeg' />

          <SpeakersCard color='#FF0000' name='Paul Michael;' role='Founder and CEO , 72 Academy and Innovation LTD' image='/pm.png' />
          <SpeakersCard color='#FFA800' name='Joy Ajiboye;' role='Software Engineer' image='/joy.jpeg' />
          <SpeakersCard color='#34A853' name='Abdallah Haggos;' role='Founder - ClimateTech Nigeria' image='/haggos.png' />
          <SpeakersCard color='#FFA800' name='Paul Umaru;' role='MCT | Microsoft EMEA Gold Ambassador | Application Consultant | Ai expert' image='/paulu.jpeg' />
          <SpeakersCard color='#4286F2' name='Dinfa Dashe;' role='Blockchain Professional' image='/dinfa.jpeg' />





        </div>
      </div>
    </DevfestLayout>
  )
}

export default Speakers