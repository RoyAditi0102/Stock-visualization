import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { FaChartLine, FaBars, FaTh } from "react-icons/fa";
import { MdCandlestickChart } from "react-icons/md";

const Chart = ({ data }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const [chartType, setChartType] = useState("line");
    const [showGrid, setShowGrid] = useState(false);
    const [hoverText, setHoverText] = useState("");

    useEffect(() => {
        if (!data || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 800, height = 500, margin = 60;

        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.date)))
            .range([margin, width - margin]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
            .range([height - margin, margin]);

        // Background for the chart
        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "rgba(0, 0, 0, 0.5)")
            .attr("rx", 10)
            .lower();

        // Grid lines (if enabled)
        if (showGrid) {
            svg.append("g")
                .attr("class", "grid")
                .attr("transform", `translate(0,${height - margin})`)
                .call(d3.axisBottom(xScale).tickSize(-height + 2 * margin).tickFormat(""));

            svg.append("g")
                .attr("class", "grid")
                .attr("transform", `translate(${margin},0)`)
                .call(d3.axisLeft(yScale).tickSize(-width + 2 * margin).tickFormat(""));
        }

        // Handling different chart types
        if (chartType === "line") {
            // Line Chart
            const line = d3.line()
                .x(d => xScale(new Date(d.date)))
                .y(d => yScale(d.close))
                .curve(d3.curveMonotoneX);

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#ff758c")
                .attr("stroke-width", 3)
                .attr("d", line);

            // Glowing Points with Tooltip
            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => xScale(new Date(d.date)))
                .attr("cy", d => yScale(d.close))
                .attr("r", 5)
                .attr("fill", "#ff758c")
                .attr("stroke", "white")
                .attr("stroke-width", 2)
                .style("filter", "drop-shadow(0px 0px 8px rgba(255, 117, 140, 0.8))")
                .on("mouseover", (event, d) => {
                    const tooltip = d3.select(tooltipRef.current);

                    // Set tooltip content and position
                    tooltip
                        .style("display", "block")
                        .html(`📅 ${d.date}<br>💰 ${d.close}`)
                        .style("top", `${event.pageY + 10}px`) // Position the tooltip near cursor
                        .style("left", `${event.pageX + 10}px`)
                        .style("position", "absolute")
                        .style("pointer-events", "none")
                        .style("background-color", "rgba(0, 0, 0, 0.7)")  // Black transparent background
                        .style("color", "white")  // White text
                        .style("padding", "10px 15px")
                        .style("border-radius", "8px")
                        .style("font-size", "14px")
                        .style("white-space", "nowrap");  // Prevent wrapping
                })
                .on("mouseout", () => {
                    d3.select(tooltipRef.current).style("display", "none");  // Hide tooltip on mouse out
                });
        }

        if (chartType === "bar") {
            // Bar Chart
            const barWidth = (width - 2 * margin) / data.length;
            
            svg.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", (d, i) => xScale(new Date(d.date)) - barWidth / 2)
                .attr("y", d => yScale(d.close))
                .attr("width", barWidth)
                .attr("height", d => height - margin - yScale(d.close))
                .attr("fill", "#ff758c")
                .on("mouseover", (event, d) => {
                    const tooltip = d3.select(tooltipRef.current);
                    tooltip
                        .style("display", "block")
                        .html(`📅 ${d.date}<br>💰 ${d.close}`)
                        .style("top", `${event.pageY + 10}px`) // Position the tooltip near cursor
                        .style("left", `${event.pageX + 10}px`)
                        .style("position", "absolute")
                        .style("pointer-events", "none")
                        .style("background-color", "rgba(0, 0, 0, 0.7)")  // Black transparent background
                        .style("color", "white")
                        .style("padding", "10px 15px")
                        .style("border-radius", "8px")
                        .style("font-size", "14px")
                        .style("white-space", "nowrap");
                })
                .on("mouseout", () => {
                    d3.select(tooltipRef.current).style("display", "none");
                });
        }

        if (chartType === "candlestick") {
            // Candlestick Chart
            svg.selectAll("line")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", d => xScale(new Date(d.date)))
                .attr("x2", d => xScale(new Date(d.date)))
                .attr("y1", d => yScale(d.high))
                .attr("y2", d => yScale(d.low))
                .attr("stroke", "#ff758c")
                .attr("stroke-width", 1);

            svg.selectAll("rect.candle")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", d => xScale(new Date(d.date)) - 5)
                .attr("y", d => yScale(Math.max(d.open, d.close)))
                .attr("width", 10)
                .attr("height", d => Math.abs(yScale(d.open) - yScale(d.close)))
                .attr("fill", d => d.close > d.open ? "#ff758c" : "#ffa07a")
                .on("mouseover", (event, d) => {
                    const tooltip = d3.select(tooltipRef.current);
                    tooltip
                        .style("display", "block")
                        .html(`📅 ${d.date}<br>📉 Open: ${d.open}<br>📈 Close: ${d.close}`)
                        .style("top", `${event.pageY + 10}px`) // Position the tooltip near cursor
                        .style("left", `${event.pageX + 10}px`)
                        .style("position", "absolute")
                        .style("pointer-events", "none")
                        .style("background-color", "rgba(0, 0, 0, 0.7)")  // Black transparent background
                        .style("color", "white")
                        .style("padding", "10px 15px")
                        .style("border-radius", "8px")
                        .style("font-size", "14px")
                        .style("white-space", "nowrap");
                })
                .on("mouseout", () => {
                    d3.select(tooltipRef.current).style("display", "none");
                });
        }

        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${height - margin})`)
            .call(d3.axisBottom(xScale).ticks(6));

        svg.append("g")
            .attr("transform", `translate(${margin},0)`)
            .call(d3.axisLeft(yScale));

    }, [data, chartType, showGrid]);

    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            {/* Sidebar with Icons */}
            <div style={{
                width: "120px",
                background: "rgba(0, 0, 0, 0.7)",
                padding: "20px 10px",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative"
            }}>
                {/* Tooltip Box for Icons */}
                {hoverText && (
                    <div style={{
                        position: "absolute",
                        top: "10px",
                        left: "130px",
                        background: "#fff",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontSize: "12px",
                        color: "#333",
                        boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)"
                    }}>
                        {hoverText}
                    </div>
                )}

                {/* Chart Type Toggle Buttons */}
                <button
                    onClick={() => setChartType("line")}
                    title="Line Chart"
                    onMouseEnter={() => setHoverText("Line Chart")}
                    onMouseLeave={() => setHoverText("")}
                    style={{ background: "none", border: "none", color: "white", fontSize: "24px", margin: "10px 0" }}>
                    <FaChartLine />
                </button>
                <button
                    onClick={() => setChartType("bar")}
                    title="Bar Chart"
                    onMouseEnter={() => setHoverText("Bar Chart")}
                    onMouseLeave={() => setHoverText("")}
                    style={{ background: "none", border: "none", color: "white", fontSize: "24px", margin: "10px 0" }}>
                    <FaBars />
                </button>
                <button
                    onClick={() => setChartType("candlestick")}
                    title="Candlestick Chart"
                    onMouseEnter={() => setHoverText("Candlestick Chart")}
                    onMouseLeave={() => setHoverText("")}
                    style={{ background: "none", border: "none", color: "white", fontSize: "24px", margin: "10px 0" }}>
                    <MdCandlestickChart />
                </button>

                {/* Grid Toggle */}
                <button
                    onClick={() => setShowGrid(prev => !prev)}
                    title="Toggle Grid"
                    onMouseEnter={() => setHoverText("Toggle grid")}
                    onMouseLeave={() => setHoverText("")}
                    style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        fontSize: "24px",
                        margin: "10px 0"
                    }}>
                    <FaTh />
                </button>
            </div>

            {/* Tooltip for Hover */}
            <div ref={tooltipRef} style={{ display: "none", pointerEvents: "none" }} />

            {/* Chart Rendering Area */}
            <svg ref={svgRef} width="1000" height="600"></svg>
        </div>
    );
};

export default Chart;
