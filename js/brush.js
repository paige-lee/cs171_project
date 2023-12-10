class BrushVis {
    constructor(containerId) {
        this.containerId = containerId;
        this.margin = { top: 20, right: 30, bottom: 30, left: 40 };
        this.width = document.getElementById(this.containerId).getBoundingClientRect().width - this.margin.left - this.margin.right;
        this.height = document.getElementById(this.containerId).getBoundingClientRect().height - this.margin.top - this.margin.bottom;

        this.initScale();
        this.initBrush();
        this.drawScale();
    }

    initScale() {
        let viz =this;
        viz.xScale = d3.scaleLinear()
            //this.xScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([0, this.width])
            .clamp(true);
    }

    initBrush() {
        let viz = this;
        viz.brush = d3.brushX()
            .extent([[0, 0], [this.width, this.height]])
            .on("brush end", function (event) {
                selectedRange = [viz.xScale.invert(event.selection[0]), viz.xScale.invert(event.selection[1])];
                console.log('selection', selectedRange);

                // Redraw both histograms
                myNikeHistogram.wrangleData();
                myAdidasHistogram.wrangleData();
            });
    }


    drawScale() {
        const svg = d3.select(`#${this.containerId}`)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // Use a different color scale (e.g., interpolateViridis)
        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([-1, 1]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (this.height / 2 + 10) + ")")
            .call(d3.axisBottom(this.xScale).ticks(5));

        svg.append("linearGradient")
            .attr("id", "scaleGradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", this.height / 2)
            .attr("x2", this.width).attr("y2", this.height / 2)
            .selectAll("stop")
            .data([
                { offset: "0%", color: colorScale(-1) },
                { offset: "50%", color: colorScale(0) },
                { offset: "100%", color: colorScale(1) }
            ])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        svg.append("rect")
            .attr("width", this.width)
            .attr("height", 15)
            .style("fill", "url(#scaleGradient)")
            .attr("transform", "translate(0," + (this.height / 2 - 5) + ")");

        svg.append("g")
            .attr("class", "brush")
            .call(this.brush);

        // Check for an active brush during initialization
        const initialSelection = d3.brushSelection(this.brush);
        if (initialSelection) {
            const initialBrushedValues = d3.extent(initialSelection.map(this.xScale.invert));
            console.log('Initial Brushed Values:', initialBrushedValues);
        }
    }


    brushed(event) {
        let viz = this;

        //const selection = d3.brushSelection(this.brush);
        const selectedRange = [viz.xScale.invert(event.selection[0]),viz.xScale.invert(event.selection[1])]
        console.log('selection', selectedRange);
        // // if (selection) {
        //      // Map the brush selection to the scale domain
        //     / const brushedValues = selection.map(this.xScale.invert);
        //   //   console.log('Brushed Values:', brushedValues);
        //  }
    }
}

