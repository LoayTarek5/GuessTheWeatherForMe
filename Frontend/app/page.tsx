"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import LandingPage from "./components/LandingPage";
import Configuration from "./components/Configuration";
import Analysis from "./components/AnalysisPage";
import { WeatherProvider } from "./context/WeatherContext";

const PAGE_STATE_KEY = "weather_page_state";

export default function Home() {
  const [showAnalysis, setShowAnalysis] = useState(() => {
    // Load page state from localStorage on mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(PAGE_STATE_KEY);
      return saved === "analysis";
    }
    return false;
  });

  // Save page state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        PAGE_STATE_KEY,
        showAnalysis ? "analysis" : "configuration"
      );
    }
  }, [showAnalysis]);

  const handleStartAnalysis = () => {
    document
      .querySelector(".inputs-container")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnalysisComplete = () => {
    setShowAnalysis(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToConfig = () => {
    setShowAnalysis(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <WeatherProvider>
      {!showAnalysis ? (
        <>
          <LandingPage onStartAnalysis={handleStartAnalysis} />
          <Configuration onAnalysisComplete={handleAnalysisComplete} />
        </>
      ) : (
        <Analysis onBackToConfig={handleBackToConfig} />
        
      )}
    </WeatherProvider>
  );
}