import React, { useState } from "react";
import WhyJunoBox from "./WhyJunoBox";
import styles from "./whyJuno.module.css";

export default function WhyJuno() {
  const typography = [
    {
      header: "Your Day , Fully Mapped",
      subHeader:
        "From Errands to meetings, Juno fits it all together seamlessly.",
      img: "placeholder",
    },
    {
      header: "Porductivity Withouuut the Buurnout",
      subHeader:
        "Group Similar tasks, save time,and breathe easier with every day.",
      img: "placeholder",
    },
    {
      header: "Pllans Like Human, Thinks Like a Genius.",
      subHeader:
        "Juno understands your day - location, time,flow - and plans it smart.",
      img: "placeholder",
    },
  ];

  return (
    <div className={styles.whyJunoContainer}>
      {typography.map((item, index) => (
        <WhyJunoBox key={index} item={item} />
      ))}
    </div>
  );
}
