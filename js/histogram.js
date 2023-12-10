class Histogram {
    constructor(containerId, data, brand) {
        this.containerId = containerId;
        this.data = data;
        this.countData = data;
        this.brand = brand;

        this.margin = { top: 20, right: 30, bottom: 30, left: 40 };
        this.width = document.getElementById(this.containerId).getBoundingClientRect().width - this.margin.left - this.margin.right;
        this.height = document.getElementById(this.containerId).getBoundingClientRect().height - this.margin.top - this.margin.bottom;

        this.initHistogram();
    }

    initHistogram() {
        let viz = this;

        const svg = d3.select(`#${this.containerId}`)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // Store reference to the svg element
        viz.svg = svg;

        // Add title to the histogram
        svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", -5)  // Adjust this value to move the title up or down
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text(viz.brand + " Histogram");

        // Initialize xScale
        viz.xScale = d3.scaleBand()
            .range([0, this.width])
            .padding(0.1);

        // Set the domain of xScale based on unique sentiments
        viz.xScale.domain(viz.data.map(d => d.adjective_1_sentiment));

        viz.yScale = d3.scaleLinear()
            .range([this.height, 0]);

        viz.xAxisGroup = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")");

        viz.xAxisGroup
            .call(d3.axisBottom(viz.xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("dx", -8) // Adjust this value to move the labels left or right
            .attr("dy", 8); // Adjust this value to move the labels down or up



        viz.yAxisGroup = svg.append("g")
            .attr("class", "y axis");

        this.wrangleData();
    }


    wrangleData() {
        let viz = this;

        // Filter data based on the selected range
        let filteredData = viz.data;

        if (selectedRange.length !== 0) {
            filteredData = filteredData.filter(c =>
                selectedRange[0] <= c.adjective_1_sentiment && c.adjective_1_sentiment <= selectedRange[1]
            );
        }

        let counts = {};
        filteredData.forEach(d => {
            const sentiment = d.adjective_1_sentiment;
            counts[sentiment] = (counts[sentiment] || 0) + 1;
        });

        viz.countData = Object.entries(counts).map(([sentiment, count]) => ({ sentiment, count }));

        console.log(viz.countData);
        console.log(viz.countData.length);

        this.drawHistogram();
    }
    drawHistogram() {
        let viz = this;

        console.log(viz.countData.length);

        viz.yScale.domain([0, d3.max(viz.countData, d => d.count)]);
        viz.xScale.domain(viz.countData.map(d => d.sentiment));

        viz.xAxisGroup
            .transition()
            .duration(300)
            .call(d3.axisBottom(viz.xScale).tickFormat(d3.format(".2f")));

        viz.yAxisGroup
            .transition()
            .duration(300)
            .call(d3.axisLeft(viz.yScale));

        viz.hist = viz.svg.selectAll(".bar")
            .data(viz.countData);

        viz.hist
            .enter().append("rect")
            .merge(viz.hist)
            .attr("class", "bar")
            .attr("x", d => viz.xScale(d.sentiment))
            .attr("width", viz.xScale.bandwidth())
            .attr("y", d => viz.yScale(d.count))
            .attr("height", d => viz.height - viz.yScale(d.count))
            .attr("fill", d => (viz.brand === "Nike" ? "purple" : "lightgreen"));

        viz.hist.exit().remove();
    }
}
