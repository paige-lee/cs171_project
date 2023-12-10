class DualLineChart {
    constructor(containerId, data, variable, ylabel) {
        this.containerId = containerId;
        this.data = data;
        this.variable = variable;
        this.ylabel = ylabel;

        this.margin = { top: 20, right: 60, bottom: 60, left: 80 }; // Adjusted right margin
        this.width = document.getElementById(this.containerId).getBoundingClientRect().width - this.margin.left - this.margin.right;
        this.height = document.getElementById(this.containerId).getBoundingClientRect().height - this.margin.top - this.margin.bottom;

        this.initChart();
        this.drawChart(this.ylabel);
        this.updateChart([-1, 1]); // Initialize with full range
    }

    initChart() {
        // Create SVG and group
        this.svg = d3.select(`#${this.containerId}`)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // Create scales
        this.xScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([0, this.width]);

        this.yScale = d3.scaleLinear()
            .domain([0, (this.variable === 'rating' ? 5 : 18000)])
            .range([this.height, 0]);

        // Group data by brand and adjective_1_sentiment, and compute average rating
        this.averageData = Array.from(d3.group(this.data, d => d.brand2), ([brand, values]) => ({
            brand: brand,
            values: Array.from(d3.group(values, d => d.adjective_1_sentiment), ([sentiment, sentimentValues]) => ({
                adjective_1_sentiment: +sentiment,
                average: d3.mean(sentimentValues, d => d[this.variable])
            }))
                .sort((a, b) => a.adjective_1_sentiment - b.adjective_1_sentiment)
        }));

        // Define line function
        this.line = d3.line()
            .x(d => this.xScale(d.adjective_1_sentiment))
            .y(d => this.yScale(d.average));

        // Draw lines for each brand
        this.svg.selectAll(".line")
            .data(this.averageData)
            .enter().append("path")
            .attr("class", "line")
            .attr("d", d => this.line(d.values))
            .attr("stroke", d => (d.brand === "Nike") ? "purple" : "lightgreen")
            .attr("stroke-width", 2)
            .attr("fill", "none");

    }

    drawChart(yAxisLabel) {
        // Draw x-axis
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.xScale))
            .selectAll("text")
            .style("text-anchor", "middle");

        // Draw x-axis label
        this.svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", this.width / 2)
            .attr("y", this.height + this.margin.bottom - 10) // Adjusted position
            .text("Adjective 1 Sentiment");

        // Draw y-axis
        this.svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(this.yScale))
            .selectAll("text") // Adjust y-axis labels
            .attr("x", -10)
            .style("text-anchor", "end");

        // Draw y-axis label
        this.svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -60)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text(yAxisLabel);

        // Add legend
        const legend = this.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (this.width - this.margin.right) + ", 20)");

        legend.selectAll("rect")
            .data(this.averageData)
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => (d.brand === "Nike") ? "purple" : "lightgreen");

        legend.selectAll("text")
            .data(this.averageData)
            .enter().append("text")
            .attr("x", 25)
            .attr("y", (d, i) => i * 20 + 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d.brand);
    }

    updateChart(brushedValues) {
        // Update x-axis domain based on brushed values
        this.xScale.domain(brushedValues);

        // Redraw lines and x-axis with updated domain
        this.svg.selectAll(".line")
            .data(this.averageData)
            .transition()
            .duration(500)
            .attr("d", d => this.line(d.values));

        this.svg.select(".x.axis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(this.xScale))
            .selectAll("text")
            .style("text-anchor", "middle");
    }

}
