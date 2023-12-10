/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

document.addEventListener('DOMContentLoaded', function() {
    // Get the audio element and play button
    const audio = document.getElementById('backgroundAudio');
    const playButton = document.getElementById('playButton');
    audio.currentTime = 21;

    // Add a click event listener to the button
    playButton.addEventListener('click', function() {
        // Check if the audio is paused, and play it if it is
        if (audio.paused) {
            audio.play();
        } else {
            // Pause the audio if it is already playing
            audio.pause();
        }
    });
});

// init global variables & switches
let myNikeVis,
    myAdidasVis,
    myNikeBubbleVis,
    myAdidasBubbleVis,
    myNikeTreemapVis,
    myAdidasTreemapVis,
    myFilterableTable,
    myBrushScale,
    myNikeHistogram,
    myAdidasHistogram,
    myRatingLineChart,
    myPriceLineChart,
    mybarchartVis;
let selectedRange = []
let selectedBrand;


// load data using promises
let promises = [
    d3.csv("data/adidas_nike.csv"),
    d3.csv("data/adidas.csv"),
    d3.csv("data/nike.csv"),
    d3.csv("data/adidas_sentiment_data_with_adjectives.csv"),
    d3.csv("data/adidas_nike_sentiment_data_with_adjectives.csv")
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log("Catch Block from Main.js  "  ,err)
    });

// initMainPage
function initMainPage(dataArray) {

    // log data
    console.log('check out the data', dataArray);

    // init Adidas symbol
    myAdidasVis = new LogoVis('adidasDiv', dataArray[0], [
        "M1.32952 19L0.731445 17.9641L5.06157 15.4641L7.10302 19H1.32952Z",
        "M15.1859 19H9.41243L5.79362 12.7321L10.1237 10.2321L15.1859 19Z",
        "M23.2688 19H17.4953L10.8558 7.5L15.1859 5L23.2688 19Z"
    ], 'Adidas');

    // init Nike symbol
    myNikeVis = new LogoVis('nikeDiv', dataArray[0], [
         "M42.741 71.477c-9.881 11.604-19.355 25.994-19.45 36.75-.037 4.047 1.255 7.58 4.354 10.256 4.46 3.854 9.374 5.213 14.264 5.221 7.146.01 14.242-2.873 19.798-5.096 9.357-3.742 112.79-48.659 112.79-48.659.998-.5.811-1.123-.438-.812-.504.126-112.603 30.505-112.603 30.505a24.771 24.771 0 0 1-6.524.934c-8.615.051-16.281-4.731-16.219-14.808.024-3.943 1.231-8.698 4.028-14.291z"
     ], 'Nike');
    dataBoth = dataArray[0]; // THIS LINE MUST BE PLACED RIGHT HERE, DON'T MOVE IT

    // init Overall bar chart for sentiment analysis
    mybarchartVis = new barchartVis('barchartDiv', dataArray[4]);

    // init Nike packed bubble chart
    myNikeBubbleVis = new BubbleVis('bubbleDivNike', dataArray[4], 'Nike');

    // init Adidas packed bubble chart
    myAdidasBubbleVis = new BubbleVis('bubbleDivAdidas', dataArray[4], 'Adidas');

    // init Nike treemap
    myNikeTreemapVis = new TreemapVis('treemapDivNike', dataArray[4], 'Nike');

    // init Adidas treemap
    myAdidasTreemapVis = new TreemapVis('treemapDivAdidas', dataArray[4], 'Adidas');

    // init table
    myFilterableTable = new FilterableTable('table-container', dataArray[4]);

    // init brush
    myBrushScale = new BrushVis("brushable-scale-container");

    // init Nike histogram
    myNikeHistogram = new Histogram("nikeHistogram", dataArray[4], 'Nike');

    // init Adidas histogram
    myAdidasHistogram = new Histogram("adidasHistogram", dataArray[4], 'Adidas');

    // init line charts
    myRatingLineChart = new DualLineChart("rating-line-chart", dataArray[4], 'rating', "Average rating");
    myPriceLineChart = new DualLineChart("price-line-chart", dataArray[4], 'listing_price', "Average lising price");
}

document.getElementById('shuffleButton').addEventListener('click', function () {
    // Shuffle the data randomly
    dataBoth = shuffleArray(dataBoth);

    // Call wrangleData with the shuffled data after a delay
    setTimeout(function () {
        myAdidasVis.wrangleData();
        myNikeVis.wrangleData();
    }, 0); // Adjust the delay time as needed

    // Update Adidas SVG container with temporary color and text
    const adidasContainer = d3.select("#adidasDiv");
    updateContainerWithTemporaryText(adidasContainer, "Adidas", "rgba(144, 238, 144, 0.7)");
    addTemporaryText(adidasContainer, "Adidas");

    // Update Nike SVG container with temporary color and text
    const nikeContainer = d3.select("#nikeDiv");
    updateContainerWithTemporaryText(nikeContainer, "Nike", "rgba(128, 0, 128, 0.6)");
    addTemporaryText(nikeContainer, "Nike");
});

// Function to update an SVG container with temporary color and text
function updateContainerWithTemporaryText(svgContainer, brand, color) {
    // Set temporary color
    svgContainer.transition()
        .duration(600)
        .style("background-color", color)
        .on("end", function () {
            // After the transition, change back to the original color
            svgContainer.transition()
                .duration(600)
                .style("background-color", "transparent"); // Set to null to remove the temporary color


        });
}

// Function to add temporary text to an SVG container
function addTemporaryText(svgContainer, brand) {
    // Add a text element to the SVG
    let textElement = svgContainer
        .append("text")
        .attr("x", 300)
        .attr("y", 300)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-size", "24px")
        .style("fill", "white")
        .text("Shuffling...");

    // Use a transition to control the visibility
    textElement
        .transition()
        .duration(1800) // Adjust the duration as needed
        .style("opacity", 0)
        .on("end", function () {
            // Remove the text element when the transition is complete
            d3.select(this).remove();
        });
}


function shuffleArray(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

document.addEventListener("DOMContentLoaded", function () {
    const parallaxSections = document.querySelectorAll(".parallax-section");

    window.addEventListener("scroll", function () {
        const windowHeight = window.innerHeight;
        const documentHeight = document.body.clientHeight;

        parallaxSections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const translateY = Math.max(0, (windowHeight / 2 - rect.top) * 0.5);
            section.style.transform = `translate3d(0, ${translateY}px, 0)`;
        });
    });

    // Adjust the height of the body to ensure scrolling is possible
    document.body.style.height = document.body.scrollHeight + "px";
});












