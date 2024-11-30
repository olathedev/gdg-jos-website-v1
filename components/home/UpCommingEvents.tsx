import React from 'react'

const UpCommingEvents = () => {
  return (
     <div className="w-2/3">
              <p className="text-textDark text-lg text-start mb-2">Upcoming Events</p>
              <div className="w-full h-full  bg-red-400 rounded-lg">

              </div>

              <div className="flex justify-center mt-4 space-x-2">
                {sampleEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => instanceRef.current?.moveToIdx(idx)}
                    className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${currentSlide === idx ? 'bg-textDark' : 'bg-[#D9D9D9]'}
            `}
                  />
                ))}
              </div>
            </div>
  )
}

export default UpCommingEvents