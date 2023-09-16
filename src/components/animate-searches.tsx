"use client";

import { TypeAnimation } from "react-type-animation";

export function AnimateSearches() {
  return (
    <TypeAnimation
      sequence={[
        "Find all courses relating to natural landmarks",
        1000,
        "Find all courses relating to human history",
        1000,
        "Find all courses relating to entrepreneurship",
        1000,
        "Find all courses relating to game development",
        1000,
      ]}
      repeat={Infinity}
      className="after:text-orange-500 after:content-['|']"
    />
  );
}
