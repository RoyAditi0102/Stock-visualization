import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { FaChartLine, FaTh, FaBars } from "react-icons/fa";
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

        const width = 800, height = 600, margin = 60;

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
                    d3.select(tooltipRef.current)
                        .style("display", "block")
                        .html(`📅 ${d.date}<br>💰 ${d.close}`)
                        .style("left", `${event.pageX + 15}px`)
                        .style("top", `${event.pageY - 40}px`);
                })
                .on("mouseout", () => {
                    d3.select(tooltipRef.current).style("display", "none");
                });
        } else if (chartType === "bar") {
            // Bar Chart
            svg.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", d => xScale(new Date(d.date)))
                .attr("y", d => yScale(d.close))
                .attr("width", 10)
                .attr("height", d => height - margin - yScale(d.close))
                .attr("fill", "#ff758c");
        } else if (chartType === "candlestick") {
            // Candlestick Chart
            svg.selectAll("rect.candle")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", d => xScale(new Date(d.date)))
                .attr("y", d => yScale(Math.max(d.open, d.close)))
                .attr("width", 10)
                .attr("height", d => Math.abs(yScale(d.open) - yScale(d.close)))
                .attr("fill", d => (d.close > d.open ? "#4caf50" : "#ff758c"));
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
        <div style={{
            display: "flex",                // Use flexbox to align items
            justifyContent: "center",       // Center horizontally
            alignItems: "center",           // Center vertically
            height: "100vh",                // Make the container full height of the viewport
            padding: "0 20px"               // Optional: add some padding if you want space around
        }}>
            <div style={{
                display: "flex",
                flexDirection: "row",         // Arrange sidebar and chart side by side
                alignItems: "center",         // Align vertically in the center
                justifyContent: "center",     // Center horizontally
            }}>
                {/* Tooltip Box for Icons */}
{hoverText && (
    <div style={{
        position: "absolute",
        left: "90px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "5px 10px",
        borderRadius: "5px",
        fontSize: "18px",
        whiteSpace: "nowrap"
    }}>
        {hoverText}
    </div>
)}
                {/* Sidebar with Icons */}
                <div style={{
                    width: "180px",            // Increased width of the sidebar
                    background: "rgba(0, 0, 0, 0.7)",
                    padding: "30px 15px",      // Increased padding
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative"
                }}>
                    <FaChartLine
                        onClick={() => setChartType("line")}
                        onMouseEnter={() => setHoverText("Line Chart")}
                        onMouseLeave={() => setHoverText("")}
                        style={{ fontSize: "36px", margin: "20px 0", cursor: "pointer" }}  // Increased font size and margin
                    />
                    <FaBars
                        onClick={() => setChartType("bar")}
                        onMouseEnter={() => setHoverText("Bar Chart")}
                        onMouseLeave={() => setHoverText("")}
                        style={{ fontSize: "36px", margin: "20px 0", cursor: "pointer" }}  // Increased font size and margin
                    />
                    <MdCandlestickChart
                        onClick={() => setChartType("candlestick")}
                        onMouseEnter={() => setHoverText("Candlestick Chart")}
                        onMouseLeave={() => setHoverText("")}
                        style={{ fontSize: "36px", margin: "20px 0", cursor: "pointer" }}  // Increased font size and margin
                    />
                    <FaTh
                        onClick={() => setShowGrid(!showGrid)}
                        onMouseEnter={() => setHoverText("Toggle Grid")}
                        onMouseLeave={() => setHoverText("")}
                        style={{ fontSize: "36px", margin: "20px 0", cursor: "pointer" }}  // Increased font size and margin
                    />
                </div>
        
                {/* Chart Area */}
                <svg ref={svgRef} width={1000} height={800} margin={20}/>
                <div ref={tooltipRef} />
            </div>
        </div>
        
    );
};

export default Chart;
