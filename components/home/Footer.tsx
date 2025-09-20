import React from "react";
import Socials from "./Socials";

const Footer = () => {
  return (
    <footer className="mt-auto py-4 w-full  flex flex-col gap-4 md:flex-row items-center justify-between text-textDark ">
      <Socials />

      <div className="flex text-textDark text-xs">
        <p>All rights reserved. (c) GDG Jos 2025</p>
        <p>Privacy Policy</p>
      </div>
    </footer>
  );
};

export default Footer;
