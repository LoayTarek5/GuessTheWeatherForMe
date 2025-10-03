"use client";
import React, { useState, useEffect, useRef } from "react";
import { useWeather } from "../context/WeatherContext";
import "../globals.css";
import dynamic from "next/dynamic";
import "../style/configuration.css";
const MapClient = dynamic(() => import("./MapClient"), { ssr: false });
interface ConfigurationProps {
  onAnalysisComplete?: () => void;
}

const Configuration: React.FC<ConfigurationProps> = ({
  onAnalysisComplete,
}) => {
  // Get context methods and state
  const {
    configuration,
    updateConfiguration,
    fetchAnalysisData,
    isLoading,
    analysisData,
    isConfigurationValid,
  } = useWeather();

  const [selectedWeatherVars, setSelectedWeatherVars] = useState<
    Record<string, boolean>
  >({});
  const [thresholds, setThresholds] = useState<Record<string, number>>({});
  const [eventDate, setEventDate] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [showMapTab, setShowMapTab] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const position =
    latitude &&
    longitude &&
    !isNaN(parseFloat(latitude)) &&
    !isNaN(parseFloat(longitude))
      ? ([parseFloat(latitude), parseFloat(longitude)] as [number, number])
      : null;

  interface WeatherVariable {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    unit: string;
    defaultThreshold: number;
  }

  const weatherVariables: WeatherVariable[] = [
    {
      id: "T2M",
      name: "Temperature",
      description: "2-meter air temperature",
      icon: "🌡️",
      color: "hsl(25, 95%, 55%)",
      unit: "°C",
      defaultThreshold: 25,
    },
    {
      id: "WS2M",
      name: "Wind Speed",
      description: "Wind speed at 2 meters",
      icon: "💨",
      color: "hsl(195, 95%, 55%)",
      unit: "m/s",
      defaultThreshold: 10,
    },
    {
      id: "PRECTOTCORR",
      name: "Precipitation",
      description: "Rainfall and snowfall",
      icon: "🌧️",
      color: "hsl(220, 95%, 65%)",
      unit: "mm",
      defaultThreshold: 5,
    },
    {
      id: "RH2M",
      name: "Humidity",
      description: "Relative humidity at 2 meters",
      icon: "💧",
      color: "hsl(260, 95%, 65%)",
      unit: "%",
      defaultThreshold: 70,
    },
    {
      id: "CLOUD_AMT",
      name: "Cloud Amount",
      description: "Total cloud coverage",
      icon: "☁️",
      color: "hsl(200, 30%, 70%)",
      unit: "%",
      defaultThreshold: 50,
    },
    {
      id: "AOD_55",
      name: "Aerosol",
      description: "Dust, haze, smoke, fog",
      icon: "🌫️",
      color: "hsl(35, 95%, 55%)",
      unit: "AOD",
      defaultThreshold: 0.5,
    },
    {
      id: "SNODP",
      name: "Snow Depth",
      description: "Snow depth measurement",
      icon: "❄️",
      color: "hsl(180, 50%, 85%)",
      unit: "cm",
      defaultThreshold: 10,
    },
  ];

  // Sync local state with context when component mounts (preserve state when coming back)
  useEffect(() => {
    if (
      configuration.selectedWeatherVars &&
      Object.keys(configuration.selectedWeatherVars).length > 0
    ) {
      setSelectedWeatherVars(configuration.selectedWeatherVars);
      setThresholds(configuration.thresholds);
      setEventDate(configuration.eventDate);
      setLatitude(configuration.latitude);
      setLongitude(configuration.longitude);
    }
  }, []);

  // Update context whenever local state changes
  useEffect(() => {
    updateConfiguration({
      selectedWeatherVars,
      thresholds,
      eventDate,
      latitude,
      longitude,
    });
  }, [selectedWeatherVars, thresholds, eventDate, latitude, longitude]);

  const toggleWeatherVariable = (varId: string) => {
    const newSelected = { ...selectedWeatherVars };
    const newThresholds = { ...thresholds };

    if (newSelected[varId]) {
      delete newSelected[varId];
      delete newThresholds[varId];
    } else {
      const variable = weatherVariables.find((v) => v.id === varId);
      newSelected[varId] = true;
      newThresholds[varId] = variable ? variable.defaultThreshold : 0;
    }
    setSelectedWeatherVars(newSelected);
    setThresholds(newThresholds);

    if (errors.weatherVars) {
      setErrors((prev) => ({ ...prev, weatherVars: null }));
    }
  };

  const updateThreshold = (varId: string, value: number | string) => {
    const num =
      typeof value === "number" ? value : parseFloat(String(value || "0"));
    setThresholds((prev) => ({
      ...prev,
      [varId]: isNaN(num) ? 0 : num,
    }));
  };

  const validateInputs = () => {
    const newErrors: Record<string, string | null> = {};

    if (Object.keys(selectedWeatherVars).length === 0) {
      newErrors.weatherVars = "Please select at least one weather variable";
    }

    if (!eventDate) {
      newErrors.eventDate = "Please select a future date";
    } else {
      const selectedDate = new Date(eventDate);
      const today = new Date();
      if (selectedDate <= today) {
        newErrors.eventDate = "Please select a future date";
      }
    }

    if (!latitude || !longitude) {
      newErrors.location = "Please select a location";
    } else {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.location = "Invalid latitude (must be between -90 and 90)";
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.location = "Invalid longitude (must be between -180 and 180)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setApiError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        setLatitude(lat);
        setLongitude(lng);
        if (errors.location) setErrors((prev) => ({ ...prev, location: null }));
        setApiError(null);
      },
      (err) => {
        console.error("Geolocation error", err);
        setApiError(
          "Unable to get your location. Enter coordinates manually or pick on the map."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAnalyze = async () => {
    setApiError(null);

    if (!validateInputs()) {
      return;
    }

    const success = await fetchAnalysisData();

    if (success) {
      // Navigate to analysis page
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    } else {
      // Display error from API
      if (analysisData?.error) {
        setApiError(analysisData.error);
      } else {
        setApiError("Failed to fetch analysis data. Please try again.");
      }
    }
  };

  // Check if button should be enabled
  const isButtonEnabled = isConfigurationValid() && !isLoading;
  return (
    <div className="inputs-container">
      <div className="container">
        <div className="input-card">
          <div className="header">
            <h4>Weather Variables</h4>
            <p>
              Select at least one parameter and set threshold value for analysis
            </p>
          </div>
          <div className="content">
            {weatherVariables.map((variable) => (
              <div key={variable.id}>
                <div
                  className="var-grid"
                  onClick={() => toggleWeatherVariable(variable.id)}
                >
                  <div
                    className="check-box"
                    style={{
                      backgroundColor: selectedWeatherVars[variable.id]
                        ? "hsl(var(--primary))"
                        : "transparent",
                    }}
                  >
                    {selectedWeatherVars[variable.id] && (
                      <div className="check-sign">✓</div>
                    )}
                  </div>
                  <div className="var-details">
                    <div className="var-info">
                      <i>{variable.icon}</i>
                      <p
                        style={{
                          color: selectedWeatherVars[variable.id]
                            ? "hsl(var(--primary))"
                            : "white",
                        }}
                      >
                        {variable.name}
                      </p>
                    </div>
                    <p className="info">{variable.description}</p>
                  </div>
                </div>
                {selectedWeatherVars[variable.id] && (
                  <div className="threshold-content">
                    <label>Threshold:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={
                        thresholds[variable.id] ??
                        variable.defaultThreshold ??
                        ""
                      }
                      onChange={(e) =>
                        updateThreshold(variable.id, parseFloat(e.target.value))
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>{variable.unit}</span>
                  </div>
                )}
              </div>
            ))}
            {!Object.values(selectedWeatherVars).some((v) => v) && (
              <div
                style={{
                  color: "hsl(var(--destructive))",
                  fontSize: "0.9rem",
                  marginTop: "1rem",
                  textAlign: "center",
                }}
              >
                Please select at least one weather variable
              </div>
            )}
          </div>
        </div>
        <div className="input-card">
          <div className="header">
            <h4>Future Date</h4>
            <p>Select a date in the future for weather prediction</p>
          </div>
          <div className="content">
            <div className="date-header">
              <span>📅</span>
              <span style={{ color: "hsl(var(--muted-foreground))" }}>
                Pick a date
              </span>
            </div>

            <input
              type="date"
              value={eventDate}
              onChange={(e) => {
                // const stringDate = e.target.value.split('-').join('');
                setEventDate(e.target.value);
                if (errors.eventDate) {
                  setErrors((prev) => ({ ...prev, eventDate: null }));
                }
                setApiError(null);
              }}
              min={new Date().toISOString().split("T")[0]}
              style={{
                width: "100%",
                background: "hsl(var(--input))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
                padding: "0.75rem",
                borderRadius: "calc(var(--radius) / 2)",
                fontSize: "1rem",
              }}
            />
            {!eventDate && (
              <div
                style={{
                  color: "hsl(var(--destructive))",
                  fontSize: "0.9rem",
                  marginTop: "1rem",
                  textAlign: "center",
                }}
              >
                Please select a future date
              </div>
            )}
          </div>
        </div>
        <div className="input-card">
          <div className="header">
            <h4>Location</h4>
            <p>Select coordinates for weather analysis</p>
          </div>
          <div className="content">
            <div className="map-btns">
              <button
                type="button"
                className={!showMapTab ? "tab-btn active" : "tab-btn"}
                onClick={() => setShowMapTab(false)}
              >
                <i className="fa-solid fa-location-dot"></i> Coordinates
              </button>
              <button
                type="button"
                className={showMapTab ? "tab-btn active" : "tab-btn"}
                onClick={() => setShowMapTab(true)}
              >
                <i className="fa-regular fa-map"></i> Interactive Map
              </button>
            </div>
            {showMapTab ? (
              <div
                className="interactive-map"
                style={{ width: "100%", height: 320, margin: "15px 0px" }}
              >
                <MapClient
                  position={position}
                  onMapClick={(lat, lng) => {
                    setLatitude(lat.toFixed(4));
                    setLongitude(lng.toFixed(4));
                    if (errors.location)
                      setErrors((prev) => ({ ...prev, location: null }));
                    setApiError(null);
                  }}
                />
              </div>
            ) : (
              <div className="coordinates-container">
                <div className="coordinates-content latitude">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="-90"
                    max="90"
                    placeholder="-90 to 90"
                    value={latitude}
                    onChange={(e) => {
                      setLatitude(e.target.value);
                      if (errors.location)
                        setErrors((prev) => ({ ...prev, location: null }));
                      setApiError(null);
                    }}
                  />
                </div>
                <div className="coordinates-content longitude">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="-180"
                    max="180"
                    placeholder="-180 to 180"
                    value={longitude}
                    onChange={(e) => {
                      setLongitude(e.target.value);
                      if (errors.location)
                        setErrors((prev) => ({ ...prev, location: null }));
                      setApiError(null);
                    }}
                  />
                </div>
              </div>
            )}
            <button
              type="button"
              className="currloc-btn"
              onClick={useCurrentLocation}
            >
              <i className="fa-solid fa-location-arrow"></i> Use Current
              Location
            </button>

            {!latitude || !longitude ? (
              <div
                style={{
                  color: "hsl(var(--destructive))",
                  fontSize: "0.9rem",
                  marginTop: "1rem",
                  textAlign: "center",
                }}
              >
                Please select a location
              </div>
            ) : (
              <div className="selected-location animate-glow">
                <i className="fa-solid fa-location-dot"></i>
                <span>
                  Selected: Current Location({latitude},{longitude}){" "}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* API Error Display */}
      {apiError && (
        <div
          style={{
            maxWidth: "1200px",
            margin: "1rem auto",
            padding: "1rem",
            background: "hsl(var(--destructive) / 0.1)",
            border: "1px solid hsl(var(--destructive))",
            borderRadius: "var(--radius)",
            color: "hsl(var(--destructive))",
            textAlign: "center",
          }}
        >
          <strong>⚠️ Error:</strong> {apiError}
        </div>
      )}

      {/* Analyze Button */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "2rem auto",
          padding: "0 1rem",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          className="btn-primary"
          onClick={handleAnalyze}
          disabled={!isButtonEnabled}
          style={{
            padding: "1rem 3rem",
            fontSize: "1.1rem",
            opacity: isButtonEnabled ? 1 : 0.5,
            cursor: isButtonEnabled ? "pointer" : "not-allowed",
            transition: "var(--transition-smooth)",
          }}
        >
          {isLoading ? (
            <>
              <span style={{ marginRight: "0.5rem" }}>⏳</span>
              Analyzing...
            </>
          ) : (
            <>
              <span style={{ marginRight: "0.5rem" }}>🚀</span>
              Start Analysis
            </>
          )}
        </button>

        {!isButtonEnabled && !isLoading && (
          <p
            style={{
              marginTop: "0.75rem",
              color: "hsl(var(--muted-foreground))",
              fontSize: "0.9rem",
            }}
          >
            Please complete all fields to enable analysis
          </p>
        )}
      </div>
    </div>
  );
};

export default Configuration;
