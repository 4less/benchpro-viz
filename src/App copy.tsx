import { defineConfig } from 'vite';
import 'bootstrap/dist/css/bootstrap.min.css'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import './index.css';
import { useEffect } from 'react';
import Plotly from 'plotly.js';
import { Col, Dropdown, DropdownButton, Row } from 'react-bootstrap';





function DropdownRow() {
  return (
    <Row className="dropdown-row">
      {/* Dropdown 1 */}
      <Col xs={12} sm={6} md={2} className="dropdown-col">
        <Dropdown>
          <DropdownButton variant="secondary" id="dropdown-1" title="Metric">
            <Dropdown.Item href="#action1">Item 1</Dropdown.Item>
            <Dropdown.Item href="#action2">Item 2</Dropdown.Item>
            <Dropdown.Item href="#action3">Item 3</Dropdown.Item>
          </DropdownButton>
        </Dropdown>
      </Col>

      {/* Dropdown 2 */}
      <Col xs={12} sm={6} md={2} className="dropdown-col">
        <Dropdown>
          <DropdownButton variant="secondary" id="dropdown-2" title="Taxonomy">
            <Dropdown.Item href="#action1">Item 1</Dropdown.Item>
            <Dropdown.Item href="#action2">Item 2</Dropdown.Item>
            <Dropdown.Item href="#action3">Item 3</Dropdown.Item>
          </DropdownButton>
        </Dropdown>
      </Col>

      {/* Dropdown 3 */}
      <Col xs={12} sm={6} md={2} className="dropdown-col">
        <Dropdown>
          <DropdownButton variant="secondary" id="dropdown-3" title="Allow Alt.">
            <Dropdown.Item href="#action1">Item 1</Dropdown.Item>
            <Dropdown.Item href="#action2">Item 2</Dropdown.Item>
            <Dropdown.Item href="#action3">Item 3</Dropdown.Item>
          </DropdownButton>
        </Dropdown>
      </Col>

      {/* Dropdown 4 */}
      <Col xs={12} sm={6} md={2} className="dropdown-col">
        <Dropdown>
          <DropdownButton variant="secondary" id="dropdown-4" title="Dataset">
            <Dropdown.Item href="#action1">Item 1</Dropdown.Item>
            <Dropdown.Item href="#action2">Item 2</Dropdown.Item>
            <Dropdown.Item href="#action3">Item 3</Dropdown.Item>
          </DropdownButton>
        </Dropdown>
      </Col>

      {/* Dropdown 5 */}
      <Col xs={12} sm={6} md={2} className="dropdown-col">
        <Dropdown>
          <DropdownButton variant="secondary" id="dropdown-5" title="Tool">
            <Dropdown.Item href="#action1">Item 1</Dropdown.Item>
            <Dropdown.Item href="#action2">Item 2</Dropdown.Item>
            <Dropdown.Item href="#action3">Item 3</Dropdown.Item>
          </DropdownButton>
        </Dropdown>
      </Col>

      {/* Dropdown 6 */}
      <Col xs={12} sm={6} md={2} className="dropdown-col">
        <Dropdown>
          <DropdownButton variant="secondary" id="dropdown-6" title="Rank">
          <Dropdown.Item href="#action3">Item 3</Dropdown.Item>
          </DropdownButton>
        </Dropdown>
      </Col>
    </Row>
  );
}

function plotstr(id: string): void {
  
  const y0: number[] = Array.from({ length: 50 }, () => Math.random());
  const y1: number[] = Array.from({ length: 50 }, () => Math.random() + 1);

  const trace1: Partial<Plotly.Data> = { y: y0, type: 'box', name: 'T1' };
  const trace2: Partial<Plotly.Data> = { y: y1, type: 'box', name: 'T2' };

  // Create the plot with multiple traces
  Plotly.newPlot(id, [trace1, trace2]);
}

function BasicExample() {
  useEffect(() => {
    plotstr('content');
  });
  return (
    <>
      <Container>
        <Navbar fixed="top" data-bs-theme="dark" expand="lg" className="bg-body-tertiary">
          <Container>
            <Navbar.Brand href="#home">Benchpro-viz</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#home">Data</Nav.Link>
                <NavDropdown title="Taxonomic Profiling" id="basic-nav-dropdown">
                  <NavDropdown.Item href="#action/3.1">Boxplots (one Metric)</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.2">Scatterplot (two Metrics)</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.4">
                    Separated link
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

      </Container>



      {/* Content Section */}
      {/* Root div spanning full viewport */}
      <div
        style={{
          height: '100vh',  // Full viewport height
          display: 'flex',  // Use flexbox to center content
          flexDirection: 'column',  // Stack children vertically
          alignItems: 'center', // Center horizontally
          paddingTop: '80px',  // Add space for the navbar
        }}
      >
        {DropdownRow()}
        {/* Centered Content Box */}
        <div id="content"
          style={{
            width: '1000px',   // Fixed width for the content box
            textAlign: 'left', // Left-aligned text
            padding: '20px',   // Padding inside the box
            backgroundColor: 'transparent', // No background color
            color: 'black',    // Black text color
            boxSizing: 'border-box', // Ensures padding is included in the width
          }}
        >
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. (1000 words of lorem ipsum or as much as you need)
          </p>
        </div>
      </div>
    </>
  );
}

export default BasicExample;



// useEffect(() => {
//   console.log("Is this being called?")
//   DummyBoxplot2('content'); // Pass the ID of the div where the plot should go
// }, []);