"use client"
import AppGradientButton from "@/components/ui/AppGradientButton";
import Image from "next/image";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const DevFestInfo = () => {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <section
      ref={ref}
      className="relative container mx-auto md:mt-8 pb-6 md:pb-32 px-4 flex flex-col md:flex-row gap-10 md:gap-20 md:items-center md:px-10 overflow-hidden"
    >
      <div className="md:w-[55%] flex flex-col gap-3">
        <div className="flex items-center gap-1">
          <Image
            src="/svgs/devfesttextwhite.svg"
            alt=""
            height={72}
            width={200}
            className="h-[60px] w-[180px] md:w-[200px] md:h-[70px]"
          />
          <h1 className="text-4xl md:text-5xl text-[#FFA800] font-medium">Jos</h1>
        </div>

        <p className="text-lg text-textDark">
          Experience the latest in technology and connect with like-minded
          professionals at GDG Devfest Jos. This annual tech conference, hosted
          by the Google Developer Groups Jos community, brings together
          developers, designers, and tech enthusiasts from across the region.
          Explore cutting-edge topics, attend insightful sessions, and be part
          of the vibrant GDG Jos community. Dont miss out on this exciting
          event!
        </p>

        <div className="w-full flex justify-between px-3 md:px-0 md:gap-20 mt-4">
          <div className="flex flex-col text-center">
            <h1 className="text-4xl md:text-6xl font-medium text-textDark">
              <CountUp end={13} start={inView ? 0 : 0} duration={2} redraw={false} preserveValue={true} enableScrollSpy={false} useEasing={true} separator="," delay={0} {...(!inView && { end: 0 })} />
            </h1>
            <span className="border-b w-full my-2 md:my-4 border-[#F6BE2C]"></span>
            <p className="text-textDark">Speakers</p>
          </div>

          <div className="flex flex-col text-center">
            <h1 className="text-4xl md:text-6xl font-medium text-textDark">
              <CountUp
                end={inView ? 8 : 0}
                start={0}
                duration={2}
                redraw={false}
                preserveValue={true}
                enableScrollSpy={false}
                useEasing={true}
                separator=","
                delay={0}
              />
            </h1>
            <span className="border-b w-full my-2 md:my-4 border-[#F6BE2C]"></span>
            <p className="text-textDark">Sessions</p>
          </div>

          <div className="flex flex-col text-center">
            <h1 className="text-4xl md:text-6xl font-medium text-textDark">
              <CountUp
                end={inView ? 5 : 0}
                start={0}
                duration={2}
                redraw={false}
                preserveValue={true}
                enableScrollSpy={false}
                useEasing={true}
                separator=","
                delay={0}
              />
            </h1>
            <span className="border-b w-full my-2 md:my-4 border-[#F6BE2C]"></span>
            <p className="text-textDark">Tracks</p>
          </div>

          <div className="flex flex-col text-center">
            <h1 className="text-4xl md:text-6xl font-medium text-textDark">
              <CountUp
                start={0}
                end={inView ? 500 : 0}
                duration={2.5}
                redraw={false}
                preserveValue={true}
                enableScrollSpy={false}
                useEasing={true}
                separator=","
                delay={0}
                suffix="+"
              />
            </h1>
            <span className="border-b w-full my-2 md:my-4 border-[#F6BE2C]"></span>
            <p className="text-textDark">Attendees</p>
          </div>
        </div>


        <div className="w-full flex justify-center md:justify-start">


          <a href="https://bit.ly/devfestjos2024" target="_blank">
            <AppGradientButton className="mt-4 w-[200px]">
              <Image src="/svgs/ticket.svg" alt="" width={29} height={29} />
              Book a Ticket
            </AppGradientButton>
          </a>
        </div>
      </div>
      <div className="md:w-[45%] md:flex justify-center hidden">
        <Image
          src="https://res.cloudinary.com/dxssytv0p/image/upload/v1758290592/Devfest_jos_G_2_aosniw.svg"
          alt=""
          height={420}
          width={420}
          className="w-[350px] h-[350px] md:w-[420px] md:h-[420px]"
        />
      </div>

      <Image
        src="/images/hashtag.png"
        alt=""
        height={180}
        width={180}
        className="absolute -bottom-4 right-[40rem] -rotate-[25deg] opacity-50"
      />
    </section>
  );
};

export default DevFestInfo;
