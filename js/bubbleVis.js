class BubbleVis {
    constructor(containerId, data, brand) {
        this.containerId = containerId;
        this.data = data;
        this.brand = brand;
        this.processedData = [];

        this.initTooltip();

        this.initVis();
    }

    initTooltip() {
        this.tooltip = d3.select(`#${this.containerId}`)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("text-align", "center")
            .style("font", "16px sans-serif")
            .style("border", "1px solid darkgray") // Add this line for the border
            .style("padding", "5px") // Add this line for padding
            .style("background-color", "azure")
            .style("color", "#333")
            .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.1)")
            .style("pointer-events", "none"); // Remove pointer-events here
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };

        vis.width =
            document.getElementById(vis.containerId).getBoundingClientRect().width -
            vis.margin.left -
            vis.margin.right;
        vis.height =
            document.getElementById(vis.containerId).getBoundingClientRect().height -
            vis.margin.top -
            vis.margin.bottom;

        this.svg = d3.select(`#${this.containerId}`)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.wrangleData();
    }

    wrangleData() {
        let filteredData = this.data.filter(d =>
            d.adjective_1 !== undefined &&  // check for undefined
            d.adjective_1 !== '' && // check for empty string
            d.adjective_1 !== 'N/A' &&
            d.adjective_1 !== '-' &&
            d.adjective_1 !== 'X' &&
            d.adjective_1 !== 'TRUE' &&
            d.brand2 === this.brand
        );

        // Convert adjectives to lowercase
        filteredData.forEach(d => {
            d.adjective_1 = d.adjective_1.toLowerCase();
        });

        let groupedData = d3.group(filteredData, d => d.adjective_1);
        this.processedData = Array.from(groupedData, ([adjective, values]) => {
            const averageRating = d3.mean(values, d => +d.rating);
            const averageListingPrice = d3.mean(values, d => +d.listing_price);
            return { adjective, averageRating, averageListingPrice };
        });

        this.updateVis(this.processedData);
        console.log(this.processedData);
    }


    updateVis(data) {
        let vis = this;

        const colorScale = d3.scaleSequential()
            .domain([d3.min(data, d => d.averageRating), d3.max(data, d => d.averageRating)])
            .interpolator(d3.interpolateViridis);

        const pack = data => d3.pack()
            .size([this.width, this.height])
            .padding(5)
            (d3.hierarchy({ children: data })
                .sum(d => d.averageListingPrice));

        const root = pack(data);

        const bubbles = this.svg.selectAll(".bubble")
            .data(root.descendants())
            .join("circle")
            .attr("class", "bubble")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.r)
            .attr("fill", d => (d.parent ? colorScale(d.data.averageRating) : "transparent"))
            .on("mouseover", function (event, d) {
                // Check if the current circle is not the root (background circle)
                if (d.parent) {
                    d3.select(this).attr("r", d.r * 1.7);

                    const [x, y] = d3.pointer(event);

                    vis.tooltip.transition()
                        .duration(10)
                        .style("opacity", 1);
                    vis.tooltip.html(`Adjective: ${d.data.adjective}<br/>Average Rating: ${parseFloat(d.data.averageRating).toFixed(2)}<br/>Average Listing Price: $${parseFloat(d.data.averageListingPrice).toFixed(2)}`)
                        .style("left", `${x}px`)
                        .style("top", `${y}px`);
                }
            })
            .on("mouseout", function (event, d) {
                d3.select(this).attr("r", d.r);

                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

}
