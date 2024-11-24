import { appData } from "./app";

// Function to get the selected taxonomy values
export function getSelectedTaxonomy(): string[] {
    const checkboxes = document.querySelectorAll('input[name="taxonomy"]:checked') as NodeListOf<HTMLInputElement>;
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}
// Function to get the selected taxonomy values
export function getSelectedTool(): string[] {
    const checkboxes = document.querySelectorAll('input[name="tool"]:checked') as NodeListOf<HTMLInputElement>;
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}


// Function to filter data based on filters
export function filterData(filters: any): any[] {
    if (!appData.data) {
        return []; // Return an empty array if data is null or undefined
    }

    return appData.data.filter(d => {
        return (
            (!filters.AllowAlternatives || d.AllowAlternatives === filters.AllowAlternatives) &&
            (!filters.Dataset || d.Dataset === filters.Dataset) &&
            (!filters.Taxonomy || filters.Taxonomy.includes(d.Taxonomy)) &&
            (!filters.Tool || filters.Tool.includes(d.Tool)) &&
            (!filters.Rank || d.Rank === filters.Rank)
        );
    });
}

// Function to filter detailed data based on filters
export function filterDataDetailed(filters: any): any[] {
    if (!appData.data_detailed) {
        return []; // Return an empty array if data is null or undefined
    }

    return appData.data_detailed.filter(d => {
        return (
            (!filters.AllowAlternatives || d.AllowAlternatives === filters.AllowAlternatives) &&
            (!filters.Dataset || d.Dataset === filters.Dataset) &&
            (!filters.Taxonomy || filters.Taxonomy.includes(d.Taxonomy)) &&
            (!filters.Tool || filters.Tool.includes(d.Tool)) &&
            (!filters.Rank || d.Rank === filters.Rank)
        );
    });
}
