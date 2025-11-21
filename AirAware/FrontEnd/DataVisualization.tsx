import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

interface AQIRow {
  Country: string;
  Region: string;
  Date: string;
  AQI: number | null;
  Temperature: number | null;
  RelativeHumidity: number | null;
  WindSpeed: number | null;
  Year: number;
  Month: string;
  Day: number;
  Weekday: number;
  DateObj: Date;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getColor(aqi: number | null | undefined): string {
  if (aqi == null || isNaN(aqi)) return "bg-gray-200";
  if (aqi >= 0 && aqi <= 30) return "bg-green-400";
  if (aqi > 31 && aqi <= 100) return "bg-yellow-400";
  if (aqi > 100 && aqi <= 150) return "bg-orange-600";
  if (aqi > 150 && aqi <= 200) return "bg-red-600";
  if (aqi > 200 && aqi <= 300) return "bg-purple-600";
  return "bg-red-500";
}

function getAQIColor(aqi: number): string {
  if (aqi >= 0 && aqi <= 30) return "#22c55e"; // Green - Good
  if (aqi >= 31 && aqi <= 100) return "#facc15"; // Yellow - Moderate
  if (aqi >= 101 && aqi <= 150) return "#ea580c"; // Orange - Unhealthy for Sensitive
  if (aqi >= 151 && aqi <= 200) return "#dc2626"; // Red - Unhealthy
  if (aqi >= 201 && aqi <= 300) return "#9333ea"; // Purple - Very Unhealthy
  return "#7c2d12";
}

function getAQILabel(aqi: number): string {
  if (aqi >= 0 && aqi <= 30) return "Good";
  if (aqi > 31 && aqi <= 100) return "Moderate";
  if (aqi > 100 && aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi > 150 && aqi <= 200) return "Unhealthy";
  if (aqi > 200 && aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

// Donut Chart Component
const DonutChart: React.FC<{ aqi: number; label: string; temp?: number; humidity?: number }> = ({
  aqi,
  label,
  temp,
  humidity
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 20;

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const maxAQI = 300;
    const aqiValue = Math.min(aqi, maxAQI);
    const percentage = (aqiValue / maxAQI) * 100;

    const arc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(0)
      .cornerRadius(10);

    // Background arc
    g.append("path")
      .attr("d", arc.endAngle(2 * Math.PI) as any)
      .attr("fill", "#e5e7eb");

    // Foreground arc (AQI value)
    g.append("path")
      .attr("d", arc.endAngle((percentage / 100) * 2 * Math.PI) as any)
      .attr("fill", getAQIColor(aqi))
      .attr("class", "transition-all duration-500");

    // Center text - AQI value
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .style("font-size", "48px")
      .style("font-weight", "bold")
      .style("fill", getAQIColor(aqi))
      .text(Math.round(aqi));

    // Center text - "AQI" label
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .style("font-size", "14px")
      .style("fill", "#6b7280")
      .text("AQI");

  }, [aqi]);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{label}</h3>
      <svg ref={svgRef} width={300} height={300} />
      <div
        className="mt-4 px-6 py-2 rounded-full text-white font-semibold text-sm"
        style={{ backgroundColor: getAQIColor(aqi) }}
      >
        {getAQILabel(aqi)}
      </div>

      {/* Weather metrics */}
      {(temp !== undefined || humidity !== undefined) && (
        <div className="mt-6 flex gap-8 text-sm">
          {temp !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-200">Temp</span>
              <span className="text-gray-700 dark:text-gray-200 text-sm">{Math.round(temp)}°C</span>
            </div>
          )}
          {humidity !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-200">Humidity</span>
              <span className="text-gray-700 dark:text-gray-200 text-sm">{Math.round(humidity)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const D3LineChart: React.FC<{ data: any[] }> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 60, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select(tooltipRef.current);

    const x = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, width])
      .padding(0.1);

    const yLeft = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.RelativeHumidity) || 100])
      .range([height, 0]);

    const yRight = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.Temperature || 0, d.WindSpeed || 0)) || 50])
      .range([height, 0]);

    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(
        d3.axisLeft(yLeft)
          .tickSize(-width)
          .tickFormat(() => "")
      );

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px");

    g.append("g")
      .call(d3.axisLeft(yLeft))
      .selectAll("text")
      .style("fill", "#3b82f6")
      .style("font-size", "12px");

    g.append("g")
      .attr("transform", `translate(${width},0)`)
      .call(d3.axisRight(yRight))
      .selectAll("text")
      .style("fill", "#ef4444")
      .style("font-size", "12px");

    const line = d3.line<any>()
      .defined(d => d.value != null)
      .x(d => (x(d.month) || 0) + x.bandwidth() / 2)
      .curve(d3.curveMonotoneX);

    const humidityData = data.map(d => ({ month: d.month, value: d.RelativeHumidity }));
    g.append("path")
      .datum(humidityData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line.y(d => yLeft(d.value || 0)));

    const tempData = data.map(d => ({ month: d.month, value: d.Temperature }));
    g.append("path")
      .datum(tempData)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("d", line.y(d => yRight(d.value || 0)));

    const windData = data.map(d => ({ month: d.month, value: d.WindSpeed }));
    g.append("path")
      .datum(windData)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 2)
      .attr("d", line.y(d => yRight(d.value || 0)));

    // Invisible hover areas for better tooltip experience
    data.forEach((monthData, i) => {
      const xPos = (x(monthData.month) || 0) + x.bandwidth() / 2;

      g.append("rect")
        .attr("x", xPos - x.bandwidth() / 2)
        .attr("y", 0)
        .attr("width", x.bandwidth())
        .attr("height", height)
        .attr("fill", "transparent")
        .attr("cursor", "pointer")
        .on("mouseover", function (event) {
          const humidity = monthData.RelativeHumidity;
          const temp = monthData.Temperature;
          const wind = monthData.WindSpeed;

          tooltip.style("opacity", 1);

          let tooltipHTML = `
              <div style="font-weight: 600; margin-bottom: 8px; border-bottom: 1px solid rgba(000,000,000,0.3); padding-bottom: 6px;">
                ${monthData.month}
              </div>
            `;

          if (humidity != null) {
            tooltipHTML += `<div style="color: #3b82f6; margin-bottom: 4px;">Humidity (%): ${humidity.toFixed(2)}</div>`;
          }
          if (temp != null) {
            tooltipHTML += `<div style="color: #f59e0b; margin-bottom: 4px;">Temperature (°C): ${temp.toFixed(2)}</div>`;
          }
          if (wind != null) {
            tooltipHTML += `<div style="color: #22c55e;">Wind Speed (m/s): ${wind.toFixed(2)}</div>`;
          }

          tooltip
            .style("left", event.clientX + 5 + "px")
            .style("top", event.clientY - 0 + "px")
            .html(tooltipHTML);
        })

        .on("mouseout", function () {
          tooltip.style("opacity", 0);
        });
    });

    // Data point circles (visual only, no hover)
    [
      { data: humidityData, color: "#3b82f6", scale: yLeft, className: "dot-humidity" },
      { data: tempData, color: "#f59e0b", scale: yRight, className: "dot-temp" },
      { data: windData, color: "#22c55e", scale: yRight, className: "dot-wind" }
    ].forEach(({ data, color, scale, className }) => {
      g.selectAll(`.${className}`)
        .data(data.filter(d => d.value != null))
        .enter()
        .append("circle")
        .attr("class", className)
        .attr("cx", d => (x(d.month) || 0) + x.bandwidth() / 2)
        .attr("cy", d => scale(d.value || 0))
        .attr("r", 4)
        .attr("fill", color)
        .style("pointer-events", "none");
    });

    // Legend - moved to bottom
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left + 77}, ${height + margin.top + 45})`);

    const legendData = [
      { label: "Humidity (%)", color: "#3b82f6" },
      { label: "Temperature (°C)", color: "#f59e0b" },
      { label: "Wind Speed (m/s)", color: "#22c55e" }
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(${i * 180}, 0)`);

      legendRow.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", item.color)
        .attr("stroke-width", 2);

      legendRow.append("text")
        .attr("x", 25)
        .attr("y", 4)
        .text(item.label)
        .style("font-size", "12px")
        .style("fill", "#374151");
    });
  }, [data]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width="100%"
        height={360}
        viewBox="0 0 800 300"
        preserveAspectRatio="xMidYMid meet"
      />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none opacity-0 bg-white text-black px-3 py-2 rounded-lg text-sm shadow-lg"
        style={{ transition: "opacity 0.2s" }}
      />
    </div>
  );
};

const DataVisualization: React.FC = () => {
  const [data, setData] = useState<AQIRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Primary location state
  const [country, setCountry] = useState<string>("Malaysia");
  const [region, setRegion] = useState<string>("AlorSetar");
  const [year, setYear] = useState<number>(2014);

  // Comparison location state
  const [compareCountry, setCompareCountry] = useState<string>("");
  const [compareRegion, setCompareRegion] = useState<string>("");
  const [compareYear, setCompareYear] = useState<number>(2014);

  const [activeTab, setActiveTab] = useState<"annual" | "comparison">("annual");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("http://localhost:3001/api/data");
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const apiData = await response.json();
        const parsed: AQIRow[] = apiData
          .filter((row: any) => row.Date && row.Country && row.Region)
          .map((d: any) => {
            const dateObj = new Date(d.Date);
            return {
              Country: d.Country,
              Region: d.Region,
              Date: d.Date,
              AQI: d.AQI != null ? Number(d.AQI) : null,
              Temperature: d.Temperature != null ? Number(d.Temperature) : null,
              RelativeHumidity: d.RelativeHumidity != null ? Number(d.RelativeHumidity) : null,
              WindSpeed: d.WindSpeed != null ? Number(d.WindSpeed) : null,
              Year: dateObj.getFullYear(),
              Month: months[dateObj.getMonth()],
              Day: dateObj.getDate(),
              Weekday: dateObj.getDay(),
              DateObj: dateObj,
            };
          });
        setData(parsed);
        setLoading(false);
      } catch (err: any) {
        setError("Error fetching API data: " + err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">No data available</div>
      </div>
    );
  }

  const allYears = Array.from(new Set(data.map(d => d.Year))).sort((a, b) => a - b);
  const regionCountryPairs = Array.from(
    new Set(data.map(d => `${d.Region}, ${d.Country}`))
  );

  // Calculate average AQI for any location
  const calculateAvgAQI = (reg: string, ctry: string, yr: number) => {
    if (!reg || !ctry) return 0;
    const filtered = data.filter(
      d => d.Region === reg && d.Country === ctry && d.Year === yr && d.AQI !== null && !isNaN(d.AQI)
    );
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, d) => acc + (d.AQI || 0), 0);
    const avgAQI = Math.round(sum / filtered.length);
    console.log(`Calculating AQI for ${reg}, ${ctry} (${yr}):`, { filtered: filtered.length, avgAQI });
    return avgAQI;
  };

  // Calculate average temp and humidity
  const calculateAvgWeather = (reg: string, ctry: string, yr: number) => {
    if (!reg || !ctry) return { temp: 0, humidity: 0 };
    const filtered = data.filter(
      d => d.Region === reg && d.Country === ctry && d.Year === yr
    );
    if (filtered.length === 0) return { temp: 0, humidity: 0 };

    const tempData = filtered.filter(d => d.Temperature !== null && !isNaN(d.Temperature));
    const humidityData = filtered.filter(d => d.RelativeHumidity !== null && !isNaN(d.RelativeHumidity));

    const avgTemp = tempData.length > 0
      ? tempData.reduce((acc, d) => acc + (d.Temperature || 0), 0) / tempData.length
      : 0;
    const avgHumidity = humidityData.length > 0
      ? humidityData.reduce((acc, d) => acc + (d.RelativeHumidity || 0), 0) / humidityData.length
      : 0;

    return { temp: avgTemp, humidity: avgHumidity };
  };

  const primaryAQI = calculateAvgAQI(region, country, year);
  const primaryWeather = calculateAvgWeather(region, country, year);

  const compareAQI = compareRegion && compareCountry
    ? calculateAvgAQI(compareRegion, compareCountry, compareYear)
    : 0;
  const compareWeather = compareRegion && compareCountry
    ? calculateAvgWeather(compareRegion, compareCountry, compareYear)
    : { temp: 0, humidity: 0 };

  console.log('Primary AQI:', primaryAQI, 'Compare AQI:', compareAQI);

  const filtered = data.filter(
    d => d.Country === country && d.Region === region && d.Year === year
  );

  const monthToWeeks = months.map(month => {
    const monthDays = filtered.filter(d => d.Month === month);
    if (monthDays.length === 0) return [];
    monthDays.sort((a, b) => a.Day - b.Day);
    const firstDay = monthDays[0].DateObj.getDay();
    let weeks: (AQIRow | null)[][] = [];
    let currentWeek: (AQIRow | null)[] = Array(firstDay).fill(null);
    for (let i = 0; i < monthDays.length; i++) {
      const dayData = monthDays[i];
      while (currentWeek.length < dayData.Weekday) {
        currentWeek.push(null);
      }
      currentWeek.push(dayData);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  });

  const monthlyAvg = months.map(month => {
    const monthDays = filtered.filter(d => d.Month === month && typeof d.AQI === "number" && d.AQI !== null);
    if (monthDays.length === 0) return "-";
    const avg = monthDays.reduce((sum, d) => sum + (d.AQI ?? 0), 0) / monthDays.length;
    return Math.round(avg);
  });

  const monthlyWeather = months.map(month => {
    const days = filtered.filter((d: AQIRow) => d.Month === month);
    const avg = (arr: (number | null)[]) => {
      const filteredArr = arr.filter(v => v !== null) as number[];
      return filteredArr.length ? Math.round(filteredArr.reduce((a, v) => a + v, 0) / filteredArr.length) : null;
    };
    return {
      month,
      Temperature: avg(days.map(d => d.Temperature)),
      RelativeHumidity: avg(days.map(d => d.RelativeHumidity)),
      WindSpeed: avg(days.map(d => d.WindSpeed))
    };
  });

  const yearlyAQI: Record<number, number[]> = data.reduce((acc: Record<number, number[]>, d: AQIRow) => {
    if (!d.Year || d.AQI == null) return acc;
    acc[d.Year] = acc[d.Year] || [];
    acc[d.Year].push(d.AQI);
    return acc;
  }, {})

  const years = Object.keys(yearlyAQI).sort();

  return (
    <div className="bg-transparent rounded-xl shadow p-10">
      <h2 className="text-3xl font-semibold h-100px mb-2">Data Visualization</h2>
      <h3 className="text-md text-gray-400 mb-2">Comprehensive analysis and comparison of air quality metrics</h3>

      <div className="bg-transparent rounded-xl shadow p-10 min-w-full min-h-5">
        <div className="flex justify-start mb-5">
          <button
            onClick={() => setActiveTab("annual")}
            className={`flex items-center mr-3 px-6 py-2 rounded-xl text-base font-semibold shadow border focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all ${activeTab === "annual"
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-gray-100 text-gray-700 border-gray-200"
              }`}
          >
            <span className="material-icons align-middle mr-2">📅</span>
            Annual Insights
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={`flex items-center px-6 py-2 rounded-xl text-base font-semibold border shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all ${activeTab === "comparison"
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-gray-100 text-gray-700 border-gray-200"
              }`}
          >
            <span className="material-icons align-middle mr-2">📊</span>
            Location Comparison
          </button>
        </div>

        {activeTab === "annual" && (
          <div className="bg-transparent rounded-2xl shadow-xl px-5 py-3 flex items-center justify-between" style={{ minHeight: '75px' }}>
            <div className="flex flex-col justify-center">
              <div className="text-2xl font-semibold mb-2">Annual Air Quality Insights</div>
              <div className="text-sm text-blue-600 font-semibold cursor-pointer">{region}, {country}</div>
            </div>
            <div className="flex gap-4 items-center">
              <select
                value={`${region}, ${country}`}
                onChange={e => {
                  const [selectedRegion, selectedCountry] = e.target.value.split(", ").map(str => str.trim());
                  setCountry(selectedCountry);
                  setRegion(selectedRegion);
                }}
                className="rounded-xl bg-gray-100 bg-transparent border-none px-8 py-4 text-lg font-semibold shadow focus:ring-2 focus:ring-blue-300 min-w-[220px]"
                style={{ minHeight: "48px" }}
              >
                {regionCountryPairs.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="rounded-xl bg-gray-100 bg-transparent border-none px-8 py-4 text-lg font-semibold shadow focus:ring-2 focus:ring-blue-300 min-w-[120px]"
                style={{ minHeight: "48px" }}
              >
                {allYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Only show these sections when Annual Insights tab is active */}
        {activeTab === "annual" && (
          <>
            <h2 className="text-lg font-medium mt-5 mb-3 text-gray-900 dark:text-gray-100">AQI Levels in {year}</h2>
            <div className="overflow-x-auto w-full mb-5 bg-transparent">
              <div className="flex flex-col min-w-[1000px]">
                {/* Main calendar section */}
                <div className="flex flex-row">
                  {/* Day labels column */}
                  <div className="flex flex-col mr-1 flex-shrink-0">
                    <div className="h-[20px] mb-1"></div>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
                      <div
                        key={wd}
                        className="h-[16px] flex items-center font-bold justify-end text-[9px] text-gray-500 dark:text-gray-400"
                        style={{ width: '22px' }}
                      >
                        {wd}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid with months */}
                  <div className="bg-transparent grid grid-cols-12 gap-x-0.5 flex-1">
                    {months.map((month, mIdx) => (
                      <div
                        key={month}
                        className="flex flex-col bg-transparent items-center border-l border-gray-200 dark:border-gray-700 min-w-[70px]"
                      >
                        {/* Month label */}
                        <div className="text-[12px] font-semibold mb-1 h-[23px] flex items-center justify-center text-gray-700 dark:text-gray-200">
                          {month}
                        </div>

                        {/* Week rows */}
                        {monthToWeeks[mIdx].map((week, wIdx) => (
                          <div key={wIdx} className="flex">
                            {week.map((day, dIdx) => (
                              <div
                                key={dIdx}
                                className={`h-[13px] w-[12px] rounded m-[1.2px] ${getColor(day?.AQI)} cursor-pointer hover:ring-1 hover:ring-gray-400 transition-all relative group`}
                              >
                                {day && (
                                  <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-50">
                                    {/* Tooltip arrow */}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-row mt-1">
                  {/* Avg label */}
                  <div className="flex flex-col mr-1 flex-shrink-0">
                    <div className="h-[16px] flex items-center font-bold justify-end text-[9px] text-gray-500 dark:text-gray-400" style={{ width: '22px' }}>
                      Avg.
                    </div>
                  </div>

                  <div className="bg-transparent grid grid-cols-12 gap-x-0.5 flex-1">
                    {months.map((month, mIdx) => (
                      <div
                        key={month}
                        className="flex items-center justify-center border-l border-gray-200 dark:border-gray-700 min-w-[70px] h-[16px]"
                      >
                        <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                          {monthlyAvg[mIdx]} AQI
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <section className="bg-transparent rounded-2xl shadow p-6 mb-10 mt-2">
              <h3 className="text-base font-semibold mb-2">Weather Metrics Overview</h3>
              <D3LineChart data={monthlyWeather} />
            </section>

            <section className="bg-transparent rounded-2xl shadow p-6">
              <h3 className="text-lg bg-transparent font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Year-over-Year Comparison
              </h3>
              <div className="flex bg-transparent flex-nowrap overflow-x-auto gap-6 pb-3 w-full">
                {years.map(year => {
                  const yearData = data.filter(
                    d => d.Year === +year &&
                      typeof d.AQI === "number" &&
                      d.AQI !== null
                  );
                  const uniqueDaysMap = new Map();
                  yearData.forEach(d => {
                    const dayKey = `${d.Year}-${d.Month}-${d.Day}`;
                    if (!uniqueDaysMap.has(dayKey)) {
                      uniqueDaysMap.set(dayKey, d.AQI);
                    }
                  });

                  const dailyAQIValues = Array.from(uniqueDaysMap.values());

                  const goodDays = dailyAQIValues.filter(aqi => aqi >= 0 && aqi <= 30).length;
                  const moderateDays = dailyAQIValues.filter(aqi => aqi > 30 && aqi <= 100).length;
                  const badDays = dailyAQIValues.filter(aqi => aqi > 100).length;

                  const monthlyAverages = months.map(month => {
                    const dataForMonth = data.filter(
                      d => d.Year === +year && d.Month === month && typeof d.AQI === "number" && d.AQI !== null
                    );
                    if (dataForMonth.length === 0) return { avg: 0, color: "bg-gray-200" };
                    const validMonthData = dataForMonth
                      .map(d => ({ ...d, AQI: Number(d.AQI) }))
                      .filter(d => !isNaN(d.AQI));

                    const avg = validMonthData.length
                      ? Math.round(validMonthData.reduce((sum, d) => sum + d.AQI, 0) / validMonthData.length)
                      : 0;
                    let color = "bg-green-400";
                    if (avg >= 0 && avg <= 30) color = "bg-green-400";
                    else if (avg > 31 && avg <= 100) color = "bg-yellow-400";
                    else if (avg > 100 && avg <= 150) color = "bg-orange-600";
                    else if (avg > 150 && avg <= 200) color = "bg-red-600";
                    else if (avg > 200 && avg <= 300) color = "bg-purple-600";
                    else if (avg >= 301) color = "bg-red-500";
                    return { avg, color };
                  });

                  const validYearData = yearData
                    .map(d => ({ ...d, AQI: Number(d.AQI) }))
                    .filter(d => !isNaN(d.AQI));

                  const avgAQI = validYearData.length
                    ? Math.round(validYearData.reduce((a, d) => a + d.AQI, 0) / validYearData.length)
                    : 0;

                  const maxMonthIdx = monthlyAverages.reduce(
                    (idx, v, i, arr) => v.avg > arr[idx].avg ? i : idx, 0
                  );
                  const minMonthIdx = monthlyAverages.reduce(
                    (idx, v, i, arr) => v.avg < arr[idx].avg ? i : idx, 0
                  );
                  return (
                    <div key={year}
                      className="rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm py-5 px-5 flex flex-col justify-start items-center flex-shrink-0 mb-5 w-80 min-w-[320px]">
                      <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">{year}</div>
                      <div className="text-yellow-600 text-lg font-semibold mb-4">{avgAQI} AQI</div>
                      <div className="flex flex-col w-full items-center mb-2">
                        {months.map((month, i) => (
                          <div key={month} className="flex items-center w-full mb-1">
                            <span className="text-xs font-medium w-12 text-left text-gray-700 dark:text-gray-300">{month}</span>
                            <div className="flex-1 relative h-7 mx-2 flex items-center">
                              <div className={`absolute inset-0 rounded ${monthlyAverages[i].color}`} />
                              <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-900 dark:text-gray-100 z-10">
                                {monthlyAverages[i].avg || "-"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex w-full justify-between items-center mb-2">
                        <span className="font-small text-gray-600 dark:text-gray-300">Total Days</span>
                        <div className="flex w-full h-8 rounded overflow-hidden mb-3">
                          {goodDays > 0 && (
                            <div
                              className="bg-green-400 flex items-center justify-center text-white font-semibold text-sm"
                              style={{ width: `${(goodDays / (goodDays + moderateDays + badDays)) * 100}%` }}
                            >
                              {goodDays}
                            </div>
                          )}
                          {moderateDays > 0 && (
                            <div
                              className="bg-yellow-400 flex items-center justify-center text-gray-900 font-semibold text-sm"
                              style={{ width: `${(moderateDays / (goodDays + moderateDays + badDays)) * 100}%` }}
                            >
                              {moderateDays}
                            </div>
                          )}
                          {badDays > 0 && (
                            <div
                              className="bg-orange-600 flex items-center justify-center text-white font-semibold text-sm"
                              style={{ width: `${(badDays / (goodDays + moderateDays + badDays)) * 100}%` }}
                            >
                              {badDays}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-0.5 w-full text-xs">
                        <span>
                          Highest AQI recorded in <span className="font-bold text-yellow-700">{months[maxMonthIdx]}</span>:
                          <span className="font-bold ml-1 text-orange-600">{monthlyAverages[maxMonthIdx].avg}</span>
                        </span>
                        <span>
                          Lowest AQI recorded in <span className="font-bold text-green-700">{months[minMonthIdx]}</span>:
                          <span className="font-bold ml-1 text-green-600">{monthlyAverages[minMonthIdx].avg}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Most and Least Polluted Year Section */}
            <section className="flex gap-6 mt-6 mb-10">
              {(() => {
                const regionFilteredData = data.filter(d => d.Region === region && d.Country === country);

                const yearAverages = years.map(year => {
                  const yearData = regionFilteredData.filter(
                    d => d.Year === +year && typeof d.AQI === "number" && d.AQI !== null
                  );

                  const validYearData = yearData
                    .map(d => ({ ...d, AQI: Number(d.AQI) }))
                    .filter(d => !isNaN(d.AQI));
                  const avgAQI = validYearData.length
                    ? Math.round(validYearData.reduce((a, d) => a + d.AQI, 0) / validYearData.length)
                    : 0;

                  return { year, avgAQI };
                });

                const validYearAverages = yearAverages.filter(y => y.avgAQI > 0);

                if (validYearAverages.length === 0) {
                  return (
                    <div className="flex-1 text-center text-gray-500 py-10">
                      No data available for the selected region
                    </div>
                  );
                }

                const mostPolluted = validYearAverages.reduce((max, curr) =>
                  curr.avgAQI > max.avgAQI ? curr : max, validYearAverages[0]
                );

                const leastPolluted = validYearAverages.reduce((min, curr) =>
                  curr.avgAQI < min.avgAQI ? curr : min, validYearAverages[0]
                );

                const previousYears = validYearAverages.filter(y => +y.year < +mostPolluted.year);
                const avgPreviousYears = previousYears.length
                  ? previousYears.reduce((sum, y) => sum + y.avgAQI, 0) / previousYears.length
                  : mostPolluted.avgAQI;

                const percentChange = avgPreviousYears > 0
                  ? (((mostPolluted.avgAQI - avgPreviousYears) / avgPreviousYears) * 100).toFixed(1)
                  : 0;

                return (
                  <>
                    {/* Most Polluted Year */}
                    <div className="flex-1 rounded-xl border-2 border-orange-400 bg-orange-50 dark:bg-orange-950 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600 dark:text-orange-400">📊</span>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Most Polluted Year</h4>
                        </div>
                        <div className="bg-orange-500 text-white px-3 py-1 rounded-lg font-bold">
                          <div className="text-xs">AQI</div>
                          <div className="text-2xl">{mostPolluted.avgAQI}</div>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                        {mostPolluted.year}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-red-600">{percentChange}% worsened</span> compared to previous years
                      </p>
                    </div>
                    {/* Least Polluted Year */}
                    <div className="flex-1 rounded-xl border-2 border-green-400 bg-green-50 dark:bg-green-950 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400">📅</span>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Least Polluted Year</h4>
                        </div>
                        <div className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold">
                          <div className="text-xs">AQI</div>
                          <div className="text-2xl">{leastPolluted.avgAQI}</div>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {leastPolluted.year}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Excellent air quality throughout the year
                      </p>
                    </div>
                  </>
                );
              })()}
            </section>
          </>
        )}
      </div>

      {/* Divider */}
      {activeTab === "annual" && (
        <hr className="my-8 border-gray-300" />
      )}

      {/* Location Comparison Tab Content */}
      {activeTab === "comparison" && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Primary Location */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <span className="text-blue-500 mr-2">🎯</span>
                  Primary Location
                </label>
                <div className="flex gap-3">
                  <select
                    value={`${region}, ${country}`}
                    onChange={e => {
                      const [selectedRegion, selectedCountry] = e.target.value.split(", ").map(str => str.trim());
                      setCountry(selectedCountry);
                      setRegion(selectedRegion);
                    }}
                    className="flex-1 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                     text-gray-800 dark:text-gray-200 px-4 py-3 text-sm font-medium 
                     focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
                  >
                    {regionCountryPairs.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </select>

                  <select
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                     text-gray-800 dark:text-gray-200 px-4 py-3 text-sm font-medium 
                     focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
                  >
                    {allYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Compare With (Optional) */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <span className="text-orange-500 mr-2">📊</span>
                  Compare With (Optional)
                </label>
                <div className="flex gap-3">

                  <select
                    value={compareRegion && compareCountry ? `${compareRegion}, ${compareCountry}` : ""}
                    onChange={e => {
                      if (e.target.value === "") {
                        setCompareRegion("");
                        setCompareCountry("");
                      } else {
                        const [selectedRegion, selectedCountry] = e.target.value.split(", ").map(str => str.trim());
                        setCompareCountry(selectedCountry);
                        setCompareRegion(selectedRegion);
                      }
                    }}
                    className="flex-1 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                     text-gray-800 dark:text-gray-200 px-4 py-3 text-sm font-medium 
                     focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {regionCountryPairs.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </select>

                  {compareRegion && compareCountry && (
                    <select
                      value={compareYear}
                      onChange={e => setCompareYear(Number(e.target.value))}
                      className="rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                       text-gray-800 dark:text-gray-200 px-4 py-3 text-sm font-medium 
                       focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
                    >
                      {allYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  )}

                </div>
              </div>

            </div>
          </div>


          {/* Donut Charts */}
          <div className={`grid ${compareRegion && compareCountry ? 'grid-cols-2' : 'grid-cols-1'} gap-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8`}>
            <DonutChart
              aqi={primaryAQI}
              label={`${region}, ${country} (${year})`}
              temp={primaryWeather.temp}
              humidity={primaryWeather.humidity}
            />
            {compareRegion && compareCountry && (
              <DonutChart
                aqi={compareAQI}
                label={`${compareRegion}, ${compareCountry} (${compareYear})`}
                temp={compareWeather.temp}
                humidity={compareWeather.humidity}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
export default DataVisualization;