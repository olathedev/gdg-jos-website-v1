'use client'
import React, { Children } from "react";
import { motion as m } from "framer-motion";

type Props = {
  className: string;
  children: React.ReactNode;
};

const AppGradientButton = ({ className, children }: Props) => {
  return (
    <m.button
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5 },
        },
      }}
      className={`${className} py-2.5 bg-gradient-to-r from-[#34A853] to-[#264E8C] flex gap-2 items-center justify-center text-white rounded-md font-semibold`}
    >
      {children}
    </m.button>
  );
};

export default AppGradientButton;
