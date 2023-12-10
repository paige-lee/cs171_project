// treemapVis.js

class TreemapVis {
    constructor(containerId, data, brand) {
        this.containerId = containerId;
        this.data = data;
        this.brand = brand;
        this.processedData = [];

        console.log(this.data);
        this.initTooltip();
        this.initVis();
    }

    initTooltip() {
        this.tooltip = d3.select(`#${this.containerId}`)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
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

        // Create the chart container
        this.svg = d3.select(`#${this.containerId}`)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        // Call the wrangleData function
        this.wrangleData();
    }

    wrangleData() {
        // Filter data by brand
        let filteredData = this.data.filter(d => d.brand2 === this.brand && d.adjective_1 !== 'NaN')
            .map(d => ({
                ...d,
                adjective_1_sentiment: parseFloat(d.adjective_1_sentiment).toFixed(2)
            }));

        // Group filtered data by the adjective and calculate average values
        let groupedData = d3.group(filteredData, d => d.adjective_1_sentiment);
        this.processedData = Array.from(groupedData, ([adjective, values]) => {
            const averageRating = d3.mean(values, d => +d.rating);
            const averageListingPrice = d3.mean(values, d => +d.listing_price);
            return { adjective, averageRating, averageListingPrice };
        });

        console.log(this.processedData);

        // Call the updateVis function with the processed data
        this.updateVis(this.processedData);
    }



    updateVis(data) {
        let vis = this;

        // Create color scale
        const colorScale = d3.scaleSequential()
            .domain([d3.min(data, d => d.averageRating), d3.max(data, d => d.averageRating)])
            .interpolator(d3.interpolateViridis);

        // Create a treemap layout
        const treemap = d3.treemap()
            .size([this.width, this.height])
            .padding(1)
            .round(true)
            .paddingOuter(5);

        // Generate the treemap
        const root = d3.hierarchy({ children: data })
            .sum(d => d.averageListingPrice)
            .sort((a, b) => b.value - a.value);

        treemap(root);

        // Select and update treemap cells
        const cells = this.svg.selectAll("g.cell")
            .data(root.leaves())
            .join("g")
            .attr("class", "cell");

        // Append rectangles for each cell
        cells.append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => colorScale(d.data.averageRating))
            .attr("fill-opacity", 0.7)
            .on("mouseover", function (event, d) {
                // Change the outline color and width on mouseover
                d3.select(this)
                    .attr("stroke", "black") // Change the outline color on mouseover
                    .attr("stroke-width", 2); // Change the outline width on mouseover

                // Show tooltip for treemap
                const [x, y] = d3.pointer(event);
                vis.tooltip.transition()
                    .duration(10)
                    .style("opacity", 1);
                vis.tooltip.html(`<div class='tooltip-box'>Adjective: ${d.data.adjective} <br> Average Rating: ${parseFloat(d.data.averageRating).toFixed(2)} <br> Average Listing Price: $${parseFloat(d.data.averageListingPrice).toFixed(2)}</div>`)
                    .style("left", `${x}px`)
                    .style("top", `${y}px`);
            })
            .on("mouseout", function (event, d) {
                // Restore the original outline color and width on mouseout
                d3.select(this)
                    .attr("stroke", "transparent") // Restore the original outline color on mouseout
                    .attr("stroke-width", 0); // Restore the original outline width on mouseout

                // Hide tooltip for treemap
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Append text labels for each cell
        cells.append("text")
            .attr("x", d => d.x0 + 3)
            .attr("y", d => d.y0 + 12)
            .text(d => d.data.adjective)
            .style("font-size", "10px")
            .style("fill", "white");

        // Add any additional styling or interaction as needed
    }

}
