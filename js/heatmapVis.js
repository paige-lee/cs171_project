class heatmapVis {
    constructor(containerId, data) {
        this.data = data;
        this.containerId = containerId;
        this.margin = { top: 60, right: 30, bottom: 80, left: 40 };
        this.width = 1000 - this.margin.left - this.margin.right;
        this.height = 120;

        this.svg = d3.select(`#${containerId}`)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        const gradient = this.svg.append("defs").append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");

        gradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", "DeepSkyBlue");

        gradient.append("stop")
            .attr("offset", "50%")
            .style("stop-color", "white");

        gradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", "tomato");

        this.svg.append("rect")
            .attr("x", this.margin.left)
            .attr("y", this.margin.top + 2)
            .attr("width", this.width)
            .attr("height", this.height)
            .style("fill", "url(#gradient)");

        this.labelScale = d3.scaleLinear()
            .range([this.margin.left, this.margin.left + this.width])
            .domain([-1, 1]);

        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", 30)
            .text("Sentiment Analysis Scale")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle");

        this.svg.append("line")
            .attr("x1", this.margin.left)
            .attr("x2", this.margin.left + this.width)
            .attr("y1", this.height + 62)
            .attr("y2", this.height + 62)
            .style("stroke", "black")
            .style("stroke-width", 1);

        this.svg.selectAll(".axis-label")
            .data([-1, 0, 1])
            .enter()
            .append("text")
            .attr("class", "axis-label")
            .attr("x", d => this.labelScale(d) + (d === 1 ? -14 : 0))
            .attr("y", this.height + 75)
            .text(d => d)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle");

        // Add a brush
        this.brush = d3.brushX()
            .extent([[this.margin.left, this.margin.top], [this.margin.left + this.width, this.margin.top + this.height]])
            .on("brush", () => this.brushMoved())
            .on("end", () => this.brushEnded());

        const initialBrushSelection = [this.margin.left, this.margin.left + this.width / 10];
        this.brushGroup = this.svg.append("g")
            .attr("class", "brush")
            .call(this.brush);

        this.brushGroup.select(".overlay")
            .style("fill", "rgba(0, 0, 0, 0)");

        this.brushGroup.select(".selection")
            .style("fill", "rgba(200, 200, 200, 0.3)")
            .raise();

        // Move the brush initially to the desired position
        this.brush.move(this.brushGroup, initialBrushSelection);

        // Additional initialization
        this.transitioning = false;
        this.resettingBrush = false;

        this.updateWordLabels(-1, 1); // Initial update with full range
    }

    brushMoved() {
        const selection = this.brushGroup.select(".brush").node();

        if (!selection || !selection.selection()) return;

        const [startX, endX] = selection.selection().map(d => this.labelScale.invert(d - this.margin.left));

        const start = Math.max(-1, Math.min(1, startX));
        const end = Math.max(-1, Math.min(1, endX));

        this.updateWordLabels(start, end);
    }

    brushEnded() {
        if (!d3.event.selection) {
            console.log("Brush is empty. Resetting.");

            // Check if the reset is initiated by the code to avoid recursion
            if (!this.resettingBrush) {
                this.resettingBrush = true;
                this.brushGroup.transition().call(this.brush.clear);
                this.updateWordLabels(-1, 1); // Reset word labels
                this.resettingBrush = false;
            }
        } else {
            const brushSelection = d3.event.selection;
            const [startX, endX] = brushSelection || [0, 0]; // Default values if selection is null
            const start = Math.max(-1, Math.min(1, this.labelScale.invert(startX - this.margin.left)));
            const end = Math.max(-1, Math.min(1, this.labelScale.invert(endX - this.margin.left)));

            console.log("Brush Ended");
            console.log("Start:", start, "End:", end);

            // Check if the transition is initiated by the code to avoid recursion
            if (!this.transitioning) {
                this.transitioning = true;

                this.brushGroup.transition().call(this.brush.move, [this.labelScale(start), this.labelScale(end)])
                    .on("end", () => {
                        this.transitioning = false;
                        this.updateWordLabels(start, end);
                    });
            }
        }
    }

    updateWordLabels(start, end) {
        console.log("Update Word Labels - Start:", start, "End:", end);

        const filteredData = this.data.filter(d => d.sentiment_adjective_1 >= start && d.sentiment_adjective_1 <= end);

        console.log("Filtered Data Length:", filteredData.length);

        const words = filteredData
            .slice(0, 5)
            .map(d => d.adjective_1)
            .filter(adj => adj !== 'N/A');

        console.log("Words:", words);

        // Remove existing word labels
        this.svg.selectAll(".word-label").remove();

        // Append new word labels
        const wordLabels = this.svg.selectAll(".word-label")
            .data(words)
            .enter()
            .append("text")
            .attr("class", "word-label")
            .attr("x", (d, i) => i * 80)
            .attr("y", 40) // Adjust the vertical spacing (20) as needed
            .text(d => d);
    }
}

// Usage
