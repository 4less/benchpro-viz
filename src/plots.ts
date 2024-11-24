import * as Plotly from 'plotly.js';
declare var gridjs: any;


function renderGrid(rows: any[]): void {
    const tableDiv = document.getElementById("sample-table");
    if (!tableDiv) {
        console.error('Table container not found');
        return;
    }

    tableDiv.innerHTML = ""; // Clear any previous table

    const columnsToDisplay = ['Name', 'Type', 'PredictionAbundance', 'GoldStdAbundance', 'PredictionCount', 'GoldStdCount'];

    console.log("Rows");
    console.log(rows);

    // Subset the data
    const filteredRows = rows.map((row: any) => {
        const arr = columnsToDisplay.map((column) => row[column]);
        const type = arr[1];
        arr.push(type === 'FN' ? arr[3] : type === 'FP' ? arr[2] : '-');
        arr.push(type === 'TP' ? 'True' : 'False');
        return arr;
    });

    console.log("FilteredRows");
    console.log(filteredRows);

    const columnFormatter = [
        'Name',
        {
            name: 'Type',
            formatter: (cell: string) => {
                return gridjs.h(
                    'b',
                    {
                        style: {
                            color: cell === 'TP' ? 'green' : cell === 'FP' ? 'red' : cell === 'FN' ? 'yellow' : 'black',
                        },
                    },
                    cell
                );
            },
        },
        {
            name: 'PredictionAbundance',
            formatter: (cell: any) => {
                return cell; // Add formatting logic if necessary
            },
        },
        {
            name: 'GoldStdAbundance',
            formatter: (cell: any) => {
                return cell; // Add formatting logic if necessary
            },
        },
        'PredictionCount',
        'GoldStdCount',
        'Abundance',
        'Correct',
    ];

    if (detailed_grid) {
        // Update existing grid instance
        detailed_grid.updateConfig({
            data: filteredRows,
        }).forceRender();
    } else {
        // Create a new Grid.js instance if it doesn't exist
        detailed_grid = new gridjs.Grid({
            columns: columnFormatter,
            style: {
                table: { fontSize: '12px' }, // Reduce font size
                th: { padding: '4px' }, // Reduce header padding
                td: { padding: '4px' }, // Reduce cell padding
            },
            data: filteredRows,
            search: true,
            sort: true,
        });

        detailed_grid.render(tableDiv);
    }
}


// Assuming the structure of `data` and `filters` is defined elsewhere
function renderDetailedTable(data: { points: any[] }, filters: any): void {
    if (data_detailed == null) {
        alert('To load more information for the sample you clicked, provide detailed data');
        return;
    }

    const clickedPoint = data.points[0];
    const tool = clickedPoint.data.name;
    const hovertext = clickedPoint.hovertext;
    const clickedID = clickedPoint.customdata;

    console.log('Clicked id ' + clickedID);

    const filteredDataDetailed = filterDataDetailed(filters);

    console.log(filteredDataDetailed.length);

    // Find the clicked row
    const clickedRow = filteredDataDetailed.filter((d: any) => d.ID === clickedID);

    console.log('Clicked row');
    console.log(clickedRow);

    // Render the table
    renderGrid(clickedRow);

    // Update clicked ID
    const tableDiv = document.getElementById("selected-sample");
    if (tableDiv) {
        tableDiv.innerHTML = `<h3>${clickedID}</h3>`; // Clear any previous table
    }
}

// Function to render the boxplot
export function renderBoxplot(): void {
    console.log("Render Boxplot");
    if (data == null || data.length === 0) return;

    const filters = {
        AllowAlternatives: (document.getElementById("allowAlternatives") as HTMLSelectElement).value,
        Dataset: (document.getElementById("dataset") as HTMLSelectElement).value,
        Taxonomy: getSelectedTaxonomy(),
        Tool: getSelectedTool(),
        Rank: (document.getElementById("rank") as HTMLSelectElement).value,
        Metric: (document.getElementById("metric") as HTMLSelectElement).value,
    };
    console.log('SelectedTools: ' + getSelectedTool());
    console.log(filters);

    const filteredData = filterData(filters);

    const tools = [...new Set(filteredData.map(d => d.Tool))];

    console.log(tools);

    const traces: Partial<Plotly.Data>[] = tools.map((tool: string) => {
        const toolData = filteredData.filter(d => d.Tool === tool);
    
        // Map and filter out undefined values
        const f1Values = toolData
            .map(d => {
                if (filters.Metric == 'F1') {
                    return parseFloat(d.F1);
                } else if (filters.Metric == 'Precision') {
                    return parseFloat(d.Precision);
                } else if (filters.Metric == 'Sensitivity') {
                    return parseFloat(d.Sensitivity);
                }
                return undefined; // Ensure all branches return a value
            })
            .filter((value): value is number => value !== undefined); // Remove undefined values
    
        const ids = toolData.map(d => d.ID);
        const hoverTexts = toolData.map(d => `ID: ${d.ID}<br>Dataset: ${d.Dataset}`);
    
        return {
            y: f1Values,
            customdata: ids,
            name: tool,
            type: "box",
            boxpoints: "all", // Display all points
            jitter: 0.5, // Add horizontal jitter
            pointpos: 0, // Position points around the center of the box
            hovertext: hoverTexts,
            hoverinfo: "y+text",
            marker: {
                color: toolColors[tool],
                size: 6,
                opacity: 0.7,
            },
        };
    });

    const toolsSet = new Set(tools);
    const localToolOrder = toolOrder.filter(item => toolsSet.has(item));

    console.log(traces);
    console.log(localToolOrder);
    console.log(toolsSet);
    Plotly.newPlot("plot", traces, {
        title: filters.Metric + ' Scores by Tool',
        xaxis: {
            title: "Tool",
            categoryorder: 'array', // Make sure x-axis categories follow the given order
            categoryarray: localToolOrder, // Set the order explicitly
        },
        yaxis: { title: "F1 Score" },
    });
    console.log('Where is new plot?');


    var plotDiv: any = document.getElementById('plot');
    plotDiv.on('plotly_click', function(data: { points: any[]; }){
        renderDetailedTable(data, filters);

    }, { passive: true });
}



// Function to render the scatterplot
export function renderScatterplot(): void {
    if (data == null || data.length === 0) return;

    const filters = {
        AllowAlternatives: (document.getElementById("allowAlternatives") as HTMLSelectElement).value,
        Dataset: (document.getElementById("dataset") as HTMLSelectElement).value,
        Taxonomy: getSelectedTaxonomy(),
        Rank: (document.getElementById("rank") as HTMLSelectElement).value,
        Metric: (document.getElementById("metric") as HTMLSelectElement).value,
    };


    const filteredData = filterData(filters);

    // Extracting values for Sensitivity, Precision, and Tool
    const sensitivity = filteredData.map(row => row['Sensitivity']);
    const precision = filteredData.map(row => row['Precision']);
    const tools = filteredData.map(row => row['Tool']);

    // Assign colors based on the tool for each data point
    const colors = tools.map(tool => toolColors[tool]);

    // Unique set of tools for color mapping and legend
    const uniqueTools = [...new Set(tools)];

    console.log(toolColors);
    // Create a trace for each tool
    
    // Create a trace for each tool
    const traces: Partial<Plotly.Data>[] = uniqueTools.map((tool: string) => {
        const toolData = filteredData.filter(row => row['Tool'] === tool);
        const toolSensitivity = toolData.map(row => row['Sensitivity']);
        const toolPrecision = toolData.map(row => row['Precision']);
        const toolF1 = toolData.map(row => row['F1']);
        const ids = toolData.map(d => d.ID);
        const toolDataset = toolData.map(row => row['Dataset']);

        return {
            x: toolSensitivity,
            y: toolPrecision,
            customdata: ids,
            mode: 'markers',
            type: 'scatter',
            name: tool,  // Name for the legend
            marker: {
                color: toolColors[tool],
                size: 8, // Adjust the size of the dots
                opacity: 0.7,  // Set opacity to 70%
                line: { width: 0 } // Remove the outline around the dots
            },
            // Customizing the tooltip to show Dataset, Sensitivity, Precision, and F1
            text: toolData.map((row, index) => {
                return `Dataset: ${toolDataset[index]}<br>Sensitivity: ${toolSensitivity[index]}<br>Precision: ${toolPrecision[index]}<br>F1: ${toolF1[index]}`;
            }), 
            hoverinfo: 'text' // Show the customized text in the tooltip
        };
    });

    // Layout for the scatter plot
    const layout: Partial<Plotly.Layout> = {
        title: 'Sensitivity vs Precision by Tool',
        xaxis: {
            title: {
                text: 'Sensitivity' // `text` should be used to specify the axis title
            },
            zeroline: false,
            gridcolor: '#f2f2f2'
        },
        yaxis: {
            title: {
                text: 'Precision'
            },
            zeroline: false,
            gridcolor: '#f2f2f2'
        },
        showlegend: true,  // Enable the legend
        legend: {
            x: 1,  // Position legend to the right
            y: 1,
            traceorder: 'normal',
            font: {
                size: 12
            },
            bgcolor: 'rgba(255, 255, 255, 0.5)',
            bordercolor: '#ddd',
            borderwidth: 1
        }
    };

    // Create the plot with multiple traces
    Plotly.newPlot('plot', traces, layout);

    var plotDiv: any = document.getElementById('plot');
    plotDiv.on('plotly_click', function(data: { points: any[]; }) {
        renderDetailedTable(data, filters);
    }, { passive: true });
}
