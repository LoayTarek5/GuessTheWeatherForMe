"use client";
import type { ReactNode } from "react";
import "../style/landingPage.css";
import "../globals.css";

type LandingCardsProps = {
  icon?: ReactNode;
  header?: string;
  info?: string;
};

function LandingCards(props: LandingCardsProps) {
  return (
    <>
      <div className="landing-card glass">
        <div className="icon">{props.icon}</div>
        <h3>{props.header}</h3>
        <p>{props.info}</p>
      </div>
    </>
  );
}

export default LandingCards;
