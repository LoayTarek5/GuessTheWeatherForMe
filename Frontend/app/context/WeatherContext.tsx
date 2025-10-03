"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// Types
interface WeatherVariable {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unit: string;
  defaultThreshold: number;
}

interface ConfigurationData {
  selectedWeatherVars: Record<string, boolean>;
  thresholds: Record<string, number>;
  eventDate: string;
  latitude: string;
  longitude: string;
}

// API Response Types
interface WeatherParameterData {
  mean: number;
  probability: number;
  foreCastPrediction: number;
  previousDates: Record<string, number>;
  minValue: number;
  maxValue: number;
}

interface APIResponse {
  Data: Record<string, WeatherParameterData>;
  Success: boolean;
}

interface AnalysisData {
  results?: APIResponse;
  error?: string;
}

interface WeatherContextType {
  configuration: ConfigurationData;
  analysisData: AnalysisData | null;
  isLoading: boolean;
  updateConfiguration: (config: Partial<ConfigurationData>) => void;
  fetchAnalysisData: () => Promise<boolean>;
  clearConfiguration: () => void;
  isConfigurationValid: () => boolean;
}

// Create Context
const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

// Storage Keys
const STORAGE_KEY = "weather_analysis_config";
const ANALYSIS_KEY = "weather_analysis_data";
const PAGE_STATE_KEY = "weather_page_state";

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

// Provider Component
export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [configuration, setConfiguration] = useState<ConfigurationData>(() => {
    // Load from memory state (not localStorage as per Claude.ai restrictions)
    return loadFromStorage(STORAGE_KEY, {
      selectedWeatherVars: {},
      thresholds: {},
      eventDate: "",
      latitude: "",
      longitude: "",
    });
  });

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(() => {
    return loadFromStorage(ANALYSIS_KEY, null);
  });
  const [isLoading, setIsLoading] = useState(false);

  // Save configuration to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEY, configuration);
  }, [configuration]);

  // Update configuration
  const updateConfiguration = (config: Partial<ConfigurationData>) => {
    setConfiguration((prev) => {
      const updated = { ...prev, ...config };
      return updated;
    });
  };

  // Validate configuration
  const isConfigurationValid = (): boolean => {
    const { selectedWeatherVars, eventDate, latitude, longitude } =
      configuration;

    // Check if at least one weather variable is selected
    if (Object.keys(selectedWeatherVars).length === 0) {
      return false;
    }

    // Check if date is selected and in the future
    if (!eventDate) {
      return false;
    }
    const selectedDate = new Date(eventDate);
    const today = new Date();
    if (selectedDate <= today) {
      return false;
    }

    // Check if coordinates are valid
    if (!latitude || !longitude) {
      return false;
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return false;
    }

    return true;
  };

  // Fetch analysis data from API
  const fetchAnalysisData = async (): Promise<boolean> => {
    if (!isConfigurationValid()) {
      return false;
    }

    setIsLoading(true);
    setAnalysisData(null);

    try {
      // Prepare API request payload according to your API spec
      const selectedVars = Object.keys(
        configuration.selectedWeatherVars
      ).filter((key) => configuration.selectedWeatherVars[key]);

      // Build parameters object with thresholds
      const parameters: Record<string, number> = {};
      selectedVars.forEach((varId) => {
        parameters[varId] = configuration.thresholds[varId] || 0;
      });

      const payload = {
        longitude: parseFloat(configuration.longitude),
        date: configuration.eventDate.split("-").join(""),
        latitude: parseFloat(configuration.latitude),
        parameters: parameters,
      };

      console.log("Fetching analysis with payload:", payload);

      // Call your actual API endpoint
      const response = await fetch("/api/nasa-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Handle validation errors (422)
        if (response.status === 422) {
          const errorData = await response.json();
          const errorMsg =
            errorData.detail?.[0]?.msg || "Validation error occurred";
          throw new Error(errorMsg);
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Check if API returned success flag
      if (!data.Success) {
        throw new Error(
          "Analysis failed. Please check your inputs and try again."
        );
      }

      // Store the successful results
      setAnalysisData({ results: data });
      saveToStorage(ANALYSIS_KEY, { results: data });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error fetching analysis:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const errorData = { error: errorMessage };
      setAnalysisData(errorData);
      saveToStorage(ANALYSIS_KEY, errorData);
      setIsLoading(false);
      return false;
    }
  };

  // Clear configuration
  const clearConfiguration = () => {
    const emptyConfig = {
      selectedWeatherVars: {},
      thresholds: {},
      eventDate: "",
      latitude: "",
      longitude: "",
    };
    setConfiguration(emptyConfig);
    setAnalysisData(null);
    saveToStorage(STORAGE_KEY, emptyConfig);
    saveToStorage(ANALYSIS_KEY, null);
  };

  const value: WeatherContextType = {
    configuration,
    analysisData,
    isLoading,
    updateConfiguration,
    fetchAnalysisData,
    clearConfiguration,
    isConfigurationValid,
  };

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
};

// Custom hook to use the context
export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
};

export default WeatherContext;