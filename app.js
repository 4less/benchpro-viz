var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
System.register("filter", ["app"], function (exports_1, context_1) {
    "use strict";
    var app_1;
    var __moduleName = context_1 && context_1.id;
    // Function to get the selected taxonomy values
    function getSelectedTaxonomy() {
        const checkboxes = document.querySelectorAll('input[name="taxonomy"]:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }
    exports_1("getSelectedTaxonomy", getSelectedTaxonomy);
    // Function to get the selected taxonomy values
    function getSelectedTool() {
        const checkboxes = document.querySelectorAll('input[name="tool"]:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }
    exports_1("getSelectedTool", getSelectedTool);
    // Function to filter data based on filters
    function filterData(filters) {
        if (!app_1.appData.data) {
            return []; // Return an empty array if data is null or undefined
        }
        return app_1.appData.data.filter(d => {
            return ((!filters.AllowAlternatives || d.AllowAlternatives === filters.AllowAlternatives) &&
                (!filters.Dataset || d.Dataset === filters.Dataset) &&
                (!filters.Taxonomy || filters.Taxonomy.includes(d.Taxonomy)) &&
                (!filters.Tool || filters.Tool.includes(d.Tool)) &&
                (!filters.Rank || d.Rank === filters.Rank));
        });
    }
    exports_1("filterData", filterData);
    // Function to filter detailed data based on filters
    function filterDataDetailed(filters) {
        if (!app_1.appData.data_detailed) {
            return []; // Return an empty array if data is null or undefined
        }
        return app_1.appData.data_detailed.filter(d => {
            return ((!filters.AllowAlternatives || d.AllowAlternatives === filters.AllowAlternatives) &&
                (!filters.Dataset || d.Dataset === filters.Dataset) &&
                (!filters.Taxonomy || filters.Taxonomy.includes(d.Taxonomy)) &&
                (!filters.Tool || filters.Tool.includes(d.Tool)) &&
                (!filters.Rank || d.Rank === filters.Rank));
        });
    }
    exports_1("filterDataDetailed", filterDataDetailed);
    return {
        setters: [
            function (app_1_1) {
                app_1 = app_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("plots", ["plotly.js", "app", "filter"], function (exports_2, context_2) {
    "use strict";
    var Plotly, app_2, filter_1;
    var __moduleName = context_2 && context_2.id;
    function renderGrid(rows) {
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
        const filteredRows = rows.map((row) => {
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
                formatter: (cell) => {
                    return gridjs.h('b', {
                        style: {
                            color: cell === 'TP' ? 'green' : cell === 'FP' ? 'red' : cell === 'FN' ? 'yellow' : 'black',
                        },
                    }, cell);
                },
            },
            {
                name: 'PredictionAbundance',
                formatter: (cell) => {
                    return cell; // Add formatting logic if necessary
                },
            },
            {
                name: 'GoldStdAbundance',
                formatter: (cell) => {
                    return cell; // Add formatting logic if necessary
                },
            },
            'PredictionCount',
            'GoldStdCount',
            'Abundance',
            'Correct',
        ];
        if (app_2.appData.detailed_grid) {
            // Update existing grid instance
            app_2.appData.detailed_grid.updateConfig({
                data: filteredRows,
            }).forceRender();
        }
        else {
            // Create a new Grid.js instance if it doesn't exist
            app_2.appData.detailed_grid = new gridjs.Grid({
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
            app_2.appData.detailed_grid.render(tableDiv);
        }
    }
    // Assuming the structure of `data` and `filters` is defined elsewhere
    function renderDetailedTable(data, filters) {
        if (app_2.appData.data_detailed == null) {
            alert('To load more information for the sample you clicked, provide detailed data');
            return;
        }
        const clickedPoint = data.points[0];
        const tool = clickedPoint.data.name;
        const hovertext = clickedPoint.hovertext;
        const clickedID = clickedPoint.customdata;
        console.log('Clicked id ' + clickedID);
        const filteredDataDetailed = filter_1.filterDataDetailed(filters);
        console.log(filteredDataDetailed.length);
        // Find the clicked row
        const clickedRow = filteredDataDetailed.filter((d) => d.ID === clickedID);
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
    function renderBoxplot() {
        console.log("Render Boxplot");
        if (app_2.appData.data == null || app_2.appData.data.length === 0)
            return;
        const filters = {
            AllowAlternatives: document.getElementById("allowAlternatives").value,
            Dataset: document.getElementById("dataset").value,
            Taxonomy: filter_1.getSelectedTaxonomy(),
            Tool: filter_1.getSelectedTool(),
            Rank: document.getElementById("rank").value,
            Metric: document.getElementById("metric").value,
        };
        console.log('SelectedTools: ' + filter_1.getSelectedTool());
        console.log(filters);
        const filteredData = filter_1.filterData(filters);
        const tools = [...new Set(filteredData.map(d => d.Tool))];
        console.log(tools);
        const traces = tools.map((tool) => {
            const toolData = filteredData.filter(d => d.Tool === tool);
            // Map and filter out undefined values
            const f1Values = toolData
                .map(d => {
                if (filters.Metric == 'F1') {
                    return parseFloat(d.F1);
                }
                else if (filters.Metric == 'Precision') {
                    return parseFloat(d.Precision);
                }
                else if (filters.Metric == 'Sensitivity') {
                    return parseFloat(d.Sensitivity);
                }
                return undefined; // Ensure all branches return a value
            })
                .filter((value) => value !== undefined); // Remove undefined values
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
                    color: app_2.appData.toolColors[tool],
                    size: 6,
                    opacity: 0.7,
                },
            };
        });
        const toolsSet = new Set(tools);
        const localToolOrder = app_2.appData.toolOrder.filter(item => toolsSet.has(item));
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
        var plotDiv = document.getElementById('plot');
        plotDiv.on('plotly_click', function (data) {
            renderDetailedTable(data, filters);
        }, { passive: true });
    }
    exports_2("renderBoxplot", renderBoxplot);
    // Function to render the scatterplot
    function renderScatterplot() {
        if (app_2.appData.data == null || app_2.appData.data.length === 0)
            return;
        const filters = {
            AllowAlternatives: document.getElementById("allowAlternatives").value,
            Dataset: document.getElementById("dataset").value,
            Taxonomy: filter_1.getSelectedTaxonomy(),
            Rank: document.getElementById("rank").value,
            Metric: document.getElementById("metric").value,
        };
        const filteredData = filter_1.filterData(filters);
        // Extracting values for Sensitivity, Precision, and Tool
        const sensitivity = filteredData.map(row => row['Sensitivity']);
        const precision = filteredData.map(row => row['Precision']);
        const tools = filteredData.map(row => row['Tool']);
        // Assign colors based on the tool for each data point
        const colors = tools.map(tool => app_2.appData.toolColors[tool]);
        // Unique set of tools for color mapping and legend
        const uniqueTools = [...new Set(tools)];
        console.log(app_2.appData.toolColors);
        // Create a trace for each tool
        // Create a trace for each tool
        const traces = uniqueTools.map((tool) => {
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
                name: tool, // Name for the legend
                marker: {
                    color: app_2.appData.toolColors[tool],
                    size: 8, // Adjust the size of the dots
                    opacity: 0.7, // Set opacity to 70%
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
        const layout = {
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
            showlegend: true, // Enable the legend
            legend: {
                x: 1, // Position legend to the right
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
        var plotDiv = document.getElementById('plot');
        plotDiv.on('plotly_click', function (data) {
            renderDetailedTable(data, filters);
        }, { passive: true });
    }
    exports_2("renderScatterplot", renderScatterplot);
    return {
        setters: [
            function (Plotly_1) {
                Plotly = Plotly_1;
            },
            function (app_2_1) {
                app_2 = app_2_1;
            },
            function (filter_1_1) {
                filter_1 = filter_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("app", ["plots"], function (exports_3, context_3) {
    "use strict";
    var plots_1, appData, Plots, activePlot, rankOrder;
    var __moduleName = context_3 && context_3.id;
    // Function to generate a color palette
    function generateColorPalette(n) {
        const colors = [];
        for (let i = 0; i < n; i++) {
            const hue = (i * 360 / n) % 360; // Evenly distribute hues
            colors.push(`hsl(${hue}, 70%, 50%)`); // Generate HSL colors
        }
        return colors;
    }
    // Assign colors to tools dynamically
    function assignDynamicToolColors(data) {
        console.log("assignDynamicToolColors");
        const uniqueTools = [...new Set(data.map(row => row.Tool))];
        const colorPalette = generateColorPalette(uniqueTools.length);
        // Map tools to colors
        const toolColors = {};
        uniqueTools.forEach((tool, index) => {
            toolColors[tool] = colorPalette[index];
        });
        return toolColors;
    }
    // Assign colors to tools dynamically
    function assignDynamicToolOrder(data) {
        console.log("assignDynamicToolOrder");
        const uniqueTools = [...new Set(data.map(row => row.Tool))];
        let toolOrder = Array.from(uniqueTools);
        toolOrder.sort((a, b) => a.localeCompare(b));
        return toolOrder;
    }
    // Populate dropdown menus
    function populateDropdown(id, options, addAll = true) {
        const dropdown = document.getElementById(id);
        if (addAll) {
            dropdown.innerHTML = '<option value="">All</option>'; // Default "All" option
        }
        else {
            dropdown.innerHTML = '';
        }
        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            dropdown.appendChild(opt);
        });
    }
    function populateRankDropdown(options) {
        // Filter and sort options based on the fixed order
        const sortedOptions = rankOrder.filter(rank => options.includes(rank));
        const dropdown = document.getElementById("rank");
        dropdown.innerHTML = ""; // Clear any previous options
        sortedOptions.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            dropdown.appendChild(opt);
        });
        // Set default value to "Species" if available
        if (sortedOptions.includes("Species")) {
            dropdown.value = "Species";
        }
    }
    // Populate the taxonomy dropdown with checkboxes
    function populateTaxonomyDropdown(taxonomyOptions) {
        const dropdownMenu = document.getElementById("taxonomy-menu");
        dropdownMenu.innerHTML = ""; // Clear existing content
        taxonomyOptions.forEach(option => {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = option;
            checkbox.checked = true;
            checkbox.name = "taxonomy";
            checkbox.addEventListener('change', renderActivePlot);
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(option));
            dropdownMenu.appendChild(label);
        });
    }
    // Populate the taxonomy dropdown with checkboxes
    function populateToolDropdown(toolOptions) {
        const dropdownMenu = document.getElementById("tool-menu");
        dropdownMenu.innerHTML = ""; // Clear existing content
        toolOptions.forEach(option => {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = option;
            checkbox.checked = true;
            checkbox.name = "tool";
            checkbox.addEventListener('change', renderActivePlot);
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(option));
            dropdownMenu.appendChild(label);
        });
    }
    // Function to read and process the uploaded data
    function readData(content) {
        console.log("ReadData");
        const rows = content.trim().split("\n");
        const columns = rows[0].split("\t");
        appData.data = rows.slice(1).map(row => {
            const values = row.split("\t");
            return columns.reduce((obj, col, i) => {
                obj[col] = values[i];
                return obj;
            }, {}); // Cast empty object to DataRow type
        });
        if (!appData.data) {
            console.log("ReadData null");
            return; // Return an empty array if data is null or undefined
        }
        // Populate dropdowns with unique values
        const dropdowns = {
            AllowAlternatives: [...new Set(appData.data.map(d => d.AllowAlternatives))],
            Dataset: [...new Set(appData.data.map(d => d.Dataset))],
            Taxonomy: [...new Set(appData.data.map(d => d.Taxonomy))],
            Tool: [...new Set(appData.data.map(d => d.Tool))],
            Rank: [...new Set(appData.data.map(d => d.Rank))],
        };
        populateDropdown("metric", ['F1', 'Sensitivity', 'Precision'], false);
        populateDropdown("allowAlternatives", dropdowns.AllowAlternatives, false);
        populateDropdown("dataset", dropdowns.Dataset);
        populateTaxonomyDropdown(dropdowns.Taxonomy);
        populateToolDropdown(dropdowns.Tool);
        populateRankDropdown(dropdowns.Rank);
        // Assign dynamic colors to tools
        appData.toolColors = assignDynamicToolColors(appData.data);
        appData.toolOrder = assignDynamicToolOrder(appData.data);
        console.log(appData.toolOrder);
        // Update the plot with the uploaded data
        renderActivePlot();
    }
    function readDataDetailed(content) {
        const rows = content.trim().split("\n");
        const columns = rows[0].split("\t");
        appData.data_detailed = rows.slice(1).map(row => {
            const values = row.split("\t");
            return columns.reduce((obj, col, i) => {
                obj[col] = values[i];
                return obj;
            }, {}); // Cast empty object to DataRow type
        });
        // Update the plot with the uploaded data
        renderActivePlot();
    }
    // Render the active plot based on selection
    function renderActivePlot() {
        if (activePlot === 'Boxplot') {
            plots_1.renderBoxplot();
        }
        else if (activePlot === 'Scatterplot') {
            plots_1.renderScatterplot();
        }
    }
    function switchPanel(panel) {
        if (panel != "upload" && appData.data == null) {
            alert('Please upload or select data first');
        }
        else {
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.getElementById(panel + '-panel').classList.add('active');
        }
    }
    return {
        setters: [
            function (plots_1_1) {
                plots_1 = plots_1_1;
            }
        ],
        execute: function () {
            console.log('App is running');
            exports_3("appData", appData = {
                data: null,
                data_detailed: null,
                detailed_grid: null,
                toolColors: {},
                toolOrder: [],
            });
            // export let data: any[] | null = null;  // Allow null as an initial value
            // export let data_detailed: any[] | null = null;  // Allow null as an initial value
            // export let detailed_grid: any; // Declare a variable to store the Grid.js instance
            Plots = ["Boxplot", "Scatterplot"];
            exports_3("activePlot", activePlot = 'Boxplot');
            rankOrder = [
                "Strain", "Species", "Genus", "Family", "Order",
                "Class", "Phylum", "Superkingdom"
            ];
            // Parse uploaded TSV file
            document.getElementById("file-uploaded-data-detailed").addEventListener("change", function (event) {
                return __awaiter(this, void 0, void 0, function* () {
                    const input = event.target;
                    const file = input.files ? input.files[0] : null;
                    if (!file)
                        return;
                    const content = yield file.text();
                    readDataDetailed(content);
                });
            }, { passive: true });
            // Parse uploaded TSV file
            document.getElementById("file-uploaded-data").addEventListener("change", function (event) {
                return __awaiter(this, void 0, void 0, function* () {
                    const input = event.target;
                    const file = input.files ? input.files[0] : null;
                    if (!file)
                        return;
                    const content = yield file.text();
                    readData(content);
                });
            }, { passive: true });
            // Handle plot selection and rendering
            document.getElementById("prof-per-metric-link").addEventListener('change', (event) => {
                exports_3("activePlot", activePlot = 'Boxplot');
                renderActivePlot();
            });
            // Handle plot selection and rendering
            document.getElementById("prof-scatterplot-link").addEventListener('change', (event) => {
                exports_3("activePlot", activePlot = 'Scatterplot');
                renderActivePlot();
            });
            // Attach event listeners to dropdowns
            document.querySelectorAll("select").forEach(dropdown => {
                dropdown.addEventListener("change", renderActivePlot, { passive: true });
            });
            // // Navbar functionality
            document.getElementById('data-link').addEventListener('click', function () {
                switchPanel('upload');
            }, { passive: true });
            document.getElementById('prof-per-metric-link').addEventListener('click', function () {
                exports_3("activePlot", activePlot = 'Boxplot');
                switchPanel('plot');
                console.log('Switch to plot panel yeah');
                renderActivePlot();
            });
            document.getElementById('prof-scatterplot-link').addEventListener('click', function () {
                exports_3("activePlot", activePlot = 'Scatterplot');
                switchPanel('plot');
                renderActivePlot();
            }, { passive: true });
        }
    };
});
