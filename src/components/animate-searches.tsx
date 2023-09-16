"use client";

import { TypeAnimation } from "react-type-animation";

export function AnimateSearches() {
  return (
    <TypeAnimation
      sequence={[
        "Learn how natural landmarks are created",
        1500,
        "Learn how games are developed",
        1500,
        "Learn how financial markets operate",
        1500,
        "Learn how humans developed cultures",
        1500,
        "Learn how black holes form",
        1500,
        "Learn how websites are built",
        1500,
        "Learn how life evolves naturally",
        1500,
        "Learn how to craft narratives",
        1500,
        "Learn how crime affects society",
        1500,
        "Learn how therapy aids individuals",
        1500,
        "Learn how religions shape cultures",
        1500,
        "Learn how fitness enhances health",
        1500,
      ]}
      repeat={Infinity}
      className="after:text-orange-500 after:content-['|']"
    />
  );
}
