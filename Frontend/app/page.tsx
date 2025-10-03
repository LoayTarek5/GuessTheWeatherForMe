"use client";
import Image from "next/image";
import styles from "./page.module.css";
import LandingPage from "./components/LandingPage";

export default function Home() {
  const handleStartAnalysis = () => {
    document
      .querySelector(".inputs-container")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <LandingPage onStartAnalysis={handleStartAnalysis} />
    </>
  );
}
