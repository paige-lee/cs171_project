class barchartVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
        this.width = 600 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;

        this.initializeChart();
    }

    initializeChart() {
        this.svg = d3.select(`#${this.parentElement}`)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom +90)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // Append the title with proper positioning
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", -this.margin.top / 20) // Adjusting the position for the title
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Mean 1st Adjective Sentiment of Nike and Adidas Products");

        this.calculateAverageSentiment();
    }


    calculateAverageSentiment() {
        // Filter data for Nike and Adidas
        const nikeData = this.data.filter(d => d.brand2 === 'Nike'); // Make sure 'brand2' matches the actual column header
        const adidasData = this.data.filter(d => d.brand2 === 'Adidas'); // Make sure 'brand2' matches the actual column header

        // Ensure the filtered data is not empty
        console.log('Nike Data:', nikeData);
        console.log('Adidas Data:', adidasData);

        // Calculate average sentiment for the first adjective in product description
        let calculateAverage = (data) => {
            const sentiments = data.map(d => parseFloat(d['adjective_1_sentiment'])).filter(val => !isNaN(val));
            if (sentiments.length === 0) return 0; // Handle case when no valid sentiment values are present

            let sum = 0;
            for (let i = 0; i < sentiments.length; i++) {
                sum += sentiments[i];
            }

            return sum / sentiments.length;
        };

        this.averageSentimentNike = calculateAverage(nikeData);
        console.log('Average Sentiment for Nike:', this.averageSentimentNike.toFixed(4));

        this.averageSentimentAdidas = calculateAverage(adidasData);
        console.log('Average Sentiment for Adidas:', this.averageSentimentAdidas.toFixed(4));

        this.createBars();
    }

    createBars() {
        const x = d3.scaleBand()
            .domain(['Nike', 'Adidas'])
            .range([0, this.width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max([this.averageSentimentNike, this.averageSentimentAdidas])])
            .range([this.height, 0]);

        // Adjust the vertical translation for the entire SVG group
        const svgGroup = this.svg.append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + (this.margin.top + 80) + ')'); // Adjust vertical position here

        const barGroup = svgGroup.append('g');

        barGroup.selectAll(".bar")
            .data([this.averageSentimentNike, this.averageSentimentAdidas])
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => x(['Nike', 'Adidas'][i]))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d))
            .attr("height", d => this.height - y(d))
            .attr("fill", (d, i) => (i === 0) ? "purple" : "lightgreen")
            .attr("fill-opacity", 0.7);

        // Append average as text to the top of each bar
        barGroup.selectAll(".bar-label")
            .data([this.averageSentimentNike, this.averageSentimentAdidas])
            .enter().append("text")
            .attr("class", "bar-label")
            .attr("x", (d, i) => x(['Nike', 'Adidas'][i]) + x.bandwidth() / 2)
            .attr("y", d => y(d) - 5) // Position text slightly above the bar
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .style("font-weight", "bold")
            .text(d => d.toFixed(4)); // Update to display 4 decimal places

        const xAxis = svgGroup.append("g")
            .attr("transform", "translate(0," + this.height + ")") // Adjust vertical position for x-axis
            .call(d3.axisBottom(x).tickSizeOuter(0)); // Adjust tickSizeOuter here

        const yAxis = svgGroup.append("g")
            .call(d3.axisLeft(y));

        // Style x-axis and y-axis ticks, text, etc., if needed
        xAxis.selectAll('text').style('fill', 'black');
        yAxis.selectAll('text').style('fill', 'black');
        xAxis.selectAll('line').style('stroke', 'black');
        yAxis.selectAll('line').style('stroke', 'black');
    }
}
