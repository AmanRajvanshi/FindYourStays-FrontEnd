import { Form, Modal, SelectPicker } from 'rsuite';

function FilterModal({
  open,
  setOpen,
  data, // cities data
  propertyTypes,
  priceRanges,
  sharingTypeOptions, // Updated from availabilityData
  occupancyTypeOptions, // Updated from sharingOptions
  areas,
  // Current values
  propertyType,
  setPropertyType,
  city,
  setCity,
  selectedArea,
  setSelectedArea,
  priceRange,
  setPriceRange,
  sharingType, // Updated from availability
  setSharingType, // Updated from setAvailability
  occupancyType, // Updated from sharing
  setOccupancyType, // Updated from setSharing
}) {
  const handleApply = () => {
    setOpen(false);
  };

  const handleClear = () => {
    setPriceRange('');
    setSharingType('');
    setOccupancyType('');
    setSelectedArea('');
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} size="xs">
      <Modal.Header>
        <Modal.Title>Filter Properties</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form fluid>
          <Form.Group controlId="type">
            <Form.ControlLabel>
              Property Type <span className="text-danger">*</span>
            </Form.ControlLabel>
            <SelectPicker
              data={propertyTypes || []}
              style={{ width: '100%' }}
              placeholder="Select Property Type"
              value={propertyType}
              onChange={setPropertyType}
              cleanable={false}
            />
          </Form.Group>

          <Form.Group controlId="city">
            <Form.ControlLabel>City</Form.ControlLabel>
            <SelectPicker
              data={data || []}
              style={{ width: '100%' }}
              placeholder="Select City"
              value={city}
              onChange={setCity}
              cleanable={false}
            />
          </Form.Group>

          {areas.length > 0 && (
            <Form.Group controlId="area">
              <Form.ControlLabel>Area</Form.ControlLabel>
              <SelectPicker
                data={areas || []}
                style={{ width: '100%' }}
                placeholder="Select Area"
                value={selectedArea}
                onChange={setSelectedArea}
                cleanable
              />
            </Form.Group>
          )}

          <Form.Group controlId="price">
            <Form.ControlLabel>Price Range</Form.ControlLabel>
            <SelectPicker
              data={priceRanges || []}
              style={{ width: '100%' }}
              placeholder="Any Price Range"
              value={priceRange}
              onChange={setPriceRange}
              cleanable
            />
          </Form.Group>

          <Form.Group controlId="sharingType">
            <Form.ControlLabel>Sharing Type</Form.ControlLabel>
            <SelectPicker
              data={sharingTypeOptions || []}
              style={{ width: '100%' }}
              placeholder="Any Sharing Type"
              value={sharingType}
              onChange={setSharingType}
              cleanable
            />
          </Form.Group>

          <Form.Group controlId="occupancyType">
            <Form.ControlLabel>Occupancy Type</Form.ControlLabel>
            <SelectPicker
              data={occupancyTypeOptions || []}
              style={{ width: '100%' }}
              placeholder="Any Occupancy Type"
              value={occupancyType}
              onChange={setOccupancyType}
              cleanable
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-between w-100">
          <button className="btn btn-outline-secondary" onClick={handleClear}>
            Clear Filters
          </button>
          <div className="d-flex ">
            <button
              className="btn btn-thm"
              onClick={handleApply}
              disabled={!propertyType}
            >
              Apply
            </button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default FilterModal;
