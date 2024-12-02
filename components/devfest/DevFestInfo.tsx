import AppGradientButton from "@/components/ui/AppGradientButton";
import Image from "next/image";

const DevFestInfo = () => {
  return (
    <section className="relative container mx-auto mt-8 pb-32 px-4 flex flex-col md:flex-row md:gap-20 md:items-center md:px-10">
      <div className="md:w-[55%] flex flex-col gap-3">
        <div className="flex items-center gap-1">
          <Image
            src="/svgs/devfesttextwhite.svg"
            alt=""
            height={72}
            width={200}
            className="h-[150px] w-[400px] md:w-[200px] md:h-[70px]"
          />

          <h1 className="text-5xl text-[#FFA800] font-medium">Jos</h1>
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

        <div className="flex gap-20 mt-4">
          <div className="flex flex-col text-center">
            <h1 className="text-6xl font-medium text-textDark">13</h1>
            <span className="border-b w-full my-4 border-[#F6BE2C]"></span>
            <p className="text-textDark">Speakers</p>
          </div>

          <div className="flex flex-col text-center">
            <h1 className="text-6xl font-medium text-textDark">8</h1>
            <span className="border-b w-full my-4 border-[#F6BE2C]"></span>
            <p className="text-textDark">Sessions</p>
          </div>

          <div className="flex flex-col text-center">
            <h1 className="text-6xl font-medium text-textDark">5</h1>
            <span className="border-b w-full my-4 border-[#F6BE2C]"></span>
            <p className="text-textDark">Tracks</p>
          </div>

          <div className="flex flex-col text-center">
            <h1 className="text-6xl font-medium text-textDark">500+</h1>
            <span className="border-b w-full my-4 border-[#F6BE2C]"></span>
            <p className="text-textDark">Attendees</p>
          </div>
        </div>

        <AppGradientButton className="mt-4 w-[200px]">
          <Image src="/svgs/ticket.svg" alt="" width={29} height={29} />
          Book a Ticket
        </AppGradientButton>
      </div>
      <div className="md:w-[45%]">
        <Image
          src="/images/devfestjos.png"
          alt=""
          height={420}
          width={420}
          className=""
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
