import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../style/timeSeriesChart.css";

interface TimeSeriesChartProps {
  parametersData: Record<
    string,
    {
      mean: number;
      probability: number;
      foreCastPrediction: number;
      previousDates: Record<string, number>;
      minValue: number;
      maxValue: number;
    }
  >;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  parametersData,
}) => {
  // Weather variable metadata
  const weatherMetadata: Record<
    string,
    { name: string; color: string; unit: string }
  > = {
    T2M: { name: "Temperature", color: "#CD8B3A", unit: "°C" },
    WS2M: { name: "Wind Speed", color: "#06B6D4", unit: "m/s" },
    PRECTOTCORR: { name: "Precipitation", color: "#3B82F6", unit: "mm" },
    RH2M: { name: "Humidity", color: "#8B5CF6", unit: "%" },
    CLOUD_AMT: { name: "Cloud Amount", color: "#94A3B8", unit: "%" },
    AOD_55: { name: "Aerosol", color: "#F59E0B", unit: "AOD" },
    SNODP: { name: "Snow Depth", color: "#06B6D4", unit: "cm" },
  };

  // Get parameter info
  const parameters = useMemo(() => {
    return Object.entries(parametersData).map(([paramId, data]) => {
      const metadata = weatherMetadata[paramId] || {
        name: paramId,
        color: "#94A3B8",
        unit: "",
      };
      return {
        id: paramId,
        name: metadata.name,
        color: metadata.color,
        unit: metadata.unit,
        data: data.previousDates,
      };
    });
  }, [parametersData]);

  const [visibleParameters, setVisibleParameters] = useState<
    Record<string, boolean>
  >(Object.fromEntries(parameters.map((p) => [p.name, true])));

  // Get all dates and calculate min/max years
  const allDates = useMemo(() => {
    if (parameters.length === 0) return [];
    const dates = Object.keys(parameters[0].data).sort();
    return dates;
  }, [parameters]);

  const minYear =
    allDates.length > 0 ? parseInt(allDates[0].substring(0, 4)) : 2015;
  const maxYear =
    allDates.length > 0
      ? parseInt(allDates[allDates.length - 1].substring(0, 4))
      : 2025;

  const [dateRange, setDateRange] = useState({ start: minYear, end: maxYear });

  // Transform data for Recharts
  const chartData = useMemo(() => {
    const filteredDates = allDates.filter((date) => {
      const year = parseInt(date.substring(0, 4));
      return year >= dateRange.start && year <= dateRange.end;
    });

    return filteredDates.map((date) => {
      const dataPoint: any = { date };

      parameters.forEach((param) => {
        if (visibleParameters[param.name]) {
          dataPoint[param.name] = param.data[date];
        }
      });

      return dataPoint;
    });
  }, [parameters, allDates, dateRange, visibleParameters]);

  const toggleParameter = (name: string) => {
    setVisibleParameters((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const year = label.slice(0, 4);
      const month = label.slice(4, 6);
      const day = label.slice(6, 8);
      const d = new Date(year, month, day);
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      label = d.toLocaleDateString(undefined, options);
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry: any, index: number) => {
            const param = parameters.find((p) => p.name === entry.name);
            const unit = param?.unit || "";
            return (
              <p
                key={index}
                className="tooltip-entry"
                style={{ color: entry.color }}
              >
                {entry.name}: {entry.value?.toFixed(2)} {unit}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Format X axis date
  const formatXAxis = (date: string) => {
    return date.substring(0, 4); // Show only year
  };

  return (
    <div className="timeseries-container">
      <h2 className="timeseries-title">Historical Weather Data</h2>
      <p className="timeseries-subtitle">
        Unit values for selected weather variables over time
      </p>

      {/* Date Range Slider */}
      <div className="date-range-container">
        <div className="date-range-label">
          Historical Data Range: {dateRange.start} - {dateRange.end}
        </div>

        {/* Dual Range Slider */}
        <div className="slider-wrapper">
          {/* Background track */}
          <div className="slider-track-bg" />

          {/* Active range track */}
          <div
            className="slider-track-active"
            style={{
              left: `${
                ((dateRange.start - minYear) / (maxYear - minYear)) * 100
              }%`,
              right: `${
                100 - ((dateRange.end - minYear) / (maxYear - minYear)) * 100
              }%`,
            }}
          />

          {/* Start slider */}
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({
                ...prev,
                start: Math.min(parseInt(e.target.value), prev.end - 1),
              }))
            }
            className="range-slider range-slider-start"
          />

          {/* End slider */}
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({
                ...prev,
                end: Math.max(parseInt(e.target.value), prev.start + 1),
              }))
            }
            className="range-slider range-slider-end"
          />
        </div>

        <div className="slider-labels">
          <span>{minYear}</span>
          <span>{maxYear}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              label={{
                value: "Value",
                angle: -90,
                position: "insideLeft",
                style: { fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {parameters.map(
              (param) =>
                visibleParameters[param.name] && (
                  <Line
                    key={param.name}
                    type="monotone"
                    dataKey={param.name}
                    stroke={param.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="legend-container">
        {parameters.map((param) => (
          <div
            key={param.name}
            onClick={() => toggleParameter(param.name)}
            className={`legend-item ${
              visibleParameters[param.name] ? "active" : "inactive"
            }`}
            style={{
              background: visibleParameters[param.name]
                ? param.color
                : "hsl(var(--muted))",
            }}
          >
            <div className="legend-dot" />
            {param.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSeriesChart;
