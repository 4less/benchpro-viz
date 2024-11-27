import { Card, Col, Dropdown, DropdownButton, Form, Row } from "react-bootstrap";
import { Filter, useDataContext } from "./DataContext";
import { useEffect, useState } from "react";
import { Grid } from "gridjs-react";

export function DropdownRow() {
    const {setFilter, dropdownOptions } = useDataContext();
    const [selectedTaxonomies, setSelectedTaxonomies] = useState<string[]>(dropdownOptions.taxonomies);
    const [selectedMetric, setSelectedMetric] = useState<string>("F1");
    const [selectedDataset, setSelectedDataset] = useState<string>("All");
    const [selectedTools, setSelectedTools] = useState<string[]>(dropdownOptions.tools);
    const [selectedRank, setSelectedRank] = useState<string>("Species");
    const [selectedAllowAlt, setSelectedAllowAlt] = useState<string>("TRUE");

    // Handle checkbox toggle
    const handleCheckboxToggleTaxonomy = (taxonomy: string) => {
        console.log("taxonomy: " + taxonomy);
        setSelectedTaxonomies((prevSelected) => {
            const isSelected = prevSelected.includes(taxonomy);

            // Add or remove the taxonomy from the list of selected taxonomies
            const updatedSelection = isSelected
                ? prevSelected.filter((item) => item !== taxonomy)
                : [...prevSelected, taxonomy];

            console.log(`Updated selected taxonomies: ${updatedSelection}`);
            return updatedSelection;
        });
    };
    // Handle checkbox toggle
    const handleCheckboxToggleTools = (tool: string) => {
        console.log("tool: " + tool);
        setSelectedTools((prevSelected) => {
            const isSelected = prevSelected.includes(tool);

            // Add or remove the taxonomy from the list of selected taxonomies
            const updatedSelection = isSelected
                ? prevSelected.filter((item) => item !== tool)
                : [...prevSelected, tool];

            console.log(`Updated selected taxonomies: ${updatedSelection}`);
            return updatedSelection;
        });
    };

    // Effect hook to listen to changes in selectedTaxonomies
    useEffect(() => {
        const local_filter = {
            allowAlternatives: selectedAllowAlt,
            dataset: selectedDataset,
            taxonomies: selectedTaxonomies,
            tools: selectedTools,
            rank: selectedRank,
            metric: selectedMetric,
        } as Filter;

        setFilter(local_filter);

        // You can perform additional actions here, such as fetching data or triggering other logic
    }, [selectedTaxonomies, selectedTools, selectedDataset, selectedAllowAlt, selectedMetric, selectedRank]); // Dependency array with selectedTaxonomies

    return (
        <Row className="dropdown-row">
            {/* Dropdown 1 */}
            <Col xs={12} sm={6} md={2} className="dropdown-col">
                <Dropdown>
                    <DropdownButton variant="secondary" id="dropdown-1" title="Metric">
                        {dropdownOptions && dropdownOptions.metrics && dropdownOptions.metrics.length > 0 ? (
                            dropdownOptions.metrics.map((item, index) => (
                                <Dropdown.Item
                                    key={index}
                                    onClick={() => setSelectedMetric(item)}
                                >
                                    {item}
                                </Dropdown.Item>
                            ))
                        ) : (
                            <Dropdown.Item disabled>Select Metric</Dropdown.Item>
                        )}
                    </DropdownButton>
                </Dropdown>
                <Card >{selectedMetric}</Card>
            </Col>

            {/* Taxonomy Dropdown 2 */}
            <Col xs={12} sm={6} md={2} className="dropdown-col">
                <Dropdown>
                    <DropdownButton variant="secondary" id="dropdown-2" title="Taxonomy">
                        {dropdownOptions && dropdownOptions.taxonomies && dropdownOptions.taxonomies.length > 0 ? (
                            dropdownOptions.taxonomies.map((item, index) => (
                                <Dropdown.Item key={index} as="div" onClick={(e) => {
                                    handleCheckboxToggleTaxonomy(item);
                                    e.stopPropagation()
                                }}>
                                    {/* Checkbox for each taxonomy item */}
                                    <Form.Check
                                        type="checkbox"
                                        id={`taxonomy-checkbox-${index}`}
                                        label={item}
                                        checked={selectedTaxonomies.includes(item)} // Checked state
                                        onChange={() => handleCheckboxToggleTaxonomy(item)} // Toggle handler
                                    />
                                </Dropdown.Item>
                            ))
                        ) : (
                            <Dropdown.Item disabled>No Taxonomies Available</Dropdown.Item>
                        )}
                    </DropdownButton>
                </Dropdown>
                <Card >---</Card>
            </Col>

            {/* Dropdown 3 */}
            <Col xs={12} sm={6} md={2} className="dropdown-col">
                <Dropdown>
                    <DropdownButton variant="secondary" id="dropdown-3" title="Allow Alt.">
                        {dropdownOptions && dropdownOptions.allow_alternatives && dropdownOptions.allow_alternatives.length > 0 ? (
                            dropdownOptions.allow_alternatives.map((item, index) => (
                                <Dropdown.Item
                                    key={index}
                                    onClick={() => setSelectedAllowAlt(item)}
                                >
                                    {item}
                                </Dropdown.Item>
                            ))
                        ) : (
                            <Dropdown.Item disabled>Select Metric</Dropdown.Item>
                        )}
                    </DropdownButton>
                </Dropdown>
                <Card>{selectedAllowAlt}</Card>
            </Col>

            {/* Dropdown 4 */}
            <Col xs={12} sm={6} md={2} className="dropdown-col">
                <Dropdown>
                    <DropdownButton variant="secondary" id="dropdown-4" title="Dataset">
                        {dropdownOptions && dropdownOptions.datasets && dropdownOptions.datasets.length > 0 ? (
                            dropdownOptions.datasets.map((item, index) => (
                                <Dropdown.Item
                                    key={index}
                                    onClick={() => setSelectedDataset(item)}
                                >
                                    {item}
                                </Dropdown.Item>
                            ))
                        ) : (
                            <Dropdown.Item disabled>Select Metric</Dropdown.Item>
                        )}
                    </DropdownButton>
                </Dropdown>
                <Card>{selectedDataset}</Card>
            </Col>

            {/* Tool dropdown 5 */}
            <Col xs={12} sm={6} md={2} className="dropdown-col">
                <Dropdown>
                    <DropdownButton variant="secondary" id="dropdown-2" title="Tool">
                        {dropdownOptions && dropdownOptions.tools && dropdownOptions.tools.length > 0 ? (
                            dropdownOptions.tools.map((item, index) => (
                                <Dropdown.Item key={index} as="div" onClick={(e) => {
                                    handleCheckboxToggleTools(item);
                                    e.stopPropagation()
                                }}>
                                    {/* Checkbox for each taxonomy item */}
                                    <Form.Check
                                        type="checkbox"
                                        id={`taxonomy-checkbox-${index}`}
                                        label={item}
                                        checked={selectedTools.includes(item)} // Checked state
                                        onChange={() => handleCheckboxToggleTools(item)} // Toggle handler
                                    />
                                </Dropdown.Item>
                            ))
                        ) : (
                            <Dropdown.Item disabled>No Taxonomies Available</Dropdown.Item>
                        )}
                    </DropdownButton>
                </Dropdown>
                <Card >--</Card>
            </Col>

            {/* Dropdown 6 */}
            <Col xs={12} sm={6} md={2} className="dropdown-col">
                <Dropdown>
                    <DropdownButton variant="secondary" id="dropdown-6" title="Rank">
                        {dropdownOptions && dropdownOptions.ranks && dropdownOptions.ranks.length > 0 ? (
                            dropdownOptions.ranks.map((item, index) => (
                                <Dropdown.Item
                                    key={index}
                                    onClick={() => setSelectedRank(item)}
                                >
                                    {item}
                                </Dropdown.Item>
                            ))
                        ) : (
                            <Dropdown.Item disabled>Select Metric</Dropdown.Item>
                        )}
                    </DropdownButton>
                </Dropdown>
                <Card>{selectedRank}</Card>
            </Col>
        </Row>
    );
}



export function DetailedGrid({ dataDetailed, width }: { dataDetailed: any[], width: number }) {
    // Initialize the state for the grid data
    const columnsToDisplay = ['Name', 'Type', 'PredictionAbundance', 'GoldStdAbundance', 'PredictionCount', 'GoldStdCount'];
    
    // Subset the data
    const filteredRows = dataDetailed.map((row: any) => {
        const arr = columnsToDisplay.map((column) => {
            if (!row[column].includes(".")) {
                return row[column];
            }
            const parsedFloat = parseFloat(row[column]);
            if (!isNaN(parsedFloat)) {
                return parsedFloat.toFixed(5);
            }
          row[column]
        });
        const type = arr[1];
        arr.push(type === 'FN' ? arr[3] : type === 'FP' ? arr[2] : '-');
        arr.push(type === 'TP' ? 'True' : 'False');
        return arr;
    });
    const columns = columnsToDisplay.concat(["Abundance", "Correct"]);

    return (
        <div className="parent-container">
        <Grid
            className={{
                table: "table table-striped table-hover",
                thead: "table-light",
                td: "align-middle",
                header: "gridjs-sort gridjs-sort-neutral"
            }}
            data={filteredRows}
            columns={columns}
            sort={true}
            search={true}
            resizable={true}
            width={width.toString()+'px'}
        />
        </div>
    )
}
