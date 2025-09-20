'use client';
import React, { useRef } from 'react';
import SpeakersCard from './speakers/SpeakersCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Panelist {
  name: string;
  role: string;
  image: string;
  color: string;
  linkedin: string;
  twitter: string;
}

const pannelists: Panelist[] = [
  {
    name: 'Tabitha Hris',
    role: 'CEO\nHris International',
    image:
      'https://res.cloudinary.com/dxssytv0p/image/upload/v1758317991/Rectangle_165_1_ijhctd.png',
    color: '#4286F2',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Longji Theodore',
    role: 'CEO\nnHUB Nigeria',
    image:
      'https://res.cloudinary.com/dxssytv0p/image/upload/v1758318088/Rectangle_174_1_qyrevj.png',
    color: '#FF0000',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Manji Wilson',
    role: 'Plateau State Government\nChief Technical Adviser',
    image:
      'https://res.cloudinary.com/dxssytv0p/image/upload/v1758317990/Rectangle_186_exuur0.png',
    color: '#FFA800',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Datong Gwaman',
    role: 'Director General\nPlateau State ICT Development Agency',
    image:
      'https://res.cloudinary.com/dxssytv0p/image/upload/v1758317989/Rectangle_188_iq3qfd.png',
    color: '#34A853',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Loreta Katok Tohomdet',
    role: 'C.E.O\nDouble Diverge Consult',
    image:
      'https://res.cloudinary.com/dxssytv0p/image/upload/v1758318012/Rectangle_176_xxtkaw.png',
    color: '#FF0000',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Sodiq Akinjobi',
    role: 'Google Developer Relations',
    image:
      'https://res.cloudinary.com/dxssytv0p/image/upload/v1758313230/Rectangle_232_iqptdm.png',
    color: '#4286F2',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Auwal M S',
    role: 'Engineering Manager\nDeveloper Relations Manager',
    image:
      'https://res.cloudinary.com/dxssytv0p/image/upload/v1758316692/Rectangle_189_p4v5ar.png',
    color: '#FF0000',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Robert John',
    role: 'GDE, Arm Innovator',
    image:
      'https://res.cloudinary.com/dxssytv0p/image/upload/v1758316704/Rectangle_187_nb2b5f.png',
    color: '#FFA800',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Timothy Kunat',
    role: 'Founder, Discover Jos',
    image:
      'https://res.cloudinary.com/dxssytv0p/image/upload/v1758317990/Rectangle_243_wl2tgj.png',
    color: '#34A853',
    linkedin: '#',
    twitter: '#',
  },
];

const Pannelists: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right'): void => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="w-full bg-[#D9D9D9] bg-opacity-20 py-8 md:py-20">
      <div className="container mx-auto flex flex-col gap-10">
        <h1 className="text-3xl md:text-[40px] mb-10 font-semibold font-inter text-textDark text-center leading-[44px]">
          Meet Our Panelists
        </h1>
        <div className="w-full relative">
          {/* Mobile: horizontal scroll */}
          <div
            className="md:hidden mx-4 flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            ref={scrollRef}
          >
            {pannelists.map((p, i) => (
              <div className="w-[230px] flex-shrink-0" key={i}>
                <SpeakersCard
                  color={p.color}
                  name={p.name}
                  role={p.role}
                  image={p.image}
                />
              </div>
            ))}
          </div>
          {/* Left Arrow */}
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll('left')}
            className="md:hidden absolute left-2 top-[130px] z-10 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center"
          >
            <ChevronLeft className="text-[#4285F4] text-sm" />
          </button>
          {/* Right Arrow */}
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll('right')}
            className="md:hidden absolute right-2 top-[130px] bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center"
          >
            <ChevronRight className="text-[#4285F4] text-sm" />
          </button>
          {/* Desktop: grid */}
          <div className="hidden md:grid md:grid-cols-5 gap-x-6 gap-y-8 justify-center">
            {pannelists.map((p, i) => (
              <SpeakersCard
                key={i}
                color={p.color}
                name={p.name}
                role={p.role}
                image={p.image}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pannelists;