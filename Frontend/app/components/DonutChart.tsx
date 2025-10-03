import React, { useRef, useState } from "react";
import "../style/donutChart.css";
interface WeatherParameter {
  id: string;
  name: string;
  probability: number;
  threshold: number;
  min: number;
  max: number;
  color: string;
  unit: string;
}

interface DonutChartProps {
  parameters: WeatherParameter[];
  date: string;
  selectedVariable?: string | null;
  onVariableClick?: (id: string | null) => void;
}

const DonutChart: React.FC<DonutChartProps> = ({
  parameters,
  date,
  selectedVariable = null,
  onVariableClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  // Create segments directly from probability
  const allSegments = parameters.map((param) => {
    const angle = (param.probability / 100) * 360;

    return {
      ...param,
      percentage: param.probability,
      startAngle: 0,
      endAngle: angle,
    };
  });

  // Filter to show only selected or all
  const segments = selectedVariable
    ? allSegments.filter((s) => s.id === selectedVariable)
    : allSegments.map((param, index) => {
        let currentAngle = 0;
        for (let i = 0; i < index; i++) {
          currentAngle += allSegments[i].endAngle;
        }
        return {
          ...param,
          startAngle: currentAngle,
          endAngle: currentAngle + param.endAngle,
        };
      });

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const createArc = (
    startAngle: number,
    endAngle: number,
    innerRadius: number,
    outerRadius: number
  ) => {
    // Prevent invalid arcs
    if (endAngle <= startAngle) return "";

    const start = polarToCartesian(0, 0, outerRadius, endAngle);
    const end = polarToCartesian(0, 0, outerRadius, startAngle);
    const innerStart = polarToCartesian(0, 0, innerRadius, endAngle);
    const innerEnd = polarToCartesian(0, 0, innerRadius, startAngle);

    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      "M",
      start.x,
      start.y,
      "A",
      outerRadius,
      outerRadius,
      0,
      largeArc,
      0,
      end.x,
      end.y,
      "L",
      innerEnd.x,
      innerEnd.y,
      "A",
      innerRadius,
      innerRadius,
      0,
      largeArc,
      1,
      innerStart.x,
      innerStart.y,
      "Z",
    ].join(" ");
  };

  function getArcCenter(startAngle: number, endAngle: number, radius: number) {
    const midAngle = (startAngle + endAngle) / 2;
    return polarToCartesian(0, 0, radius, midAngle);
  }

  const outerRadius = 100;
  const innerRadius = 50;
  const svgSize = 240;

  function setTooltipAtSvgPoint(
    svgPoint: { x: number; y: number },
    text: string
  ) {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const svgEl = containerRef.current!.querySelector("svg");
    if (!svgEl) return;
    const svgRect = svgEl.getBoundingClientRect();

    const cx = svgRect.width / 2;
    const cy = svgRect.height / 2;

    const localX = svgRect.left - containerRect.left + cx + svgPoint.x;
    const localY = svgRect.top - containerRect.top + cy + svgPoint.y;

    setTooltip({ x: localX, y: localY, text });
  }

  return (
    <div ref={containerRef} className="donut-card">
      <h2 className="donut-title">Threshold Probability</h2>
      <p className="donut-subtitle">
        Probability of thresholds being exceeded on{" "}
        {new Date(date).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <div className="donut-row">
        {/* Donut Chart */}
        <div className="donut-svg-wrapper">
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="-120 -120 240 240"
            className="donut-svg"
          >
            {segments.map((segment) => {
              const arcAngle = segment.endAngle - segment.startAngle;
              const isFullCircle = arcAngle >= 359.99;

              // Create the filled portion (probability)
              let filledPathData;
              if (isFullCircle) {
                const topOuter = polarToCartesian(0, 0, outerRadius, 0);
                const bottomOuter = polarToCartesian(0, 0, outerRadius, 180);
                const topInner = polarToCartesian(0, 0, innerRadius, 0);
                const bottomInner = polarToCartesian(0, 0, innerRadius, 180);

                filledPathData = [
                  "M",
                  topOuter.x,
                  topOuter.y,
                  "A",
                  outerRadius,
                  outerRadius,
                  0,
                  0,
                  1,
                  bottomOuter.x,
                  bottomOuter.y,
                  "A",
                  outerRadius,
                  outerRadius,
                  0,
                  0,
                  1,
                  topOuter.x,
                  topOuter.y,
                  "M",
                  topInner.x,
                  topInner.y,
                  "A",
                  innerRadius,
                  innerRadius,
                  0,
                  0,
                  0,
                  bottomInner.x,
                  bottomInner.y,
                  "A",
                  innerRadius,
                  innerRadius,
                  0,
                  0,
                  0,
                  topInner.x,
                  topInner.y,
                  "Z",
                ].join(" ");
              } else {
                const gapDeg = selectedVariable ? 0 : 0.6;
                const s = segment.startAngle + gapDeg / 2;
                const e = segment.endAngle - gapDeg / 2;
                filledPathData = createArc(s, e, innerRadius, outerRadius);
              }

              const isSelected = selectedVariable === segment.id;

              return (
                <g key={segment.id}>
                  {selectedVariable && arcAngle < 360 && (
                    <path
                      d={createArc(
                        segment.endAngle,
                        segment.startAngle + 360,
                        innerRadius,
                        outerRadius
                      )}
                      fill="hsl(var(--muted) / 0.2)"
                      stroke="hsl(var(--border))"
                      strokeWidth={2}
                      className="donut-segment-unfilled"
                    />
                  )}

                  {/* Filled portion (probability) */}
                  <path
                    d={filledPathData}
                    fill={segment.color}
                    className="donut-segment"
                    strokeWidth={3}
                    style={{
                      stroke: selectedVariable ? "white" : "hsl(var(--card))",
                      opacity: 1,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (onVariableClick) {
                        onVariableClick(isSelected ? null : segment.id);
                      }
                    }}
                    onMouseEnter={(ev) => {
                      setHoveredSegment(segment.id);
                      const mid = getArcCenter(
                        segment.startAngle,
                        segment.endAngle,
                        (innerRadius + outerRadius) / 2
                      );
                      setTooltipAtSvgPoint(mid, segment.name);
                      ev.stopPropagation();
                    }}
                    onMouseLeave={() => {
                      setHoveredSegment(null);
                      setTooltip(null);
                    }}
                    onMouseMove={(e) => {
                      const containerRect =
                        containerRef.current!.getBoundingClientRect();
                      const offsetX = e.clientX - containerRect.left;
                      const offsetY = e.clientY - containerRect.top;
                      const offset = 12;
                      setTooltip({
                        x: offsetX + offset,
                        y: offsetY + offset,
                        text: segment.name,
                      });
                    }}
                  />
                </g>
              );
            })}

            <circle cx={0} cy={0} r={innerRadius} fill="hsl(var(--card))" />

            {selectedVariable && segments[0] && (
              <>
                <text
                  x={0}
                  y={-5}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize="24"
                  fontWeight="700"
                >
                  {segments[0].probability.toFixed(1)}%
                </text>
                <text
                  x={0}
                  y={15}
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize="10"
                  fontWeight="400"
                >
                  Probability
                </text>
              </>
            )}
            <circle cx={0} cy={0} r={innerRadius} fill="transparent" />
          </svg>

          {tooltip && (
            <div
              className="donut-tooltip"
              style={{ left: tooltip.x - 50, top: tooltip.y - 50 }}
              role="tooltip"
            >
              {(() => {
                const param = segments.find((s) => s.id === hoveredSegment);
                if (!param) {
                  return (
                    <div className="donut-tooltip-title">{tooltip.text}</div>
                  );
                }
                return (
                  <>
                    <div className="donut-tooltip-title">{param.name}</div>
                    <div className="donut-tooltip-body">
                      <div>
                        Threshold Probability:{" "}
                        <strong>{param.probability.toFixed(1)}%</strong>
                      </div>
                      <div>
                        Threshold:{" "}
                        <strong>
                          {param.threshold} {param.unit}
                        </strong>
                      </div>
                      <div className="donut-tooltip-meta">
                        Min: {param.min.toFixed(1)} {param.unit}
                      </div>
                      <div className="donut-tooltip-meta">
                        Max: {param.max.toFixed(1)} {param.unit}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="legend-column">
          {allSegments.map((segment) => {
            const isSelected = selectedVariable === segment.id;
            const shouldDim = selectedVariable && !isSelected;

            return (
              <div
                key={segment.id}
                className={`legend-item ${
                  hoveredSegment === segment.id ? "legend-item--hovered" : ""
                } ${isSelected ? "legend-item--selected" : ""}`}
                style={{
                  opacity: shouldDim ? 0.4 : 1,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (onVariableClick) {
                    onVariableClick(isSelected ? null : segment.id);
                  }
                }}
                onMouseEnter={() => {
                  setHoveredSegment(segment.id);
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  setTooltip(null);
                }}
              >
                <div
                  className="legend-swatch"
                  style={{ background: segment.color }}
                />
                <div style={{ flex: 1 }}>
                  <div className="legend-name">{segment.name}</div>
                  <div className="legend-value">
                    {segment.probability.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
