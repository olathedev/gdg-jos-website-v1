import { Fragment } from "react";
import { Star4 } from "./ui";

const words = ["DevFest Jos 2026", "Build", "Ship", "Secure", "Scale", "Learn", "Connect"];

function Band({ className, reverse = false, starClass }: { className: string; reverse?: boolean; starClass: string }) {
  const run = (
    <div className="flex shrink-0 items-center">
      {words.map((w) => (
        <Fragment key={w}>
          <span className="type-condensed px-6 text-4xl sm:text-5xl">{w}</span>
          <Star4 className={`size-6 shrink-0 sm:size-7 ${starClass}`} />
        </Fragment>
      ))}
    </div>
  );
  return (
    <div className={`absolute left-[-10%] w-[120%] py-3 sm:py-4 ${className}`}>
      <div className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {run}
        {run}
      </div>
    </div>
  );
}

/** Two crossing tickers that bridge the dark hero and the light page. */
export default function Marquee() {
  return (
    <div aria-hidden className="relative h-36 overflow-hidden bg-paper sm:h-44">
      <div className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <Band className="top-1/2 -translate-y-1/2 rotate-3 bg-g-blue text-white" starClass="text-h-yellow" reverse />
      <Band className="top-1/2 -translate-y-1/2 -rotate-2 bg-h-yellow text-ink" starClass="text-g-red" />
    </div>
  );
}
