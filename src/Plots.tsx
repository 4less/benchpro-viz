import Plotly, { Layout, PlotlyHTMLElement, PlotMouseEvent } from "plotly.js";
import { DataRow } from "./DataContext";
import Plot from 'react-plotly.js';

export function defaultLayout(): Layout {
    return {width: 320, height: 240, title: 'A Fancy Plot'} as Layout;
}

export function metricTraces({ filteredData, metric, toolColors }: { filteredData: DataRow[], metric: string, toolColors: Record<string, string>}): Partial<Plotly.Data>[] {

    const tools = [...new Set(filteredData.map(d => d.Tool))];
    const metrics = [metric];
    // const metrics = ["F1", "Precision", "Sensitivity"];

    const traces: Partial<Plotly.Data>[] = metrics.flatMap((tm: string) => { 
        return tools.map((tool: string) => {
            const toolData = filteredData.filter(d => d.Tool === tool);
        

            // Map and filter out undefined values
            const f1Values = toolData
                .map(d => {
                    if (tm == 'F1') {
                        return parseFloat(d.F1);
                    } else if (tm == 'Precision') {
                        return parseFloat(d.Precision);
                    } else if (tm == 'Sensitivity') {
                        return parseFloat(d.Sensitivity);
                    }
                    return undefined; // Ensure all branches return a value
                })
                .filter((value): value is number => value !== undefined); // Remove undefined values
        
            const ids = toolData.map(d => d.ID);
            const hoverTexts = toolData.map(d => `ID: ${d.ID}<br>Dataset: ${d.Dataset}`);
        
            return {
                y: f1Values,
                // x: Array(f1Values.length).fill(tm),
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
        })
    });

    return traces;
}

export function metricLayout({ metric, toolOrder, xaxisTitle, width }: 
        {   
            metric: string, 
            toolOrder: string[], 
            xaxisTitle: string,
            width: number
        }): Layout {

    return {
        // boxmode: 'group',
        title: metric+' Boxplots', // Or just `title` (shorthand)
        xaxis: {
            title: xaxisTitle, // Or just `title: xaxisTitle`
            categoryorder: 'array', // Ensure x-axis categories follow the given order
            categoryarray: toolOrder, // Set the order explicitly
        },
        yaxis: {
            title: metric, // Set the y-axis title
        },
        width: width,
        height: 600
    } as Layout;
}


export function defaultTraces(): Partial<Plotly.Data>[] {
    return [
        {
          x: [1, 2, 3],
          y: [2, 6, 3],
          type: 'scatter',
          mode: 'lines+markers',
          marker: {color: 'red'},
        },
        {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
    ] as Partial<Plotly.Data>[];
}

export function TestBoxplot() {
    // Initialize the state for the grid data
    return (
        <Plot
        data={[
          {
            x: [1, 2, 3],
            y: [2, 6, 3],
            type: 'scatter',
            mode: 'lines+markers',
            marker: {color: 'red'},
          },
          {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
        ]}
        layout={{width: 320, height: 240, title: 'A Fancy Plot'}}
      />
    )
}


export function Boxplot({ layout, traces, onClick }: 
        {   layout: Layout, 
            traces: Partial<Plotly.Data>[], 
            onClick: (event: Readonly<PlotMouseEvent>) => void
        }) {
    // Initialize the state for the grid data
    return (
        <Plot
        data={traces}
        layout={layout}
        onClick={onClick}
      />
    )
}

// Function to render the boxplot
export function renderBoxplot(data: DataRow[], metric: string, toolColors: Record<string, string> | null, toolOrder: string[] | null): Promise<PlotlyHTMLElement> | null {
    console.log("Render Boxplot");
    if (data == null || data.length === 0) return null;
  
    const tools = [...new Set(data.map(d => d.Tool))];
  
    console.log(tools);
  
    const traces: Partial<Plotly.Data>[] = tools.map((tool: string) => {
      const toolData = data.filter(d => d.Tool === tool);
  
      // Map and filter out undefined values
      const f1Values = toolData
        .map(d => {
          if (metric == 'F1') {
            return parseFloat(d.F1);
          } else if (metric == 'Precision') {
            return parseFloat(d.Precision);
          } else if (metric == 'Sensitivity') {
            return parseFloat(d.Sensitivity);
          }
          return parseFloat(d.F1); // Ensure all branches return a value
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
          color: toolColors![tool],
          size: 6,
          opacity: 0.7,
        },
      };
    });
  
    const toolsSet = new Set(tools);
    const localToolOrder = toolOrder!.filter(item => toolsSet.has(item));
  
    console.log(traces);
    console.log(localToolOrder);
    console.log(toolsSet);

    return Plotly.newPlot("content", traces, {
      title: metric + ' Scores by Tool',
      xaxis: {
        title: "Tool",
        categoryorder: 'array', // Make sure x-axis categories follow the given order
        categoryarray: localToolOrder, // Set the order explicitly
      },
      yaxis: { title: "F1 Score" },
    })
  }


