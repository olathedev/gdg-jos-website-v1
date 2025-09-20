import React from "react";
import Twittericon from "../shared/icons/Twittericon";
import Image from "next/image";

const Socials = () => {
  return (
    <div className="flex flex-col md:flex-row gap-2 items-center">
      <p>Follow us on</p>

      <div className="inline-flex gap-1">
        <a
          href="https://x.com/gdgjos2"
          className="h-[30px] w-[30px] rounded-full flex items-center justify-center bg-[#F9AB00]"
        >
          <Twittericon />
        </a>

        <a
          href="https://www.instagram.com/gdg_jos?igsh=Z3Fhd3hiMWZtOThw
"
          target="_blank"
          className="h-[30px] w-[30px] rounded-full flex items-center justify-center bg-white"
        >
          <Image src="/images/ig.png" alt="" height={30} width={30} />
        </a>
         <a
          href="https://www.linkedin.com/company/google-developer-groups-jos-gdg/"
          target="_blank"
          className="h-[30px] w-[30px] rounded-full flex items-center justify-center bg-white"
        >
          <Image src="/images/linkedin.png" alt="" height={30} width={30} />
        </a>
        <a
          href="https://www.Facebook.com/gdgjos
"
          target="_blank"
          className="h-[30px] w-[30px] rounded-full flex items-center justify-center bg-[#F9AB00]"
        >
          <svg
            width="10"
            height="21"
            viewBox="0 0 10 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.77106 10.5871H6.0945V20.3928H2.03927V10.5871H0.110596V7.14097H2.03927V4.91095C2.03927 3.31624 2.79679 0.819092 6.1306 0.819092L9.13444 0.831659V4.1767H6.95496C6.59746 4.1767 6.09477 4.35531 6.09477 5.11604V7.14418H9.12535L8.77106 10.5871Z"
              fill="white"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default Socials;
