import About from "@/components/df26/About";
import Faq from "@/components/df26/Faq";
import Footer, { CtaBand } from "@/components/df26/Footer";
import Gallery from "@/components/df26/Gallery";
import Hero from "@/components/df26/Hero";
import Nav from "@/components/df26/Nav";
import Partners from "@/components/df26/Partners";
import Speakers from "@/components/df26/Speakers";
import Team from "@/components/df26/Team";
import Tickets from "@/components/df26/Tickets";
import Tracks from "@/components/df26/Tracks";
import { Divider } from "@/components/df26/ui";

export default function Home() {
  return (
    <>
      <a
        href="#about"
        className="sr-only z-[60] rounded-full bg-white px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Nav />
      <main className="overflow-x-clip">
        <Hero />
        <Divider />
        <About />
        <Tracks />
        <Speakers />
        <Tickets />
        <Partners />
        <Gallery />
        <Team />
        <Faq />
        <CtaBand />
        <Divider />
      </main>
      <Footer />
    </>
  );
}
