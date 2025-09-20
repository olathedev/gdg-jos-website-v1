"use client"
import Image from "next/image";
import React, { useRef, useState } from "react";

const FromPrevYear: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handlePlayClick = (): void => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoPause = (): void => {
    setIsPlaying(false);
  };

  const handleVideoPlay = (): void => {
    setIsPlaying(true);
  };

  return (
    <section className="w-full px-4 mt-10 md:mt-20 py-6 flex flex-col items-center gap-6">
      <h1 className="text-2xl md:text-[45px] font-inter font-semibold text-textDark mb-4">
        From <span className="text-[#FFA800]">Devfest</span> Jos 2024
      </h1>

      <div className="w-full md:w-[840px] md:h-[500px] h-[250px] bg-slate-400 rounded-lg relative flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-lg"
          poster="https://res.cloudinary.com/dxssytv0p/image/upload/v1758291332/Rectangle_63_2x_1_kyobea.png"
          controls={true}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
        >
          <source
            src="https://res.cloudinary.com/dxssytv0p/video/upload/v1758373015/WhatsApp_Video_2024-12-07_at_07.29.59_a718ad78_qlb6oy.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        
      </div>
    </section>
  );
};

export default FromPrevYear;