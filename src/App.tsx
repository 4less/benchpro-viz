
import './css/gridjs2.css';
import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Card, Col, Dropdown, DropdownButton, Form, Row } from 'react-bootstrap';
import Plotly, { Layout, PlotMouseEvent } from 'plotly.js';
import './index.css';
import { assignDynamicToolColors, assignDynamicToolOrder, DataRow, Filter, filterData, filterData2, rankOrder, readDataLogic, useDataContext } from './DataContext';
import { Grid } from "gridjs-react";
import { Boxplot, TestBoxplot, defaultLayout, defaultTraces, metricLayout, metricTraces, renderBoxplot } from './Plots';
import { DetailedGrid, DropdownRow } from './UI';
import RPlotly from 'react-plotly.js';



// Content for 'Data' view
function DataPage() {
  const { data, setData, dataDetailed, setDataDetailed, selectedDetailedFile, setSelectedDetailedFile, selectedFile, setSelectedFile, toolOrder, dropdownOptions, updateDropdownOptions, setToolColors, setToolOrder, toolColors } = useDataContext();

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

  return (
    <div
      style={{
        height: '100vh',  // Full viewport height
        display: 'flex',  // Use flexbox to center content
        flexDirection: 'column',  // Stack children vertically
        alignItems: 'center', // Center horizontally
        paddingTop: '20px',  // Add space for the navbar
      }}
    >
      <Card style={{ background: "white", padding: 20, textAlign: "center", border: "None" }}>
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
            </Card>
          </Col>
        </Row>

      </Card>
    </div>
  );
}

// Content for 'Home' (dropdowns and boxplot)
function BoxplotPage() {

  const { data, dataDetailed, filter, toolOrder, toolColors } = useDataContext();

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

  const layout = useMemo(() => 
    metricLayout({ metric, toolOrder: localToolOrder, xaxisTitle: xaxisTitle ?? "Default Title", width: sliderValue }), 
    [title, metric, localToolOrder, xaxisTitle, sliderValue]
  );
  const traces = useMemo(() =>
    metricTraces({ filteredData, metric, toolColors: toolColors ?? {} }),
    [filteredData, metric, toolColors]
  );

  const onClick = (event: Readonly<PlotMouseEvent>) => {
    if (!dataDetailed) {
      return;
    }
    const points = event.points;
    const mouseEvent = event.event;
    const clickedPoint = points[0];
    const tool = clickedPoint.data.name;
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
        style={{padding: 30, width: "600px" }}
        value={sliderValue}
        onChange={(event) => setSliderValue(parseInt(event.target.value))}/>
      {DropdownRow()}
      <Boxplot traces={traces} layout={layout} onClick={onClick} />
      <hr style={{margin: "40px", width: "100%"}}></hr>
      <h3>Selected Sample: {clickedId}</h3>
      <Form.Range
        min={500}
        max={2000}
        style={{padding: 30, width: "600px" }}
        value={sliderTableValue}
        onChange={(event) => setSliderTableValue(parseInt(event.target.value))}/>

      <DetailedGrid dataDetailed={gridData} width={sliderTableValue} />
      <hr style={{margin: "400px", width: "100%"}}></hr>
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
                <Nav.Link as={Link} to="/data">Data</Nav.Link>
                <NavDropdown title="Taxonomic Profiling" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/boxplot">Boxplots (one Metric)</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.2">Scatterplot (two Metrics)</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </Container>

      <Container style={{ paddingTop: '20px' }}>
        <Routes>
          {/* Define routes for your pages */}
          <Route path="/" element={<DataPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/boxplot" element={<BoxplotPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

