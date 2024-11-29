import Plotly, { Layout, PlotlyHTMLElement, PlotMouseEvent } from "plotly.js";
import { DataRow } from "./DataContext";
import Plot from 'react-plotly.js';

export function defaultLayout(): Layout {
  return { width: 320, height: 240, title: 'A Fancy Plot' } as Layout;
}

export function defaultTraces(): Partial<Plotly.Data>[] {
  return [
    {
      x: [1, 2, 3],
      y: [2, 6, 3],
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'red' },
    },
    { type: 'bar', x: [1, 2, 3], y: [2, 5, 3] },
  ] as Partial<Plotly.Data>[];
}




export function profileTraces({ data }: { data: DataRow[] }): Partial<Plotly.Data>[] {
  const names = data.map((row) => row["Name"]);

  const sum_gold = data.map((row) => row["GoldStdAbundance"]).reduce((acc, val) => acc + parseFloat(val)!, 0);
  const sum_pred = data.map((row) => row["PredictionAbundance"]).reduce((acc, val) => acc + parseFloat(val)!, 0);

  console.log("Sum Gold " + sum_gold);
  console.log("Sum Pred " + sum_pred);
  console.log("Ratio    " + (sum_gold / sum_pred));

  const pred_scaler = (sum_gold / sum_pred < 0.02) ? 0.01 : 1;

  const tp_gold_abundances = data.map((row) => row["Type"] == "TP" ? row["GoldStdAbundance"] : null);
  const tp_pred_abundances = data.map((row) => row["Type"] == "TP" ? parseFloat(row["PredictionAbundance"])! * pred_scaler : null);
  const fp_pred_abundances = data.map((row) => row["Type"] == "FP" ? parseFloat(row["PredictionAbundance"])! * pred_scaler : null);
  const fn_gold_abundances = data.map((row) => row["Type"] == "FN" ? row["GoldStdAbundance"] : null);

  const traces: Partial<Plotly.Data>[] = [
    {
      x: names,
      y: tp_gold_abundances,
      name: "TP-GoldStd",
      type: 'bar',
      marker: {
        color: '#00A86B'
      }
    },
    {
      x: names,
      y: tp_pred_abundances,
      name: "TP-Prediction",
      type: 'bar',
      marker: {
        color: '#0067A5'
      }
    },
    {
      x: names,
      y: fp_pred_abundances,
      name: "FP-Prediction",
      type: 'bar',
      marker: {
        color: '#F04923'
      }
    },
    {
      x: names,
      y: fn_gold_abundances,
      name: "FN-GoldStd",
      type: 'bar',
      marker: {
        color: '#FFBF00'
      }
    }
  ];
  console.log("Barplot");
  console.dir(traces);

  // const traces: Partial<Plotly.Data>[] = data.flatMap(row => {
  //   const type = row["Type"];
  //   const name = row["Name"];

  //   if (type === "TP") {
  //     return {
  //       x: ["Gold", "Prediction"],
  //       y: [row["GoldStdAbundance"], row["PredictionAbundance"]],
  //       name: name,
  //       type: 'bar',
  //     };
  //   } else if (type === "FP") {
  //     return {
  //       x: ["Prediction"],
  //       y: [row["PredictionAbundance"]],
  //       name: name,
  //       type: 'bar',
  //     }
  //   } else if (type === "FN") {
  //     return {
  //       x: ["Gold"],
  //       y: [row["GoldStdAbundance"]],
  //       name: name,
  //       type: 'bar',
  //     };
  //   } else {
  //     return {
  //       x: ["Prediction"],
  //       y: [row["PredictionAbundance"]],
  //       name: name,
  //       type: 'bar',
  //     };
  //   }
  // });
  return traces;
}


export function metricTraces({ filteredData, metric, toolColors }: { filteredData: DataRow[], metric: string, toolColors: Record<string, string> }): Partial<Plotly.Data>[] {

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
    title: metric + ' Boxplots', // Or just `title` (shorthand)
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


export function scatterLayout({ metricX, metricY, width }:
  {
    metricX: string,
    metricY: string,
    width: number
  }): Layout {

  // Layout for the scatter plot
  return {
    title: 'Sensitivity vs Precision by Tool',
    xaxis: {
      title: {
        text: metricX // `text` should be used to specify the axis title
      },
      zeroline: false,
      gridcolor: '#f2f2f2'
    },
    yaxis: {
      title: {
        text: metricY
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
    },
    width: width,
    height: 600
  } as Layout;
}



export function scatterTraces({ filteredData, metricX, metricY, toolColors }: { filteredData: DataRow[], metricX: string, metricY: string, toolColors: Record<string, string> }): Partial<Plotly.Data>[] {

  const tools = [...new Set(filteredData.map(d => d.Tool))];

  const traces: Partial<Plotly.Data>[] = tools.map((tool: string) => {
    const toolData = filteredData.filter(d => d.Tool === tool);

    const xData = toolData.map(row => row[metricX]);
    const yData = toolData.map(row => row[metricY]);


    const toolF1 = filteredData.filter(row => row['F1']);
    const toolSensitivity = toolData.map(row => row['Sensitivity']);
    const toolPrecision = toolData.map(row => row['Precision']);

    const ids = toolData.map(d => d.ID);
    const hoverTexts = toolData.map(d => `ID: ${d.ID}<br>Dataset: ${d.Dataset}`);
    const toolDataset = toolData.map(row => row['Dataset']);

    return {
      x: xData,
      y: yData,
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
      text: toolData.map((_row, index) => {
        return `Dataset: ${toolDataset[index]}<br>Sensitivity: ${toolSensitivity[index]}<br>Precision: ${toolPrecision[index]}<br>F1: ${toolF1[index]}`;
      }),
      hoverinfo: 'text' // Show the customized text in the tooltip
    };
  });

  return traces;
}


export function scatterSummaryTraces({ filteredData, toolColors }: { filteredData: DataRow[], toolColors: Record<string, string> }): Partial<Plotly.Data>[] {
  // Example data

  const sens_var = "Sensitivity";
  const prec_var = "Precision";
  const group = "Tool";
  // Preprocess the data
  const groupedData = filteredData.reduce<Record<string, { sens: number[]; prec: number[] }>>((acc, row) => {
    const group_var = row[group];
    if (!acc[group_var]) {
      acc[group_var] = { sens: [], prec: [] };
    }
    
    acc[group_var].sens.push(parseFloat(row[sens_var])!);
    acc[group_var].prec.push(parseFloat(row[prec_var])!);
    return acc;
  }, {});

  const summaryData = Object.entries(groupedData).map(([group, values]) => {
    const meanSens = values.sens.reduce((sum, val) => sum + val, 0) / values.sens.length;
    const meanPrec = values.prec.reduce((sum, val) => sum + val, 0) / values.prec.length;
    const sdSens = Math.sqrt(values.sens.reduce((sum, val) => sum + (val - meanSens) ** 2, 0) / values.sens.length);
    const sdPrec = Math.sqrt(values.prec.reduce((sum, val) => sum + (val - meanPrec) ** 2, 0) / values.prec.length);
    return { group, meanSens, meanPrec, sdSens, sdPrec };
  });

  console.log("SummaryData");
  console.dir(summaryData);
  console.dir(groupedData);

  // Prepare traces
  const scatterTraces: Partial<Plotly.Data>[] = summaryData.map(d => ({
    x: [d.meanSens],
    y: [d.meanPrec],
    mode: 'markers',
    type: 'scatter',
    name: `${d.group} Mean`,
    marker: { 
      size: 10,
      color: toolColors[d.group]
    }
  }));

  const whiskerTraces: Partial<Plotly.Data>[] = summaryData.flatMap(d => [
    // Horizontal whisker
    {
      x: [d.meanSens - d.sdSens, d.meanSens + d.sdSens],
      y: [d.meanPrec, d.meanPrec],
      mode: 'lines',
      type: 'scatter',
      name: `${d.group} X whisker`,
      line: { color: toolColors[d.group], dash: 'dash' }
    },
    // Vertical whisker
    {
      x: [d.meanSens, d.meanSens],
      y: [d.meanPrec - d.sdPrec, d.meanPrec + d.sdPrec],
      mode: 'lines',
      type: 'scatter',
      name: `${d.group} Y whisker`,
      line: { color: toolColors[d.group], dash: 'dash' }
    }
  ]);

  return [...scatterTraces, ...whiskerTraces];
}