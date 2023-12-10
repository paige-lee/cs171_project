class Histogram {
    constructor(containerId, data, brand) {
        this.containerId = containerId;
        this.data = data;
        this.countData =data;
        this.brand = brand;

        this.margin = { top: 20, right: 30, bottom: 30, left: 40 };
        this.width = document.getElementById(this.containerId).getBoundingClientRect().width - this.margin.left - this.margin.right;
        this.height = document.getElementById(this.containerId).getBoundingClientRect().height - this.margin.top - this.margin.bottom;

        this.initHistogram();
    }

    initHistogram() {
        let viz = this;
        // Filter data based on the selected brand
        let filteredData = this.data.filter(d => d.brand2 === this.brand); // #1

        // Create scales
        viz.xScale = d3.scaleBand()
            .domain([...new Set(filteredData.map(d => d.adjective_1_sentiment))].sort((a, b) => a - b))
            .range([0, this.width])
            .padding(0.1);

        viz.yScale = d3.scaleLinear()
            .range([this.height, 0]);

        // Count occurrences of each unique adjective_1_sentiment
        const counts = {};
        filteredData.forEach(d => {
            const sentiment = d.adjective_1_sentiment;
            counts[sentiment] = (counts[sentiment] || 0) + 1;
        });

        viz.countData = Object.entries(counts).map(([sentiment, count]) => ({ sentiment, count }));

        // Set domain for yScale based on count values
        viz.yScale.domain([0, d3.max(this.countData, d => d.count)]);

        // Create a reference to the Histogram instance
        //const histogram = this;
        console.log("Count Data ",  viz.countData)
        this.wrangleData();

    }

    wrangleData(){
        let viz = this;

        console.log("WrangleData From Histogram",  selectedRange);
        console.log("Count Data -------------- 52",  viz.data);

        let filteredData = [];

        viz.data.forEach( c =>{
            c.adjective_1_sentiment += c.adjective_1_sentiment;

            if (selectedRange[0] <= c.adjective_1_sentiment && c.adjective_1_sentiment <= selectedRange[1])
            {
                filteredData.push(c)
            }
        })

        viz.countData = filteredData;
        console.log(viz.countData);
        this.drawHistogram();
    }

    drawHistogram() {
    let viz = this;
        const svg = d3.select(`#${this.containerId}`)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // Draw histogram bars
        svg.selectAll("rect")
            .data(viz.countData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => this.xScale(d.sentiment))
            .attr("width", this.xScale.bandwidth())
            .attr("y", d => this.yScale(d.count))
            .attr("height", d => this.height - this.yScale(d.count))
            .attr("fill", d => (this.brand === "Nike" ? "purple" : "lightgreen")); // Set color based on brand

        // Draw x-axis with formatted and tilted tick labels
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.xScale).tickFormat(d3.format(".2f")).tickPadding(10))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Draw y-axis
        const yAxis = svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(this.yScale));

        // // Add y-axis label
        // yAxis.append("text")
        //     .attr("class", "y label")
        //     .attr("text-anchor", "middle") // Centered text
        //     .attr("x", -this.margin.top) // Move left
        //     .attr("y", this.height + this.margin.bottom) // Move down
        //     .attr("dy", ".75em")
        //     .attr("transform", "rotate(-90)")
        //     .text("Count");
        //
        // // Add x-axis label
        // svg.append("text")
        //     .attr("class", "x label")
        //     .attr("text-anchor", "middle") // Centered text
        //     .attr("x", this.width / 2)
        //     .attr("y", this.height + this.margin.bottom) // Adjust as needed
        //     .text("Adjective Sentiment");
    }

}