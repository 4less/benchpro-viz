
import './css/gridjs2.css';
import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Card, Col, Form, Row, Tab, Tabs } from 'react-bootstrap';
import './index.css';
import { assignDynamicToolColors, assignDynamicToolOrder, DataRow, filterData2, rankOrder, readDataLogic, useDataContext } from './DataContext';
import { metricLayout, metricTraces, profileTraces, scatterLayout, scatterSummaryTraces, scatterTraces } from './Plots';
import ProgressBar, { DetailedGrid, DownloadBox, DropdownRow } from './UI';
import { Layout, PlotMouseEvent } from 'plotly.js';
import Markdown from 'react-markdown'

import upload_content from './../content/upload.md?raw';
import Plot from 'react-plotly.js';
import { mean, median } from './Utils';
import { FalsePredictionAnalysisPage } from './FalsePredictionAnalysis';
import { HomePage } from './Home';

// Content for 'Data' view
function DataPage() {
  const { data, setData, dataDetailed, setDataDetailed, selectedDetailedFile, setSelectedDetailedFile, selectedFile, setSelectedFile, updateDropdownOptions, setToolColors, setToolOrder } = useDataContext();

  const statusStrData = data ? "success" : "nofile";
  const statusStrDataDetailed = dataDetailed ? "success" : "nofile";

  const [statusData, setStatusData] = useState<"success" | "pending" | "nofile" | "failed">(
    statusStrData
  );
  const [statusDataDetailed, setStatusDataDetailed] = useState<"success" | "pending" | "nofile" | "failed">(
    statusStrDataDetailed
  );

  const readData = async (file: File) => {
    if (!file) return;
    const content = await file.text();
    const tmp: DataRow[] = readDataLogic(content);
    return tmp;
  }

  const populateDropdowns = (data: DataRow[]) => {
    const tc = assignDynamicToolColors(data);
    const to = assignDynamicToolOrder(data);
    const availableRanks = [...new Set(data.map(d => d.Rank))];
    const dropdownRanks = rankOrder.filter(rank => availableRanks.includes(rank));
    const dropdownTools = [...new Set(data.map(d => d.Tool))];
    const dropdownTaxonomies = [...new Set(data.map(d => d.Taxonomy))];
    const dropdownAllowAlt = [...new Set(data.map(d => d.AllowAlternatives))];
    const dropdownDatasets = ["All", ...new Set(data.map(d => d.Dataset))];

    updateDropdownOptions('metrics', ['F1', 'Precision', 'Sensitivity']);
    updateDropdownOptions('ranks', dropdownRanks);
    updateDropdownOptions('tools', dropdownTools);
    updateDropdownOptions('datasets', dropdownDatasets);
    updateDropdownOptions('taxonomies', dropdownTaxonomies);
    updateDropdownOptions('allow_alternatives', dropdownAllowAlt);
    setToolColors(tc);
    setToolOrder(to);
  }



  // Function to handle file input
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the first selected file
    if (file) {
      setStatusData("pending");
      setSelectedFile(file); // Update the state
      let data = await readData(file); // Call the function with the file name

      setData(data as DataRow[]);
      populateDropdowns(data as DataRow[]);

      setStatusData("success");
    }
  };

  // Function to handle file input
  const handleDetailedFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the first selected file
    if (file) {
      setStatusDataDetailed("pending");
      setSelectedDetailedFile(file); // Update the state
      let data = await readData(file); // Call the function with the file name
      setDataDetailed(data as DataRow[]);
      setStatusDataDetailed("success");
    }
  };


  const loadFromLink = async () => {
    const url = "https://raw.githubusercontent.com/4less/benchpro-viz/refs/heads/main/default_data/data.tsv";


    // const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    let response = await fetch(url);
    let download_data = await response.text();
    let metadata = {
      type: 'text/tsv'
    };
    let file = new File([download_data], "data.tsv", metadata);
    
    setStatusData("pending");
    setSelectedFile(file); // Update the state
    let data = await readData(file); // Call the function with the file name

    setData(data as DataRow[]);
    populateDropdowns(data as DataRow[]);

    setStatusData("success");
  }

  const [progress, setProgress] = React.useState(0);
  const loadDetailedFromLink = async (setProgress: (progress: number) => void, totalBytes: number | null) => {
    setStatusDataDetailed("pending");
    const url = "https://raw.githubusercontent.com/4less/benchpro-viz/refs/heads/main/default_data/data_detailed.tsv";
  
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
  
      let loadedBytes = 0;
  
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let textData = '';
  
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
  
          loadedBytes += value ? value.length : 0;
          if (totalBytes) {
            setProgress((loadedBytes / totalBytes) * 100);
            console.log((loadedBytes / totalBytes) * 100);
          }
  
          textData += decoder.decode(value, { stream: true });
        }
      }
      let metadata = {
        type: 'text/tsv'
      };
      let file = new File([textData], "data.tsv", metadata);
    
      setSelectedDetailedFile(file); // Update the state
      let data = await readData(file); // Call the function with the file name
  
      setDataDetailed(data as DataRow[]);
  
      setStatusDataDetailed("success");
    } catch (error) {
      setStatusDataDetailed("failed");
      console.error('Error downloading file:', error);
      setProgress(0); // Reset progress on error
      throw error;
    }
  }

  // const loadDetailedFromLink = async () => {
  //   setStatusDataDetailed("pending");
  //   const apiUrl = "https://api.github.com/repos/4less/benchpro-viz/contents/default_data/data_detailed.tsv";
  
  //   try {
  //     const response = await fetch(apiUrl, {
  //       headers: { Accept: "application/vnd.github.v3.raw" },
  //     });

  //     // Check if the response is OK
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }
  
  //     const download_data = await response.text();
  //     const metadata = { type: 'text/tsv' };
  //     const file = new File([download_data], "data_detailed.tsv", metadata);
  
  //     setSelectedDetailedFile(file); // Update the state

  //     const data = await readData(file); // Call the function with the file name
  
  //     console.dir(data);
  
  //     setDataDetailed(data as DataRow[]);
  //     setStatusDataDetailed("success");
  //   } catch (error: unknown) {
  //     // Type narrowing for error
  //     if (error instanceof Error) {
  //       console.error("Failed to load the file:", error.message);
  
  //       if (error.name === "AbortError") {
  //         console.error("The fetch request timed out.");
  //       } else if (error.message.includes("Failed to fetch")) {
  //         console.error("Network error or resource not reachable.");
  //       } else {
  //         console.error("An unexpected error occurred:", error.message);
  //       }
  //     } else {
  //       console.error("An unknown error occurred:", error);
  //     }
  
  //     setStatusDataDetailed("failed"); // Update your state to reflect failure
  //   }
  // }

  return (
    <div
      style={{
        height: '100vh',  // Full viewport height
        display: 'flex',  // Use flexbox to center content
        flexDirection: 'column',  // Stack children vertically
        alignItems: 'center', // Center horizontally
        paddingTop: '20px',  // Add space for the navbar
        maxWidth: '800px',
        minWidth: '300',
      }}
    >
      <Card style={{ background: "white", padding: 20, textAlign: "center", border: "None" }}>
        <div className='vspace-40'></div>
        <h2>Upload Your Data</h2>
        <hr></hr>
        <div className='vspace-20'></div>
        <Row>
          {/* Data Input */}
          <Col>
            <Card className={`upload-${statusData}`} style={{ padding: 20, textAlign: "center", border: "None" }}>
              <h4>Data</h4>
              <input
                type="file"
                className="form-control"
                onChange={handleFileChange}//handleFileChange
                accept=".tsv" // Optional: Restrict file types
              />
              {selectedFile && (
                <div style={{ marginTop: '20px' }}>
                  <strong>Selected File:</strong> {selectedFile.name}
                </div>
              )}
              <Card style={{ background: "#b8ff80", padding: 20, marginTop: 20, verticalAlign: "middle", textAlign: "center", justifyContent: "center", border: "None", color: "black", fontWeight: "bold", cursor: "pointer" }}
                onClick={() => loadFromLink()}>
                Load Example data
              </Card>
              <Card style={{ background: "#D4EBF8", padding: 20, marginTop: 20, verticalAlign: "middle", textAlign: "center", justifyContent: "center", border: "None" }}>
                <a href="https://raw.githubusercontent.com/4less/benchpro-viz/refs/heads/main/default_data/data.tsv" target="_blank" download="data.tsv">Download Example data (2.5 MB)</a>
              </Card>
            </Card>
          </Col>
          {/* Detailed data input */}
          <Col>

            <Card className={`upload-${statusDataDetailed}`} style={{ background: "#F7D8BA", padding: 20, textAlign: "center", border: "None" }}>
              <h4>Detailed Data</h4>
              <input
                type="file"
                className="form-control"
                onChange={handleDetailedFileChange}//handleFileChange
                accept=".tsv" // Optional: Restrict file types
              />
              {selectedDetailedFile && (
                <div style={{ marginTop: '20px' }}>
                  <strong>Selected File:</strong> {selectedDetailedFile.name}
                </div>
              )}
              <Card style={{ background: "#b8ff80", padding: 20, marginTop: 20, verticalAlign: "middle", textAlign: "center", justifyContent: "center", border: "None", color: "black", fontWeight: "bold", cursor: "pointer" }}
                onClick={() => loadDetailedFromLink(setProgress, 14897229)}>
                Load Example detailed data (14.9 MB)
              </Card>
              <ProgressBar progress={progress} />

              <Card style={{ background: "#D4EBF8", padding: 20, marginTop: 20, verticalAlign: "middle", textAlign: "center", justifyContent: "center", border: "None" }}>
                <a href="https://raw.githubusercontent.com/4less/benchpro-viz/refs/heads/main/default_data/data_detailed.tsv">Download Example detailed data (14.9 MB)</a>
              </Card>
            </Card>
          </Col>
        </Row>
        <Row style={{ textAlign: "center" }}>

          <div className='vspace-40'></div>
          <hr></hr>
          <div className='vspace-20'></div>
        </Row>
        <Row>
          <div style={{ textAlign: 'left' }}>
            <Markdown>{upload_content}</Markdown>
          </div>
        </Row>
        {DownloadBox("Raw Profiles", "http://google.com")}

      </Card>
    </div>
  );
}

// Content for 'Home' (dropdowns and boxplot)
function ScatterplotPage() {

  const { data, dataDetailed, filter, toolOrder, toolColors } = useDataContext();

  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [gridData, setGridData] = useState<any[]>([]);
  const [metric, setMetric] = useState<string>("F1");
  const [_localToolOrder, setLocalToolOrder] = useState<string[]>(toolOrder!);
  const [sliderValue, setSliderValue] = useState<number>(1000);
  const [sliderTableValue, setSliderTableValue] = useState<number>(1000);
  const [clickedId, setClickedId] = useState<string>("");

  useEffect(() => {
    console.log("Filter changed...");
    const refilter = filterData2(data, filter!);
    setMetric(filter!.metric);

    setFilteredData(refilter);
    const uniqueTools = [...new Set(refilter.map(row => row.Tool))];

    setLocalToolOrder(toolOrder ? toolOrder.filter(d => uniqueTools.includes(d)) : uniqueTools);
  }, [filter, data]);

  const layout = useMemo(() =>
    scatterLayout({ metricX: "Precision", metricY: "Sensitivity", width: sliderValue }),
    [sliderValue]
  );
  const traces = useMemo(() =>
    scatterTraces({ filteredData, metricX: "Precision", metricY: "Sensitivity", toolColors: toolColors ?? {} }),
    [filteredData, metric, toolColors]
  );

  const onClick = (event: Readonly<PlotMouseEvent>) => {
    if (!dataDetailed) {
      return;
    }
    const points = event.points;
    // const mouseEvent = event.event;
    const clickedPoint = points[0];
    // const tool = clickedPoint.data.name;
    const clickedID = clickedPoint.customdata as string;
    setClickedId(clickedID);

    const refilter = filterData2(dataDetailed, filter!).filter(d => d.ID == clickedID);
    setGridData(refilter);
  };



  const scatterSummaryTracesVar = useMemo(() => {
    return scatterSummaryTraces({ filteredData: filteredData!, toolColors: toolColors ?? {} });
  },
    [filteredData]
  );

  if (!data) {
    return <h1>Please upload data first</h1>;
  }

  return (
    <div
      style={{
        height: '100vh',  // Full viewport height
        display: 'flex',  // Use flexbox to center content
        flexDirection: 'column',  // Stack children vertically
        alignItems: 'center', // Center horizontally
        paddingTop: '50px',  // Add space for the navbar
      }}
    >
      <Form.Range
        min={500}
        max={2000}
        style={{ padding: 30, width: "600px" }}
        value={sliderValue}
        onChange={(event) => setSliderValue(parseInt(event.target.value))} />
      {DropdownRow()}

      <Tabs
        defaultActiveKey="samples"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="samples" title="Samples" style={{ justifyItems: "center" }}>
          <Plot data={traces} layout={layout} onClick={onClick} />
          <hr style={{ margin: "40px", width: "100%" }}></hr>
          <h3>Selected Sample: {clickedId}</h3>
          <Form.Range
            min={500}
            max={2000}
            style={{ padding: 30, width: "600px" }}
            value={sliderTableValue}
            onChange={(event) => setSliderTableValue(parseInt(event.target.value))} />

          <DetailedGrid dataDetailed={gridData} width={sliderTableValue} />
          {/* <hr style={{ margin: "400px", width: "100%" }}></hr> */}
        </Tab>

        {/* Profile tab */}
        <Tab eventKey="summary" title="Summary">
          <Plot data={scatterSummaryTracesVar} layout={layout} onClick={onClick} />
        </Tab>

      </Tabs>


    </div>
  );
}



// Content for 'Home' (dropdowns and boxplot)
function BoxplotPage() {
  const { data, dataDetailed, filter, toolOrder, toolColors, sortBy } = useDataContext();

  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [gridData, setGridData] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("Title");
  const [xaxisTitle, setXaxisTitle] = useState<string>("x-Axis");
  const [metric, setMetric] = useState<string>("F1");
  const [localToolOrder, setLocalToolOrder] = useState<string[]>(toolOrder!);
  const [sliderValue, setSliderValue] = useState<number>(1000);
  const [sliderTableValue, setSliderTableValue] = useState<number>(1000);
  const [clickedId, setClickedId] = useState<string>("");

  useEffect(() => {
    console.log("Filter changed...");
    const refilter = filterData2(data, filter!);
    setMetric(filter!.metric);

    setFilteredData(refilter);
    const uniqueTools = [...new Set(refilter.map(row => row.Tool))];

    setLocalToolOrder(toolOrder ? toolOrder.filter(d => uniqueTools.includes(d)) : uniqueTools);
  }, [filter, data]);

  useEffect(() => {
    setTitle(filter!.metric);
    setXaxisTitle(filter!.metric);
  }, [filter!.metric])

  useEffect(() => {
    const tools = [...new Set(filteredData.map(d => d.Tool))];
    let toolMetric: [string, number][] = tools.map((tool: string) => {
      const toolData = filteredData.filter(d => d.Tool === tool);
      const activeMetric = toolData.map(row => row[metric]);

      let sortByNumber: number = 0;
      const values: number[] = activeMetric.map((v) => parseFloat(v));
      if (sortBy[0] === "Median") {
        sortByNumber = median(values);
      } else if (sortBy[0] === "Min") {
        sortByNumber = Math.min(...values);
      } else if (sortBy[0] === "Max") {
        sortByNumber = Math.max(...values);
      } else if (sortBy[0] === "Mean") {
        sortByNumber = mean(values);
      }

      return [tool, sortByNumber];
    });

    toolMetric.sort((a, b) => b[1] - a[1]);

    setLocalToolOrder(toolMetric.map((x) => x[0]));
    console.log("New Tool Order: " + localToolOrder);

  }, [sortBy, filteredData]);

  const layout = useMemo(() =>
    metricLayout({ metric, toolOrder: localToolOrder, xaxisTitle: xaxisTitle ?? "Default Title", width: sliderValue }),
    [title, metric, localToolOrder, xaxisTitle, sliderValue]
  );
  const traces = useMemo(() =>
    metricTraces({ filteredData, metric, toolColors: toolColors ?? {} }),
    [filteredData, metric, toolColors]
  );

  const profileBarplotTraces = useMemo(() => {
    const refilter: DataRow[] = gridData.filter(d => d.ID == clickedId);
    return profileTraces({ data: refilter });
  },
    [gridData]
  );

  const gridLayout = useMemo(() => {
    const refilter: DataRow[] = gridData.filter(d => d.ID == clickedId);
    const orderRows = refilter.sort((a, b) => {
      let aa: number = parseFloat(a["Type"] == "TP" || a["Type"] == "FN" ? a["GoldStdAbundance"] : a["PredictionAbundance"]);
      let ba: number = parseFloat(b["Type"] == "TP" || b["Type"] == "FN" ? b["GoldStdAbundance"] : b["PredictionAbundance"]);
      return ba - aa;
    });
    console.dir(orderRows.map((row) => row["Rank"]));
    const order = orderRows.map((row) => row["Name"]);
    console.log("Order: ");
    console.dir(order);
    return {
      barmode: 'group',
      bargap: 0.1,
      width: sliderTableValue,
      xaxis: {
        categoryorder: 'array', // Ensure x-axis categories follow the given order
        categoryarray: order, // Set the order explicitly
      }
    } as Layout;
  },
    [gridData, sliderTableValue]
  );

  const onClick = (event: Readonly<PlotMouseEvent>) => {
    if (!dataDetailed) {
      return;
    }
    const points = event.points;
    // const mouseEvent = event.event;
    const clickedPoint = points[0];
    // const tool = clickedPoint.data.name;
    const clickedID = clickedPoint.customdata as string;
    setClickedId(clickedID);

    const refilter = filterData2(dataDetailed, filter!).filter(d => d.ID == clickedID);
    setGridData(refilter);
  };

  if (!data) {
    return <h1>Please upload data first</h1>;
  }


  return (
    <div
      style={{
        height: '100vh',  // Full viewport height
        display: 'flex',  // Use flexbox to center content
        flexDirection: 'column',  // Stack children vertically
        alignItems: 'center', // Center horizontally
        paddingTop: '50px',  // Add space for the navbar
      }}
    >
      <Form.Range
        min={500}
        max={2000}
        style={{ padding: 30, width: "600px" }}
        value={sliderValue}
        onChange={(event) => setSliderValue(parseInt(event.target.value))} />
      {DropdownRow()}

      <Plot data={traces} layout={layout} onClick={onClick} />
      <hr style={{ margin: "40px", width: "100%" }}></hr>
      <h3>Selected Sample: {clickedId}</h3>
      <Form.Range
        min={500}
        max={2000}
        style={{ padding: 30, width: "600px" }}
        value={sliderTableValue}
        onChange={(event) => setSliderTableValue(parseInt(event.target.value))} />

      <Tabs
        defaultActiveKey="home"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="home" title="Sample Information">
          <Plot data={profileBarplotTraces} layout={gridLayout} />
          <DetailedGrid dataDetailed={gridData} width={sliderTableValue} />
        </Tab>

        {/* Profile tab */}
        <Tab eventKey="profile" title="Profile">
          <Plot data={profileBarplotTraces} layout={gridLayout} />
        </Tab>
      </Tabs>
      <hr style={{ margin: "400px", width: "100%" }}></hr>
    </div>
  );
}

// Main App Component with React Router
function App() {
  return (
    <Router>
      <Container>
        <Navbar fixed="top" data-bs-theme="dark" expand="lg" className="bg-body-tertiary">
          <Container>
            <Navbar.Brand href="#home">Benchpro-viz</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="benchpro-viz/home">Home</Nav.Link>

                <NavDropdown title="Taxonomic Profiling" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="benchpro-viz/data">Data + Upload</NavDropdown.Item>
                  <hr></hr>
                  <NavDropdown.Item as={Link} to="benchpro-viz/boxplot">Boxplots (one Metric)</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="benchpro-viz/scatterplot">Scatterplot (two Metrics)</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="benchpro-viz/false_analysis">False Prediction Analysis</NavDropdown.Item>
                </NavDropdown>

                <NavDropdown title="Strain-Resolved Analysis" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="">Inactive</NavDropdown.Item>
                </NavDropdown>

                <NavDropdown title="Alignment Analysis" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="">Inactive</NavDropdown.Item>
                </NavDropdown>
              </Nav>

            </Navbar.Collapse>
          </Container>
        </Navbar>
      </Container>

      <Container style={{ paddingTop: '20px' }}>
        <Routes>
          {/* Define routes for your pages */}
          <Route path="benchpro-viz/" element={<HomePage />} />
          <Route path="benchpro-viz/home" element={<HomePage />} />
          <Route path="benchpro-viz/data" element={<DataPage />} />
          <Route path="benchpro-viz/boxplot" element={<BoxplotPage />} />
          <Route path="benchpro-viz/scatterplot" element={<ScatterplotPage />} />
          <Route path="benchpro-viz/false_analysis" element={<FalsePredictionAnalysisPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

