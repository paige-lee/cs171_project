class FilterableTable {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data;
        this.filteredData = data;

        this.initTable();
        this.updateTable();
    }

    initTable() {
        this.tableContainer = d3.select(`#${this.containerId}`)
            .append('div')
            .classed('tableFixHead', true) // Apply the class to the container
            .style('overflow', 'auto')
            .style('max-height', '70vh');

        // Create a container for the header and dropdown
        this.headerContainer = this.tableContainer.append('div').style('display', 'flex').style('flex-direction', 'column');

        // Create a select element for filtering
        this.filterSelect = this.headerContainer.append('select')
            .style('margin', '10px 0')
            .style('position', 'sticky')  // Set the position to sticky
            .style('top', '0')  // Adjust the top position
            .style('z-index', '1')  // Ensure it's above the table
            .on('change', () => this.filterTable());

        // Add an "All" option to the select element
        this.filterSelect.append('option')
            .attr('value', 'all')
            .text('All');

        // Populate the select element with unique items from 'adjective_1'
        const uniqueAdjectives = [...new Set(this.data.map(item => item.adjective_1))];
        this.filterSelect.selectAll('option')
            .data(uniqueAdjectives)
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);

        this.table = this.tableContainer.append('table')
            .style('width', '100%')
            .style('border-collapse', 'collapse')
            .style('margin', 'auto');

        this.thead = this.table.append('thead');
        this.tbody = this.table.append('tbody');

        // Change column names
        this.columns = ['product_name', 'adjective_1', 'adjective_1_sentiment', 'brand2', 'rating', 'listing_price'];
        const columnNames = ['Product Name', 'Adjective', 'Adjective Sentiment', 'Brand', 'Rating', 'Listing Price'];

        this.thead.append('tr')
            .selectAll('th')
            .data(this.columns)
            .enter()
            .append('th')
            .text((_, i) => columnNames[i]) // Use the corresponding name from columnNames
            .style('border', '1px solid #ddd')
            .style('padding', '8px')
            .style('text-align', 'left')
            .style('background-color', 'azure')
            .on('click', column => this.sortTable(column));

        this.tableContainer.style('overflow', 'auto');
        this.tableContainer.style('max-height', '70vh');

        this.updateTable();
    }

    updateTable() {
        // Clear previous rows
        this.tbody.selectAll('*').remove();

        // Add a row for each item in filteredData
        const rows = this.tbody.selectAll('tr:not(:first-child)') // Exclude the empty row
            .data(this.filteredData)
            .enter()
            .append('tr')
            .on('mouseover', (event, d) => {
                d3.select(event.currentTarget).style('background-color', d && d.brand2 && d.brand2.toLowerCase() === 'adidas' ? 'lightgreen' :
                    d && d.brand2 && d.brand2.toLowerCase() === 'nike' ? 'thistle' :
                        'transparent');
            })
            .on('mouseout', (event, d) => {
                d3.select(event.currentTarget).style('background-color', 'transparent');
            });

        // Add cells for each column in each row
        const cells = rows.selectAll('td')
            .data(row => this.columns.map(column => row[column]))
            .enter()
            .append('td')
            .style('border', '1px solid #ddd')
            .style('padding', '8px')
            .style('text-align', 'left')
            .text(d => d);

        // Restyle the tableContainer
        this.tableContainer
            .style('overflow', 'auto')
            .style('max-height', '70vh');

        // Ensure the headerContainer is positioned at the top
        this.headerContainer.style('position', 'sticky')
            .style('top', '0')
            .style('z-index', '1');
    }

    filterTable() {
        const selectedValue = this.filterSelect.node().value.toLowerCase();
        this.filteredData = (selectedValue === 'all') ?
            this.data :
            this.data.filter(item => item.adjective_1.toLowerCase() === selectedValue);

        this.updateTable();
    }

    sortTable(column) {
        this.filteredData.sort((a, b) => {
            if (typeof a[column] === 'string') {
                return a[column].localeCompare(b[column]);
            } else {
                return a[column] - b[column];
            }
        });

        this.updateTable();
    }
}
