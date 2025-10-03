"use client";
import React from "react";
import { useWeather } from "../context/WeatherContext";
import DonutChart from "./DonutChart";
import TimeSeriesChart from "./HistoricalDataRange";
import "../style/analysisPage.css";

interface AnalysisPageProps {
  onBackToConfig: () => void;
}

const weatherVariableMetadata: Record<
  string,
  { name: string; color: string; unit: string }
> = {
  T2M: { name: "Temperature", color: "#f59e0b", unit: "°C" },
  WS2M: { name: "Wind Speed", color: "#06b6d4", unit: "m/s" },
  PRECTOTCORR: { name: "Precipitation", color: "#3b82f6", unit: "mm" },
  RH2M: { name: "Humidity", color: "#8b5cf6", unit: "%" },
  CLOUD_AMT: { name: "Cloud Amount", color: "#94a3b8", unit: "%" },
  AOD_55: { name: "Aerosol", color: "#f97316", unit: "AOD" },
  SNODP: { name: "Snow Depth", color: "#22d3ee", unit: "cm" },
};

const AnalysisPage: React.FC<AnalysisPageProps> = ({ onBackToConfig }) => {
  const { configuration, analysisData, isLoading } = useWeather();
  // Get selected weather variables
  const selectedVars = Object.keys(configuration.selectedWeatherVars).filter(
    (key) => configuration.selectedWeatherVars[key]
  );

  return (
    <div className="analysis-page">
      <div className="analysis-container"></div>
    </div>
  );
};

export default AnalysisPage;
