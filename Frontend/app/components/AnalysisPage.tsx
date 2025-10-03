"use client";
import React, { useState } from "react";

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
  const [selectedChartVariable, setSelectedChartVariable] = useState<
    string | null
  >(selectedVars[0] || null);

  const handleDownloadCSV = () => {
    if (!analysisData?.results) return;

    // Collect all unique historical dates from all parameters
    const allDates = new Set<string>();
    Object.values(analysisData.results.Data).forEach((data) => {
      Object.keys(data.previousDates).forEach((date) => allDates.add(date));
    });
    const sortedDates = Array.from(allDates).sort();

    // Prepare CSV headers
    const headers = [
      "Parameter",
      "Mean",
      "Probability",
      "Forecast Prediction",
      "Min Value",
      "Max Value",
      ...sortedDates,
    ];

    // Prepare CSV rows
    const rows = Object.entries(analysisData.results.Data).map(
      ([paramId, data]) => {
        const historicalValues = sortedDates.map((date) =>
          data.previousDates[date] !== undefined
            ? data.previousDates[date].toString()
            : ""
        );

        return [
          paramId,
          data.mean.toFixed(2),
          data.probability.toFixed(2),
          data.foreCastPrediction.toFixed(2),
          data.minValue.toFixed(2),
          data.maxValue.toFixed(2),
          ...historicalValues,
        ];
      }
    );

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `weather-analysis-${configuration.eventDate}.csv`;
    link.click();
  };

  const handleDownloadJSON = () => {
    if (!analysisData?.results) return;

    const exportData = {
      metadata: {
        eventDate: configuration.eventDate,
        location: {
          latitude: parseFloat(configuration.latitude),
          longitude: parseFloat(configuration.longitude),
        },
        exportDate: new Date().toISOString(),
        selectedParameters: selectedVars,
      },
      configuration: {
        thresholds: configuration.thresholds,
      },
      results: analysisData.results.Data,
      dataSource: "NASA Earth Observation Data",
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `weather-analysis-${configuration.eventDate}.json`;
    link.click();
  };

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        {/* Page Title */}
        <div className="page-title">
          <h1 className="title">Weather Analysis Results</h1>
          <p className="subtitle">
            Based on your configuration and NASA Earth observation data
          </p>

          <button onClick={onBackToConfig} className="btn secondary-btn">
            ← Back to Configuration
          </button>
        </div>

        {/* Configuration Summary */}
        <div className="glass config-panel">
          <h2 className="section-heading">📋 Configuration Summary</h2>

          <div className="config-grid">
            {/* Event Date */}
            <div className="config-item">
              <h3 className="config-subheading">📅 Event Date</h3>
              <p className="config-value">
                {configuration.eventDate
                  ? new Date(configuration.eventDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "Not set"}
              </p>
            </div>

            {/* Location */}
            <div className="config-item">
              <h3 className="config-subheading">📍 Location</h3>
              <p className="config-value">
                {configuration.latitude && configuration.longitude
                  ? `${parseFloat(configuration.latitude).toFixed(
                      4
                    )}°, ${parseFloat(configuration.longitude).toFixed(4)}°`
                  : "Not set"}
              </p>
            </div>

            {/* Weather Variables */}
            <div className="config-item">
              <h3 className="config-subheading">🌦️ Variables Selected</h3>
              <p className="config-value">
                {selectedVars.length} parameter
                {selectedVars.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Selected Variables Detail */}
          <div className="selected-vars">
            <h3 className="small-muted">
              Selected Weather Parameters & Thresholds:
            </h3>
            <div className="vars-list">
              {selectedVars.map((varId) => (
                <div key={varId} className="var-chip">
                  <strong>{varId}</strong>
                  {configuration.thresholds[varId] !== undefined && (
                    <span className="var-chip-muted">
                      (Threshold: {configuration.thresholds[varId]})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Download Options */}
        {analysisData?.results && !isLoading && !analysisData.error && (
          <div className="glass download-panel">
            <h2 className="section-heading">📥 Export Data</h2>
            <p className="muted" style={{ marginBottom: "1rem" }}>
              Download your analysis results in your preferred format
            </p>

            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <button onClick={handleDownloadCSV} className="btn secondary-btn">
                <i className="fa-solid fa-file-csv"></i> Download CSV
              </button>
              <button
                onClick={handleDownloadJSON}
                className="btn secondary-btn"
              >
                <i className="fa-solid fa-file-code"></i> Download JSON
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="glass loading-panel">
            <div className="emoji-large">⏳</div>
            <h3 className="loading-title">Analyzing Weather Data...</h3>
            <p className="muted">
              Fetching NASA Earth observation data and computing predictions
            </p>
          </div>
        )}

        {/* Error State */}
        {analysisData?.error && !isLoading && (
          <div className="error-panel">
            <div className="emoji-large">⚠️</div>
            <h3 className="error-title">Analysis Error</h3>
            <p className="error-text">{analysisData.error}</p>
            <button onClick={onBackToConfig} className="btn destructive-btn">
              Go Back and Try Again
            </button>
          </div>
        )}

        {/* Success State - Analysis Results */}
        {analysisData?.results && !isLoading && !analysisData.error && (
          <div>
            <div className="glass result-panel">
              <div className="emoji-large">✅</div>
              <h3 className="result-title">Analysis Complete!</h3>
              <p className="muted">
                Weather prediction data has been successfully processed
              </p>
            </div>

            {/* Weather Parameters Results */}
            <div className="params-grid">
              {Object.entries(analysisData.results.Data).map(
                ([paramId, data]) => {
                  const threshold = configuration.thresholds[paramId];
                  const isWithinThreshold =
                    threshold !== undefined
                      ? data.foreCastPrediction <= threshold
                      : true;

                  return (
                    <div
                      key={paramId}
                      className={`glass param-card ${
                        isWithinThreshold ? "param-card--ok" : "param-card--bad"
                      }`}
                    >
                      <h3 className="param-header">
                        <span>{paramId}</span>
                        <span
                          className={`status-icon ${
                            isWithinThreshold ? "status-ok" : "status-bad"
                          }`}
                        >
                          {isWithinThreshold ? "✓" : "⚠️"}
                        </span>
                      </h3>

                      <div className="stat-grid">
                        <div className="stat-row">
                          <span className="muted">Forecast Prediction:</span>
                          <strong
                            className={`stat-value ${
                              isWithinThreshold
                                ? "text-primary"
                                : "text-destructive"
                            }`}
                          >
                            {data.foreCastPrediction.toFixed(2)}
                          </strong>
                        </div>

                        <div className="stat-row">
                          <span className="muted">Your Threshold:</span>
                          <strong className="stat-value">
                            {threshold !== undefined ? threshold : "N/A"}
                          </strong>
                        </div>

                        <div className="stat-row">
                          <span className="muted">Probability:</span>
                          <strong className="stat-value">
                            {(data.probability * 100).toFixed(1)}%
                          </strong>
                        </div>

                        <div className="stat-row">
                          <span className="muted">Historical Mean:</span>
                          <strong className="stat-value">
                            {data.mean.toFixed(2)}
                          </strong>
                        </div>

                        <div className="stat-row">
                          <span className="muted">Range:</span>
                          <strong className="stat-value">
                            {data.minValue.toFixed(2)} -{" "}
                            {data.maxValue.toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Donut Chart for Threshold Probability */}
            {(() => {
              const chartData = Object.entries(analysisData.results.Data).map(
                ([paramId, data]) => {
                  const metadata = weatherVariableMetadata[paramId] || {
                    name: paramId,
                    color: "#94A3B8",
                    unit: "",
                  };

                  return {
                    id: paramId,
                    name: metadata.name,
                    probability: data.probability * 100,
                    threshold: configuration.thresholds[paramId] || 0,
                    min: data.minValue,
                    max: data.maxValue,
                    color: metadata.color,
                    unit: metadata.unit,
                  };
                }
              );

              return (
                <div className="donut-wrapper">
                  <DonutChart
                    parameters={chartData}
                    date={configuration.eventDate}
                    selectedVariable={selectedChartVariable}
                    onVariableClick={setSelectedChartVariable}
                  />
                </div>
              );
            })()}

            {/* Time Series Chart for Historical Data */}
            <div className="timeseries-wrapper">
              <TimeSeriesChart parametersData={analysisData.results.Data} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysisData && !isLoading && (
          <div className="glass empty-panel">
            <div className="emoji-large">🔍</div>
            <h3 className="empty-title">No Analysis Data Yet</h3>
            <p className="muted">
              Please configure your analysis parameters and run the analysis
            </p>
            <button onClick={onBackToConfig} className="btn gradient-btn">
              Go to Configuration
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
