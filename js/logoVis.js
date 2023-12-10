class LogoVis {
    constructor(parentElement, dataBoth, coordinates, brand) {
        this.parentElement = parentElement;
        this.dataBoth = dataBoth;
        this.brand = brand;
        this.coordinates = coordinates;
        this.displayData = [];
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };

        vis.width =
            document.getElementById(vis.parentElement).getBoundingClientRect().width -
            vis.margin.left -
            vis.margin.right;
        vis.height =
            document.getElementById(vis.parentElement).getBoundingClientRect().height -
            vis.margin.top -
            vis.margin.bottom;

        vis.svg = d3
            .select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svg
            .append("g")
            .attr("class", "title")
            .attr("id", "map-title")
            .attr("transform", `translate (${vis.width / 2}, 20)`)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold");

        vis.viewpoint = { width: 975, height: 610 };
        vis.zoom = vis.width / vis.viewpoint.width;

        // append tooltip within LogoVis
        vis.tooltip = d3
            .select(`#${vis.parentElement}`)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Create a single group for all circles
        vis.circleGroup = vis.svg
            .append("g")
            .attr("class", "circle-group");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // first, filter according to women's products
        this.displayData = this.dataBoth.filter(function (d) {
            return d.brand2 === vis.brand;
        });

        console.log(this.displayData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let pathData = this.coordinates;

        // Create a single group for all paths
        let pathGroup = vis.svg
            .append("g")
            .attr("class", "path-group");

        // Select paths and append them to the path group
        let paths = pathGroup
            .selectAll("path")
            .data(pathData)
            .enter()
            .append("path")
            .attr("d", function (d) {
                return d;
            })
            .attr(
                "transform",
                (d, i) => {
                    const scale = vis.brand === "Adidas" ? 20 : 2.5; // Adjust scale factors as needed
                    return `translate(${vis.margin.left * (vis.brand === "Adidas" ? 5 : 3)}, -5) scale(${scale})`;

                }
            )
            .attr("class", "path")
            .style("fill-opacity", 0);

        // Iterate over paths and append circles to the shared circle group
        paths.each(function (d) {
            if (this instanceof SVGPathElement) {
                let length = this.getTotalLength();
                const scale = (vis.brand === 'Adidas') ? 20 : 2.5;
                const pointSize = (vis.brand === 'Adidas') ? 0.2 : 1.3;

                for (let t = 0; t <= 1; t += 0.01) {
                    let point = this.getPointAtLength(length * t);

                    const color = (vis.brand === 'Adidas') ? 'lightGreen' : 'purple';
                    const dataIndex = Math.floor(t * vis.displayData.length);
                    const productName = vis.displayData[dataIndex].product_name;
                    const salePrice = vis.displayData[dataIndex].sale_price;
                    const productRating = vis.displayData[dataIndex].rating;

                    // Append circles to the shared circle group
                    vis.circleGroup
                        .append("circle")
                        .attr("cx", point.x)
                        .attr("cy", point.y)
                        .attr("r", pointSize) // Adjust the radius here
                        .attr("fill", color)
                        .attr("class", `point ${vis.brand.toLowerCase()}`)
                        .attr("transform", `translate(${vis.margin.left * (vis.brand === "Adidas" ? 5 : 3)}, -5) scale(${scale})`)
                        .on("mouseover", function (event) {
                            const [x, y] = d3.pointer(event);
                            //const [x, y] = [event.clientX, event.clientY];
                            const enlargedRadius = (vis.brand === 'Adidas') ? 0.9 : 5.6;
                            const tooltipContent = `<div class='tooltip-box'>Product: ${productName} <br> Sale price: $${salePrice} <br> Product rating: ${productRating}</div>`;

                            d3.select(this)
                                .transition()
                                .attr("r", enlargedRadius);

                            vis.tooltip
                                .html(tooltipContent)
                                .style("left", `${x}px`)
                                .style("top", `${y}px`)
                                .transition()
                                .duration(100)
                                .style("opacity", 1);
                        })
                        .on("mouseout", function () {
                            const resetRadius = (vis.brand === 'Adidas') ? 0.2 : 1.3;
                            d3.select(this)
                                .transition()
                                .attr("r", resetRadius);
                            vis.tooltip.transition()
                                .duration(100)
                                .style("opacity", 0);
                        });

                }
            } else {
                console.error("Element is not an SVG path:", this);
            }
        });
        vis.svg.node().appendChild(vis.circleGroup.node());
    }
}
