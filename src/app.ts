import { renderBoxplot, renderScatterplot } from "./plots";

console.log('App is running');

export let appData = {
    data: null as any[] | null,
    data_detailed: null as any[] | null,
    detailed_grid: null as any | null,
    toolColors: {} as Record<string, string>,
    toolOrder: [] as string[],
};


// export let data: any[] | null = null;  // Allow null as an initial value
// export let data_detailed: any[] | null = null;  // Allow null as an initial value
// export let detailed_grid: any; // Declare a variable to store the Grid.js instance

const Plots = ["Boxplot", "Scatterplot"];
export let activePlot = 'Boxplot';

const rankOrder = [
    "Strain", "Species", "Genus", "Family", "Order",
    "Class", "Phylum", "Superkingdom"
];

// Function to generate a color palette
function generateColorPalette(n: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < n; i++) {
        const hue = (i * 360 / n) % 360; // Evenly distribute hues
        colors.push(`hsl(${hue}, 70%, 50%)`); // Generate HSL colors
    }
    return colors;
}

// Assign colors to tools dynamically
function assignDynamicToolColors(data: any[]): Record<string, string> {
    console.log("assignDynamicToolColors");
    const uniqueTools = [...new Set(data.map(row => row.Tool))];
    const colorPalette = generateColorPalette(uniqueTools.length);

    // Map tools to colors
    const toolColors: Record<string, string> = {};
    uniqueTools.forEach((tool, index) => {
        toolColors[tool] = colorPalette[index];
    });

    return toolColors;
}

// Assign colors to tools dynamically
function assignDynamicToolOrder(data: any[]): string[] {
    console.log("assignDynamicToolOrder");
    const uniqueTools = [...new Set(data.map(row => row.Tool))];
    let toolOrder = Array.from(uniqueTools);
    toolOrder.sort((a, b) => a.localeCompare(b));

    return toolOrder;
}

// Populate dropdown menus
function populateDropdown(id: string, options: string[], addAll: boolean = true): void {
    const dropdown = document.getElementById(id) as HTMLSelectElement;
    if (addAll) {
        dropdown.innerHTML = '<option value="">All</option>'; // Default "All" option
    } else {
        dropdown.innerHTML = '';
    }
    options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        dropdown.appendChild(opt);
    });
}

function populateRankDropdown(options: string[]): void {
    // Filter and sort options based on the fixed order
    const sortedOptions = rankOrder.filter(rank => options.includes(rank));

    const dropdown = document.getElementById("rank") as HTMLSelectElement;
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
function populateTaxonomyDropdown(taxonomyOptions: string[]): void {
    const dropdownMenu = document.getElementById("taxonomy-menu") as HTMLElement;
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
function populateToolDropdown(toolOptions: string[]): void {
    const dropdownMenu = document.getElementById("tool-menu") as HTMLElement;
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

// Parse uploaded TSV file
document.getElementById("file-uploaded-data-detailed")!.addEventListener("change", async function (event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    if (!file) return;

    const content = await file.text();
    readDataDetailed(content);
}, { passive: true });

// Parse uploaded TSV file
document.getElementById("file-uploaded-data")!.addEventListener("change", async function (event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    if (!file) return;

    const content = await file.text();
    readData(content);
}, { passive: true });


interface DataRow {
    [key: string]: string;
}

// Function to read and process the uploaded data
function readData(content: string): void {
    console.log("ReadData");
    const rows = content.trim().split("\n");
    const columns = rows[0].split("\t");
    appData.data = rows.slice(1).map(row => {
        const values = row.split("\t");
        return columns.reduce((obj: DataRow, col, i) => {
            obj[col] = values[i];
            return obj;
        }, {} as DataRow); // Cast empty object to DataRow type
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

function readDataDetailed(content: string): void {
    const rows = content.trim().split("\n");
    const columns = rows[0].split("\t");
    appData.data_detailed = rows.slice(1).map(row => {
        const values = row.split("\t");
        return columns.reduce((obj: DataRow, col, i) => {
            obj[col] = values[i];
            return obj;
        }, {} as DataRow); // Cast empty object to DataRow type
    });
    // Update the plot with the uploaded data
    renderActivePlot();
}


// Handle plot selection and rendering
document.getElementById("prof-per-metric-link")!.addEventListener('change', (event) => {
    activePlot = 'Boxplot';
    renderActivePlot();
});

// Handle plot selection and rendering
document.getElementById("prof-scatterplot-link")!.addEventListener('change', (event) => {
    activePlot = 'Scatterplot';
    renderActivePlot();
});

// Render the active plot based on selection
function renderActivePlot(): void {
    if (activePlot === 'Boxplot') {
        renderBoxplot();
    } else if (activePlot === 'Scatterplot') {
        renderScatterplot();
    }
}

// Attach event listeners to dropdowns
document.querySelectorAll("select")!.forEach(dropdown => {
    dropdown.addEventListener("change", renderActivePlot, { passive: true });
});

// // Navbar functionality
document.getElementById('data-link')!.addEventListener('click', function () {
    switchPanel('upload');
}, { passive: true });
document.getElementById('prof-per-metric-link')!.addEventListener('click', function () {
    activePlot = 'Boxplot';
    switchPanel('plot');
    console.log('Switch to plot panel yeah');
    renderActivePlot();
});
document.getElementById('prof-scatterplot-link')!.addEventListener('click', function () {
    activePlot = 'Scatterplot';
    switchPanel('plot');
    renderActivePlot();
}, { passive: true });


function switchPanel(panel: string) {
    if (panel != "upload" && appData.data == null) {
        alert('Please upload or select data first');
    } else {
        document.querySelectorAll('.panel')!.forEach(p => p.classList.remove('active'));
        document.getElementById(panel + '-panel')!.classList.add('active');
    }
}
