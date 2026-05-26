import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Checkbox,
  Form,
  Input,
  Loader,
  SelectPicker,
  TagInput,
  Toggle,
} from 'rsuite';
import { apiUrl } from '../../../../envConfig';
import { AuthContext } from '../../../AuthContextProvider';
import AmenitiesModal from '../../../components/adminComponents/AmenitiesModal';
import AreaModal from '../../../components/adminComponents/AreaModal';
import CityModal from '../../../components/adminComponents/CityModal';
import NearbyLocationsModal from '../../../components/adminComponents/NearbyLocationsModal';
import PropertyTypesModal from '../../../components/adminComponents/PropertyTypesModal';
import StateModal from '../../../components/adminComponents/StateModal';
import DataLoader from '../../../components/sharedComponents/DataLoader';
import {
  occupancyTypeOptions,
  rentFrequencyOptions,
  sharingTypeOptions,
} from '../../../consonants/propertyOptions';

function addProperty() {
  const { authData } = useContext(AuthContext);

  // Form State
  const [formValue, setFormValue] = useState({
    property_name: '',
    state_id: null,
    city_id: null,
    area_id: null,
    property_type_id: null,
    property_description: '',
    property_price: '',
    property_address: '',
    property_rent_frequency: '', // e.g., 'daily', 'monthly', etc.
    sharing_type: '',
    occupancy_type: '',
    no_of_rooms: '', // or number
    no_of_bathrooms: '', // or number
    year_built: '', // or number (year)
    map_link: '', //string map link
    status: '', // e.g., 'active', 'inactive'
    is_property_favourite: false, // boolean
    has_multiple_pricing: false, // New field
    amenities: [], // array of selected amenity IDs, e.g. [1,3,5]
    nearby_locations: [], // array of selected nearby location IDs, e.g. [2,4]
    property_image: [], // array of File objects from <input type="file" multiple/>
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
  });

  // Multiple pricing state
  const [multiplePricings, setMultiplePricings] = useState([
    {
      property_rent: '',
      property_rent_frequency: '',
      sharing_type: '',
      occupancy_type: '',
    },
  ]);

  // Select Data
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [propertyTypesList, setPropertyTypesList] = useState([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previews, setPreviews] = useState([]);
  const [addLoader, setAddLoader] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Modals
  const [openModal, setOpenModal] = useState({
    state: false,
    city: false,
    area: false,
    propertyType: false,
    amenities: false,
    nearbyLocations: false,
  });

  const [editModal, setEditModal] = useState({
    state: false,
    city: false,
    area: false,
    propertyType: false,
    amenities: false,
    nearbyLocations: false,
  });

  // Multiple pricing handlers
  const addMultiplePricing = () => {
    setMultiplePricings([
      ...multiplePricings,
      {
        property_rent: '',
        property_rent_frequency: '',
        sharing_type: '',
        occupancy_type: '',
      },
    ]);
  };

  const removeMultiplePricing = (index) => {
    if (multiplePricings.length > 1) {
      setMultiplePricings(multiplePricings.filter((_, i) => i !== index));
    }
  };

  const handleMultiplePricingChange = (index, field, value) => {
    const updated = multiplePricings.map((pricing, i) =>
      i === index ? { ...pricing, [field]: value } : pricing
    );
    setMultiplePricings(updated);
  };

  const handleToggleMultiplePricing = (checked) => {
    setFormValue((prev) => ({ ...prev, has_multiple_pricing: checked }));
    if (checked && multiplePricings.length === 0) {
      setMultiplePricings([
        {
          property_rent: '',
          property_rent_frequency: '',
          sharing_type: '',
          occupancy_type: '',
        },
      ]);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (formValue.state_id) {
      fetchCities(formValue.state_id);
      setFormValue((prev) => ({ ...prev, city_id: null, area_id: null }));
    } else {
      setCityList([]);
      setAreaList([]);
      setFormValue((prev) => ({ ...prev, city_id: null, area_id: null }));
    }
  }, [formValue.state_id]);

  // Fetch areas when city changes
  useEffect(() => {
    if (formValue.city_id) {
      fetchAreas(formValue.city_id);
      setFormValue((prev) => ({ ...prev, area_id: null }));
    } else {
      setAreaList([]);
      setFormValue((prev) => ({ ...prev, area_id: null }));
    }
  }, [formValue.city_id]);

  // API: All States
  const fetchStates = () => {
    fetch(`${apiUrl}admin/get-all-states`, {
      headers: {
        Accept: 'application/json',
        Authorization: authData.token,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status) {
          const options = json.data.data.map((s) => ({
            value: s.id,
            label: s.state_name,
          }));
          setStateList(options);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        get_all_property_types();
      });
  };

  // API: Get Cities by State
  const fetchCities = (state_id) => {
    fetch(`${apiUrl}admin/get-city-by-state/${state_id}`, {
      headers: {
        Accept: 'application/json',
        Authorization: authData.token,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status) {
          const options = json.data.map((c) => ({
            value: c.id,
            label: c.city_name,
          }));
          setCityList(options);
        }
      });
  };

  // API: Get Areas by City
  const fetchAreas = (city_id) => {
    fetch(`${apiUrl}admin/get-area-by-city/${city_id}`, {
      headers: {
        Accept: 'application/json',
        Authorization: authData.token,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status) {
          const options = json.data.map((a) => ({
            value: a.id,
            label: a.area_name,
          }));
          setAreaList(options);
        }
      });
  };

  // API: Property Types
  const get_all_property_types = () => {
    fetch(apiUrl + 'admin/get-all-property-types', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          const options = json.data.map((s) => ({
            value: s.id,
            label: s.name,
          }));
          setPropertyTypesList(options);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        get_all_amenities();
      });
  };

  // API: Amenities
  const get_all_amenities = () => {
    fetch(apiUrl + 'admin/get-all-amenities', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setAmenities(json.data);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        get_all_nearby_locations();
      });
  };

  // API: Nearby Facilities
  const get_all_nearby_locations = () => {
    fetch(apiUrl + 'admin/get-all-nearby-locations', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setNearbyLocations(json.data);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // After modal closes, refresh lists
  const handleModalComplete = (type) => {
    if (type === 'state') fetchStates();
    if (type === 'city' && formValue.state_id) fetchCities(formValue.state_id);
    if (type === 'area' && formValue.city_id) fetchAreas(formValue.city_id);
    setOpenModal((prev) => ({ ...prev, [type]: false }));
    setEditModal((prev) => ({ ...prev, [type]: false }));
  };

  const handleOpen = (type, isEdit = false) => {
    setOpenModal((prev) => ({ ...prev, [type]: true }));
    setEdit((prev) => ({ ...prev, [type]: isEdit }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // Combine previous and new uploads, limit to 5
    const newFiles = [...formValue.property_image, ...files].slice(0, 5);

    setFormValue((prev) => ({
      ...prev,
      property_image: newFiles,
    }));

    // Generate previews for all selected files (max 5)
    const readers = newFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then(setPreviews);
  };

  const handleRemoveImage = (idx) => {
    setFormValue((prev) => ({
      ...prev,
      property_image: prev.property_image.filter((_, i) => i !== idx),
    }));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddLoader(true);

    // Build FormData
    const formData = new FormData();
    formData.append('property_title', formValue.property_name);
    formData.append('property_description', formValue.property_description);
    formData.append(
      'property_street_address',
      formValue.property_address || ''
    );
    formData.append('state_id', formValue.state_id);
    formData.append('city_id', formValue.city_id);
    formData.append('area_id', formValue.area_id);
    formData.append('property_type', formValue.property_type_id);

    // Handle multiple pricing
    formData.append(
      'has_multiple_pricing',
      formValue.has_multiple_pricing ? '1' : '0'
    );

    if (formValue.has_multiple_pricing) {
      // Add multiple pricing data
      multiplePricings.forEach((pricing, index) => {
        formData.append(
          `multiple_pricings[${index}][property_rent]`,
          pricing.property_rent
        );
        formData.append(
          `multiple_pricings[${index}][property_rent_frequency]`,
          pricing.property_rent_frequency
        );
        formData.append(
          `multiple_pricings[${index}][sharing_type]`,
          pricing.sharing_type
        );
        formData.append(
          `multiple_pricings[${index}][occupancy_type]`,
          pricing.occupancy_type
        );
      });
    }
    formData.append('property_rent', formValue.property_price);
    formData.append(
      'property_rent_frequency',
      formValue.property_rent_frequency ?? 'daily'
    );
    formData.append('sharing_type', formValue.sharing_type ?? '');
    formData.append('occupancy_type', formValue.occupancy_type ?? '');

    formData.append('no_of_rooms', formValue.no_of_rooms ?? 0);
    formData.append('no_of_bathrooms', formValue.no_of_bathrooms ?? 0);
    formData.append('year_built', formValue.year_built ?? 2000);
    formData.append('map', formValue.map_link);
    formData.append('status', formValue.status ?? 'active');
    formData.append(
      'is_property_favourite',
      formValue.is_property_favourite ? 1 : 0
    );
    formData.append('is_main', mainImageIndex);
    formData.append('meta_title', formValue.meta_title);
    formData.append('meta_description', formValue.meta_description);

    formValue.meta_keywords.forEach((keyword) => {
      formData.append('meta_keywords[]', keyword);
    });

    // Amenities and Nearby locations as array fields
    formValue.amenities.forEach((id) => {
      formData.append('amenities[]', id);
    });
    formValue.nearby_locations.forEach((id) => {
      formData.append('nearby_locations[]', id);
    });

    // Add images
    if (formValue.property_image.length) {
      formValue.property_image.forEach((file) => {
        formData.append('images[]', file);
      });
    }

    try {
      const response = await fetch(apiUrl + 'admin/add-new-property', {
        method: 'POST',
        headers: {
          Authorization: authData.token,
          Accept: 'application/json',
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(result.message);
        // Optionally redirect or reset form
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setAddLoader(false);
    }
  };

  const handleAmenityChange = (value, checked) => {
    setFormValue((prev) => {
      let updated = checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((id) => id !== value);
      return { ...prev, amenities: updated };
    });

    // If you want to mark amenities as checked in the amenities array (optional):
    setAmenities((prev) =>
      prev.map((item) =>
        item.id === value ? { ...item, checked: checked } : item
      )
    );
  };

  const handleNearbyLocationsChange = (value, checked) => {
    setFormValue((prev) => {
      let updated = checked
        ? [...prev.nearby_locations, value]
        : prev.nearby_locations.filter((id) => id !== value);
      return { ...prev, nearby_locations: updated };
    });

    // If you want to mark as checked in the source array:
    setNearbyLocations((prev) =>
      prev.map((item) =>
        item.id === value ? { ...item, checked: checked } : item
      )
    );
  };

  if (loading) {
    return <DataLoader />;
  }

  return (
    <>
      <div className="row">
        <div className="col-lg-12 d-flex align-items-center justify-content-between mb-4">
          <h2 className="breadcrumb_title">Add New Property</h2>
          <button
            type="submit"
            className="btn btn-thm"
            onClick={(e) => {
              handleSubmit(e);
            }}
            disabled={addLoader}
          >
            {addLoader ? (
              <div className="d-flex align-items-center">
                <Loader />
                <span className="ml-2">Adding Property...</span>
              </div>
            ) : (
              'Add This Property'
            )}
          </button>
        </div>
      </div>
      <div className="my_dashboard_review">
        <Form fluid>
          <div className="row">
            <div className="col-lg-12 mb-3">
              <h5>
                <u>Basic Information</u>
              </h5>
            </div>
            <div className="col-lg-12 mb-3">
              <Form.Group controlId="propertyTitle">
                <Form.ControlLabel>
                  Property Title
                  <span className="text-danger">*</span>
                </Form.ControlLabel>
                <Input
                  placeholder="Property Title"
                  value={formValue.property_name}
                  onChange={(e) =>
                    setFormValue((prev) => ({
                      ...prev,
                      property_name: e,
                    }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-12">
              <Form.Group controlId="propertyDescription">
                <Form.ControlLabel>
                  Property Description
                  <span className="text-danger">*</span>
                </Form.ControlLabel>
                <Input
                  as="textarea"
                  rows={4}
                  placeholder="Property Description"
                  value={formValue.property_description}
                  onChange={(e) =>
                    setFormValue((prev) => ({
                      ...prev,
                      property_description: e,
                    }))
                  }
                />
              </Form.Group>
            </div>
            <hr />
            <div className="col-lg-12 mb-3">
              <h5>
                <u>Address</u>
              </h5>
            </div>
            <div className="col-lg-12 mb-3">
              <Form.Group controlId="address">
                <Form.ControlLabel>Street Address</Form.ControlLabel>
                <Input
                  placeholder="Enter Street Address"
                  value={formValue.property_address}
                  onChange={(e) =>
                    setFormValue((prev) => ({ ...prev, property_address: e }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-12 mb-3">
              <Form.Group controlId="address">
                <Form.ControlLabel>
                  Map Link<span className="text-danger">*</span>
                </Form.ControlLabel>
                <Input
                  placeholder="Enter Map Link"
                  value={formValue.map_link}
                  onChange={(e) =>
                    setFormValue((prev) => ({ ...prev, map_link: e }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-4">
              <Form.Group controlId="state">
                <Form.ControlLabel className="d-flex align-items-center justify-content-between">
                  <span>
                    State
                    <span className="text-danger">*</span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link"
                    onClick={() => handleOpen('state')}
                  >
                    Add State
                  </button>
                </Form.ControlLabel>
                <SelectPicker
                  name="state_id"
                  data={stateList}
                  value={formValue.state_id}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, state_id: val }))
                  }
                  placeholder="Select State"
                  block
                  searchable
                  cleanable
                />
              </Form.Group>
            </div>
            <div className="col-lg-4">
              <Form.Group controlId="city">
                <Form.ControlLabel className="d-flex align-items-center justify-content-between">
                  <span>
                    City
                    <span className="text-danger">*</span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link"
                    onClick={() => handleOpen('city')}
                  >
                    Add City
                  </button>
                </Form.ControlLabel>
                <SelectPicker
                  name="city_id"
                  data={cityList}
                  value={formValue.city_id}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, city_id: val }))
                  }
                  disabled={!formValue.state_id}
                  placeholder="Select City"
                  block
                  searchable
                  cleanable
                />
              </Form.Group>
            </div>
            <div className="col-lg-4">
              <Form.Group controlId="area">
                <Form.ControlLabel className="d-flex align-items-center justify-content-between">
                  <span>
                    Area
                    <span className="text-danger">*</span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link"
                    onClick={() => handleOpen('area')}
                  >
                    Add Area
                  </button>
                </Form.ControlLabel>
                <SelectPicker
                  name="area_id"
                  data={areaList}
                  value={formValue.area_id}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, area_id: val }))
                  }
                  disabled={!formValue.city_id}
                  placeholder="Select Area"
                  block
                  searchable
                  cleanable
                />
              </Form.Group>
            </div>
            <hr />
            <div className="col-lg-12 mb-3">
              <h5>
                <u>Property Details</u>
              </h5>
            </div>
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="rental">
                <Form.ControlLabel className="d-flex align-items-center justify-content-between">
                  <span>
                    Rental
                    <span className="text-danger">*</span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link"
                    style={{ visibility: 'hidden' }}
                  >
                    Add Property Type
                  </button>
                </Form.ControlLabel>
                <div className="row">
                  <div className="col-lg-7">
                    <Input
                      placeholder="Amount"
                      value={formValue.property_price}
                      onChange={(val) =>
                        setFormValue((fv) => ({ ...fv, property_price: val }))
                      }
                    />
                  </div>
                  <div className="col-lg-5">
                    <SelectPicker
                      data={rentFrequencyOptions}
                      placeholder="Frequency"
                      block
                      searchable={false}
                      cleanable
                      value={formValue.property_rent_frequency}
                      onChange={(val) =>
                        setFormValue((fv) => ({
                          ...fv,
                          property_rent_frequency: val,
                        }))
                      }
                    />
                  </div>
                </div>
              </Form.Group>
            </div>
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="propertyType">
                <Form.ControlLabel className="d-flex align-items-center justify-content-between">
                  <span>
                    Property Type
                    <span className="text-danger">*</span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link"
                    onClick={() => {
                      handleOpen('propertyType');
                      setSelectedPropertyType(null);
                    }}
                  >
                    Add Property Type
                  </button>
                </Form.ControlLabel>
                <SelectPicker
                  data={propertyTypesList}
                  placeholder="Select Type"
                  block
                  searchable
                  cleanable
                  value={formValue.property_type_id}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, property_type_id: val }))
                  }
                />
              </Form.Group>
            </div>
            {/* <div className="col-lg-4 mb-3">
              <Form.Group controlId="rooms">
                <Form.ControlLabel>No. of Rooms</Form.ControlLabel>
                <Input
                  placeholder="Enter Number of Rooms"
                  value={formValue.no_of_rooms}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, no_of_rooms: val }))
                  }
                />
              </Form.Group>
            </div> */}
            {/* <div className="col-lg-4 mb-3">
              <Form.Group controlId="bathrooms">
                <Form.ControlLabel>No. of Bathrooms</Form.ControlLabel>
                <Input
                  placeholder="Enter Number of Bathrooms"
                  value={formValue.no_of_bathrooms}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, no_of_bathrooms: val }))
                  }
                />
              </Form.Group>
            </div> */}
            <div className="col-lg-3">
              <Form.Group controlId="sharingType">
                <Form.ControlLabel>
                  Sharing Type
                  <span className="text-danger">*</span>
                </Form.ControlLabel>
                <SelectPicker
                  data={sharingTypeOptions}
                  value={formValue.sharing_type}
                  onChange={(value) =>
                    setFormValue((fv) => ({ ...fv, sharing_type: value }))
                  }
                  placeholder="Select sharing type"
                  style={{ width: '100%' }}
                />
              </Form.Group>
            </div>
            <div className="col-lg-3">
              <Form.Group controlId="occupancyType">
                <Form.ControlLabel>
                  Occupancy Type
                  <span className="text-danger">*</span>
                </Form.ControlLabel>
                <SelectPicker
                  data={occupancyTypeOptions}
                  value={formValue.occupancy_type}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, occupancy_type: val }))
                  }
                  placeholder="Select occupancy type"
                  style={{ width: '100%' }}
                />
              </Form.Group>
            </div>
            <div className="col-lg-3">
              <Form.Group controlId="status">
                <Form.ControlLabel>
                  Status
                  <span className="text-danger">*</span>
                </Form.ControlLabel>{' '}
                <SelectPicker
                  data={
                    [
                      { label: 'Active', value: 'active' },
                      { label: 'Inactive', value: 'inactive' },
                      { label: 'Draft', value: 'draft' },
                    ] || []
                  }
                  placeholder="Select Status"
                  block
                  searchable={false}
                  cleanable
                  value={formValue.status}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, status: val }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-3 mb-3">
              <Form.Group controlId="year">
                <Form.ControlLabel>Year Build</Form.ControlLabel>
                <Input
                  placeholder="Enter Year Build"
                  value={formValue.year_built}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, year_built: val }))
                  }
                />
              </Form.Group>
            </div>

            <div className="col-lg-3">
              <Form.Group controlId="status">
                <Form.ControlLabel>
                  Pricing Options
                  <span className="text-danger">*</span>
                </Form.ControlLabel>{' '}
                <Toggle
                  checked={formValue.has_multiple_pricing}
                  onChange={handleToggleMultiplePricing}
                >
                  Has Multiple Pricing
                </Toggle>
              </Form.Group>
            </div>

            {formValue.has_multiple_pricing && (
              <>
                <hr />
                <div className="col-lg-12 mt-3">
                  <div className="multiple-pricing-section">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Multiple Pricing Options</h5>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={addMultiplePricing}
                      >
                        + Add Pricing Option
                      </button>
                    </div>

                    {multiplePricings.map((pricing, index) => (
                      <div
                        key={index}
                        className="pricing-option-card p20 mb20 border rounded"
                      >
                        <div className="d-flex justify-content-between align-items-center mb15">
                          <h6>Pricing Option {index + 1}</h6>
                          {multiplePricings.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => removeMultiplePricing(index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="row">
                          <div className="col-lg-6 mb-3">
                            <Form.Group controlId="rentalAmount">
                              <Form.ControlLabel>
                                Rental Amount
                                <span className="text-danger">*</span>
                              </Form.ControlLabel>
                              <Input
                                placeholder="Rental Amount"
                                type="number"
                                name="rentalAmount"
                                value={pricing.property_rent}
                                onChange={(value) =>
                                  handleMultiplePricingChange(
                                    index,
                                    'property_rent',
                                    value
                                  )
                                }
                              />
                            </Form.Group>
                          </div>
                          <div className="col-lg-6 mb-3">
                            <Form.Group controlId="rentalFrequency">
                              <Form.ControlLabel>
                                Rental Frequency
                                <span className="text-danger">*</span>
                              </Form.ControlLabel>

                              <SelectPicker
                                data={rentFrequencyOptions}
                                placeholder="Frequency"
                                block
                                searchable={false}
                                cleanable
                                name="rentalFrequency"
                                value={pricing.property_rent_frequency}
                                onChange={(value) =>
                                  handleMultiplePricingChange(
                                    index,
                                    'property_rent_frequency',
                                    value
                                  )
                                }
                              />
                            </Form.Group>
                          </div>
                          <div className="col-lg-6 mb-3">
                            <Form.Group controlId="sharingType">
                              <Form.ControlLabel>
                                Sharing Type
                                <span className="text-danger">*</span>
                              </Form.ControlLabel>
                              <SelectPicker
                                data={sharingTypeOptions}
                                value={pricing.sharing_type}
                                onChange={(value) =>
                                  handleMultiplePricingChange(
                                    index,
                                    'sharing_type',
                                    value
                                  )
                                }
                                name="sharingType"
                                placeholder="Select sharing type"
                                style={{ width: '100%' }}
                              />
                            </Form.Group>
                          </div>
                          <div className="col-lg-6 mb-3">
                            <Form.Group controlId="occupancyType">
                              <Form.ControlLabel>
                                Occupancy Type
                                <span className="text-danger">*</span>
                              </Form.ControlLabel>

                              <SelectPicker
                                data={occupancyTypeOptions}
                                value={pricing.occupancy_type}
                                onChange={(value) =>
                                  handleMultiplePricingChange(
                                    index,
                                    'occupancy_type',
                                    value
                                  )
                                }
                                name="occupancyType"
                                placeholder="Select occupancy type"
                                style={{ width: '100%' }}
                              />
                            </Form.Group>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <hr />
            <div className="col-lg-12 mb-3 d-flex align-items-center justify-content-between">
              <h5>
                <u>Amenities</u>
                <span className="text-danger">*</span>
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-link"
                onClick={() => {
                  handleOpen('amenities');
                  setSelectedAmenity(null);
                }}
              >
                Add Amenities
              </button>
            </div>
            {amenities.map((amenities, index) => (
              <div className="col-lg-2 mb-2" key={index}>
                <Checkbox
                  value={amenities.id}
                  checked={formValue.amenities.includes(amenities.id)}
                  onChange={handleAmenityChange}
                >
                  {amenities.name}
                </Checkbox>
              </div>
            ))}
            <hr />
            <div className="col-lg-12 mb-3 d-flex align-items-center justify-content-between">
              <h5>
                <u>Nearby Facilities</u>
                <span className="text-danger">*</span>
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-link"
                onClick={() => {
                  handleOpen('nearbyLocations');
                  setSelectedNearbyLocations(null);
                }}
              >
                Add Nearby Facilities
              </button>
            </div>
            {nearbyLocations.map((nearbyLocations, index) => (
              <div className="col-lg-2 mb-2" key={index}>
                <Checkbox
                  value={nearbyLocations.id}
                  checked={formValue.nearby_locations.includes(
                    nearbyLocations.id
                  )}
                  onChange={handleNearbyLocationsChange}
                >
                  {nearbyLocations.nearby_location_name}
                </Checkbox>
              </div>
            ))}
            <hr />
            <div className="col-lg-12 mb-3">
              <Form.Group controlId="propertyImages">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Form.ControlLabel>
                    <u>Property Media</u> <span className="text-danger">*</span>
                  </Form.ControlLabel>
                  {/* Dropdown for selecting Main Image */}
                  {previews.length > 0 && (
                    <div style={{ marginLeft: 20 }}>
                      <label style={{ marginRight: 6, color: '#444' }}>
                        Main Image:
                      </label>
                      <select
                        value={mainImageIndex}
                        onChange={(e) =>
                          setMainImageIndex(Number(e.target.value))
                        }
                        style={{
                          fontWeight: 600,
                          color: '#0747a6',
                          border: '1px solid #888',
                          borderRadius: 4,
                          padding: '2px 8px',
                          minWidth: 40,
                        }}
                      >
                        {previews.map((_, idx) => (
                          <option key={idx} value={idx}>
                            {idx + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Images Preview below */}
                <div className="upload-img-container">
                  {previews.map((src, idx) => (
                    <div
                      key={idx}
                      className={`upload-img-preview-box ${
                        mainImageIndex === idx ? 'main-image-border' : ''
                      }`}
                      style={{
                        position: 'relative',
                        border:
                          mainImageIndex === idx
                            ? '3px solid #0070f3'
                            : '1px solid #eee',
                      }}
                    >
                      <button
                        type="button"
                        title="Remove"
                        className="upload-img-remove-btn"
                        onClick={() => {
                          handleRemoveImage(idx);
                          if (mainImageIndex === idx) {
                            setMainImageIndex(0);
                          } else if (mainImageIndex > idx) {
                            setMainImageIndex((prev) => prev - 1);
                          }
                        }}
                      >
                        &times;
                      </button>
                      <img src={src} alt={`Preview ${idx + 1}`} />
                    </div>
                  ))}
                  {formValue.property_image.length < 5 && (
                    <label className="upload-img-uploader-label">
                      +
                      <input
                        type="file"
                        name="images[]"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        disabled={formValue.property_image.length >= 5}
                      />
                    </label>
                  )}
                </div>

                <small
                  className="text-muted"
                  style={{ marginTop: 5, display: 'block' }}
                >
                  Max 5 images. Only images allowed.
                </small>
              </Form.Group>
            </div>
            <hr />
            <div className="col-lg-12 mb-3">
              <h5>
                <u>Meta Information</u>
              </h5>
            </div>
            <div className="col-lg-12 mb-3">
              <Form.Group controlId="metaTitle">
                <Form.ControlLabel>
                  Meta Title
                  <span className="text-danger">*</span>
                </Form.ControlLabel>
                <Input
                  placeholder="Meta Title"
                  value={formValue.meta_title}
                  onChange={(e) =>
                    setFormValue((prev) => ({
                      ...prev,
                      meta_title: e,
                    }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-12 mb-3">
              <Form.Group controlId="metaDescription">
                <Form.ControlLabel>
                  Meta Description
                  <span className="text-danger">*</span>
                </Form.ControlLabel>
                <Input
                  as="textarea"
                  rows={2}
                  placeholder="Meta Description"
                  value={formValue.meta_description}
                  onChange={(e) =>
                    setFormValue((prev) => ({
                      ...prev,
                      meta_description: e,
                    }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-12">
              <Form.Group controlId="metaKeywords">
                <Form.ControlLabel>
                  Meta Keywords
                  <span className="text-danger">*</span>
                </Form.ControlLabel>
                <TagInput
                  trigger={['Enter', 'Space', 'Comma']}
                  placeholder="Meta Keywords"
                  style={{ width: '100%' }}
                  value={formValue.meta_keywords}
                  onChange={(e) =>
                    setFormValue((prev) => ({
                      ...prev,
                      meta_keywords: e,
                    }))
                  }
                />
              </Form.Group>
            </div>
            <hr />
            <div className="col-lg-12 d-flex align-items-center justify-content-end">
              <button
                type="submit"
                className="btn btn-thm"
                onClick={(e) => {
                  handleSubmit(e);
                }}
                disabled={addLoader}
              >
                {addLoader ? (
                  <div className="d-flex align-items-center">
                    <Loader />
                    <span className="ml-2">Adding Property...</span>
                  </div>
                ) : (
                  'Add This Property'
                )}
              </button>
            </div>
          </div>
        </Form>
      </div>

      {/* state modal */}
      <StateModal
        openStateModal={openModal.state}
        setOpenStateModal={(s) =>
          setOpenModal((prev) => ({ ...prev, state: s }))
        }
        edit={{ editing: editModal.state, data: null }}
        // properties from your implementation
        onComplete={() => handleModalComplete('state')}
      />

      {/* City Modal */}
      <CityModal
        openCityModal={openModal.city}
        setOpenCityModal={(s) => setOpenModal((prev) => ({ ...prev, city: s }))}
        edit={{ editing: editModal.city, data: null }}
        token={authData.token}
        // pass props as per your requirements
        onComplete={() => handleModalComplete('city')}
        stateList={stateList}
      />

      {/* Area Modal */}
      <AreaModal
        openAreaModal={openModal.area}
        setOpenAreaModal={(s) => setOpenModal((prev) => ({ ...prev, area: s }))}
        edit={{ editing: editModal.area, data: null }}
        token={authData.token}
        // pass props as required
        onComplete={() => handleModalComplete('area')}
        stateList={stateList}
      />

      {/* Property Types Modal */}
      <PropertyTypesModal
        open={openModal.propertyType}
        onClose={() =>
          setOpenModal((prev) => ({ ...prev, propertyType: false }))
        }
        edit={editModal.propertyType}
        propertyType={selectedPropertyType}
        get_all_property_types={get_all_property_types}
      />

      {/* amenities modal */}
      <AmenitiesModal
        openAmenitiesModal={openModal.amenities}
        setOpenAmenitiesModal={() =>
          setOpenModal((prev) => ({ ...prev, amenities: false }))
        }
        edit={editModal.amenities}
        get_all_amenities={get_all_amenities}
      />

      {/* nearby locations modal */}
      <NearbyLocationsModal
        openAmenitiesModal={openModal.nearbyLocations}
        setOpenAmenitiesModal={() =>
          setOpenModal((prev) => ({ ...prev, nearbyLocations: false }))
        }
        edit={editModal.nearbyLocations}
        get_all_nearby_locations={get_all_nearby_locations}
      />
    </>
  );
}

export default addProperty;
