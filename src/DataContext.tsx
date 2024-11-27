import React, { createContext, useState, useContext, ReactNode } from 'react';



export type Filter = {
  allowAlternatives: string,
  dataset: string,
  taxonomies: string[],
  tools: string[],
  rank: string,
  metric: string,
}

export const rankOrder = [
  "Strain", "Species", "Genus", "Family", "Order",
  "Class", "Phylum", "Superkingdom"
];

// Define the context type
type DataContextType = {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;

  selectedDetailedFile: File | null;
  setSelectedDetailedFile: (file: File | null) => void;

  data: any[] | null;
  setData: (data: any[] | null) => void;

  dataDetailed: any[] | null;
  setDataDetailed: (data: any[] | null) => void;

  filter: Filter | null;
  setFilter: (filter: Filter | null) => void;
  updateFilter: (key: string, values: string | string[]) => void;

  toolColors: Record<string, string> | null;
  setToolColors: (tc: Record<string, string> | null) => void;

  toolOrder: string[] | null;
  setToolOrder: (tc: string[] | null) => void;

  // dropdownOptions: Record<string, string[]> | null;
  dropdownOptions: Record<string, string[]>;
  setDropdownOptions: (tc: Record<string, string[]>) => void;
  updateDropdownOptions: (key: string, values: string[]) => void;

};

// Function to filter data based on filters
export function filterData(data: DataRow[] | null, filters: any): any[] {
  if (!data) {
    return []; // Return an empty array if data is null or undefined
  }

  return data.filter(d => {
    return (
      (!filters.AllowAlternatives || d.AllowAlternatives === filters.AllowAlternatives) &&
      (!filters.Dataset || filters.Dataset === "All" || d.Dataset === filters.Dataset) &&
      (!filters.Taxonomy || filters.Taxonomy.includes(d.Taxonomy)) &&
      (!filters.Tool || filters.Tool.includes(d.Tool)) &&
      (!filters.Rank || d.Rank === filters.Rank)
    );
  });
}

// Function to filter data based on filters
export function filterData2(data: DataRow[] | null, filter: Filter): any[] {
  if (!data) {
    return []; // Return an empty array if data is null or undefined
  }

  return data.filter(d => {
    return (
      (!filter.allowAlternatives || d.AllowAlternatives === filter.allowAlternatives) &&
      (!filter.dataset || filter.dataset === "All" || d.Dataset === filter.dataset) &&
      (!filter.taxonomies || filter.taxonomies.includes(d.Taxonomy)) &&
      (!filter.tools || filter.tools.includes(d.Tool)) &&
      (!filter.rank || d.Rank === filter.rank)
    );
  });
}


// // Function to filter data based on filters
// export function filterDataDetailed(data: DataRow[] | null, filter: Filter): any[] {
//   if (!data) {
//     return []; // Return an empty array if data is null or undefined
//   }

//   return data.filter(d => {
//     return (
//       (!filter.allowAlternatives || d.AllowAlternatives === filter.allowAlternatives) &&
//       (!filter.dataset || filter.dataset === "All" || d.Dataset === filter.dataset) &&
//       (!filter.taxonomies || filter.taxonomies.includes(d.Taxonomy)) &&
//       (!filter.tools || filter.tools.includes(d.Tool)) &&
//       (!filter.rank || d.Rank === filter.rank)
//     );
//   });
// }

// Create the context with a default value
const DataContext = createContext<DataContextType | null>(null);

// Provider component to supply context to children
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const default_filter = {
    allowAlternatives: "",
    dataset: "",
    taxonomies: [],
    tools: [],
    rank: "",
    metric: "",
  }  as Filter;

  // State variables that will be shared across the app
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDetailedFile, setSelectedDetailedFile] = useState<File | null>(null);
  const [data, setData] = useState<any[] | null>(null);
  const [filter, setFilter] = useState<Filter | null>(default_filter);
  const [dataDetailed, setDataDetailed] = useState<any[] | null>(null);
  const [toolColors, setToolColors] = useState<Record<string, string> | null>(null);
  const [toolOrder, setToolOrder] = useState<string[] | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<Record<string, string[]>>({});

  // Method to update dropdownOptions
  const updateDropdownOptions = (key: string, values: string[]) => {
    setDropdownOptions((prev) => {
      // Ensure previous state is not null, default to an empty object
      const updatedOptions = { ...(prev || {}) };
      updatedOptions[key] = values;
      return updatedOptions;
    });
  };

  // Method to update dropdownOptions
  const updateFilter = (key: string, values: string | string[]) => {
    type FilterKey = keyof Filter;

    setFilter((prev: any) => {
      // Ensure previous state is not null, default to an empty object
      const updatedFilter = { ...(prev || {}) };
      updatedFilter[key as FilterKey] = values;
      return updatedFilter;
    });
  };

  return (
    <DataContext.Provider
      value={{
        selectedFile,
        setSelectedFile,
        selectedDetailedFile,
        setSelectedDetailedFile,
        data,
        setData,
        dataDetailed,
        setDataDetailed,
        filter,
        setFilter,
        toolColors,
        setToolColors,
        toolOrder,
        setToolOrder,
        dropdownOptions,
        setDropdownOptions,
        updateDropdownOptions,
        updateFilter,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to consume the context
export const useDataContext = (): DataContextType => {
  const context = useContext(DataContext);

  // Ensure that the context is never null
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};



export interface DataRow {
  [key: string]: string;
}

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
export function assignDynamicToolColors(data: any[]): Record<string, string> {
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
export function assignDynamicToolOrder(data: any[]): string[] {
  const uniqueTools = [...new Set(data.map(row => row.Tool))];
  let toolOrder = Array.from(uniqueTools);
  toolOrder.sort((a, b) => a.localeCompare(b));

  return toolOrder;
}



// Function to read and process the uploaded data
export function readDataLogic(content: string): DataRow[] {


  console.log("ReadData");
  const rows = content.trim().split("\n");
  const columns = rows[0].split("\t");

  console.log(columns);

  const data = rows.slice(1).map(row => {
    const values = row.split("\t");
    return columns.reduce((obj: DataRow, col, i) => {
      obj[col] = values[i];
      return obj;
    }, {} as DataRow); // Cast empty object to DataRow type
  });

  if (!data) {
    console.log("ReadData null");
    return []; // Return an empty array if data is null or undefined
  }

  return data;

  // // Populate dropdowns with unique values
  // const dropdowns = {
  //     AllowAlternatives: [...new Set(context.data.map(d => d.AllowAlternatives))],
  //     Dataset: [...new Set(context.data.map(d => d.Dataset))],
  //     Taxonomy: [...new Set(context.data.map(d => d.Taxonomy))],
  //     Tool: [...new Set(context.data.map(d => d.Tool))],
  //     Rank: [...new Set(context.data.map(d => d.Rank))],
  // };

  // Assign dynamic colors to tools

}

