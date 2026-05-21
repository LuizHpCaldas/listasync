"use client";

import { ReactNode } from "react";

import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  delay?: number;
}

export default function FadeIn({ children, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
