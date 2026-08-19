import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router';
import {
  Checkbox,
  Form,
  Input,
  Loader,
  SelectPicker,
  TagInput,
  Toggle,
} from 'rsuite';
import { apiUrl, imageUrl } from '../../../envConfig';
import { AuthContext } from '../../../AuthContextProvider';
import AmenitiesModal from '../../../components/adminComponents/AmenitiesModal';
import AreaModal from '../../../components/adminComponents/AreaModal';
import CityModal from '../../../components/adminComponents/CityModal';
import NearbyLocationsModal from '../../../components/adminComponents/NearbyLocationsModal';
import PropertyTypesModal from '../../../components/adminComponents/PropertyTypesModal';
import StateModal from '../../../components/adminComponents/StateModal';
import DataLoader from '../../../components/sharedComponents/DataLoader';
import Button from '../../../components/ui/Button';
import {
  occupancyTypeOptions,
  rentFrequencyOptions,
  sharingTypeOptions,
} from '../../../consonants/propertyOptions';

function EditProperty() {
  const { authData } = useContext(AuthContext);
  const { slug } = useParams();
  const navigate = useNavigate();

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
    property_rent_frequency: '',
    sharing_type: '',
    occupancy_type: '',
    no_of_rooms: '',
    no_of_bathrooms: '',
    year_built: '',
    map_link: '',
    status: '',
    is_property_favourite: false,
    has_multiple_pricing: false,
    amenities: [],
    nearby_locations: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
  });

  // Multiple pricing state
  const [multiplePricings, setMultiplePricings] = useState([]);

  // Lists & selectors
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [propertyTypesList, setPropertyTypesList] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Image state
  const [existingImages, setExistingImages] = useState([]); // {id, image_path}
  const [newImages, setNewImages] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // srcs from existing + File objects
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [propertyId, setPropertyId] = useState(null);
  const [addLoader, setAddLoader] = useState(false);

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
    if (authData?.token) {
      fetchStates();
    }
  }, [authData]);

  // Fetch all states
  const fetchStates = async () => {
    try {
      const res = await fetch(`${apiUrl}admin/get-all-states`, {
        headers: {
          Accept: 'application/json',
          Authorization: authData.token,
        },
      });
      const json = await res.json();
      if (json.status) {
        const options = json.data.data.map((s) => ({
          value: s.id,
          label: s.state_name,
        }));
        setStateList(options);
      }
    } catch (err) {
      console.log(err);
    } finally {
      get_all_property_types();
    }
  };

  // Fetch cities for a state
  const fetchCities = async (state_id) => {
    if (!state_id) return setCityList([]);
    try {
      const res = await fetch(`${apiUrl}admin/get-city-by-state/${state_id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: authData.token,
        },
      });
      const json = await res.json();
      if (json.status) {
        const options = json.data.map((c) => ({
          value: c.id,
          label: c.city_name,
        }));
        setCityList(options);
      } else {
        setCityList([]);
      }
    } catch (err) {
      setCityList([]);
    }
  };

  // Fetch areas for a city
  const fetchAreas = async (city_id) => {
    if (!city_id) return setAreaList([]);
    try {
      const res = await fetch(`${apiUrl}admin/get-area-by-city/${city_id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: authData.token,
        },
      });
      const json = await res.json();
      if (json.status) {
        const options = json.data.map((a) => ({
          value: a.id,
          label: a.area_name,
        }));
        setAreaList(options);
      } else {
        setAreaList([]);
      }
    } catch (err) {
      setAreaList([]);
    }
  };

  // Fetch single property and linked selects
  useEffect(() => {
    async function loadSingleProperty() {
      if (!slug) return;
      if (!authData?.token) return;
      setLoading(true);

      try {
        const res = await fetch(
          `${apiUrl}admin/get-single-properties/${slug}`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: authData.token,
            },
          }
        );
        const json = await res.json();
        if (!json.success) {
          toast.error(json.message || 'Failed to fetch property');
          setLoading(false);
          return;
        }
        const p = json.property;

        setFormValue({
          property_name: p.property_title,
          state_id: p.state_id,
          city_id: p.city_id,
          area_id: p.area_id,
          property_type_id: p.property_type,
          property_description: p.property_description,
          property_price: p.property_rent,
          property_rent_frequency: p.property_rent_frequency,
          sharing_type: p.sharing_type,
          occupancy_type: p.occupancy_type,
          no_of_rooms: p.no_of_rooms?.toString() || '',
          no_of_bathrooms: p.no_of_bathrooms?.toString() || '',
          year_built: p.year_built?.toString() || '',
          map_link: p.map,
          status: p.status,
          is_property_favourite:
            p.is_property_favourite === '1' || p.is_property_favourite === 1,
          has_multiple_pricing:
            p.multiple_pricings && p.multiple_pricings.length > 0,
          amenities: p.amenities.map((a) => a.id),
          nearby_locations: p.nearby_locations.map((n) => ({
            nearby_location_id: n.id,
            name: n.pivot ? n.pivot.name : '',
            distance: n.pivot ? n.pivot.distance : '',
          })),
          property_address: p.property_street_address || '',
          meta_title: p.meta_title || '',
          meta_keywords: p.meta_keywords || [],
          meta_description: p.meta_description || '',
        });
        if (p.multiple_pricings && p.multiple_pricings.length > 0) {
          setMultiplePricings(
            p.multiple_pricings.map((mp) => ({
              property_rent: mp.property_rent,
              property_rent_frequency: mp.property_rent_frequency,
              sharing_type: mp.sharing_type,
              occupancy_type: mp.occupancy_type,
            }))
          );
        }
        setPropertyId(p.id);
        setExistingImages(p.images); // [{id, image_path, is_main}, ...]
        setPreviews(p.images.map((img) => `${imageUrl}${img.image_path}`));
        setMainImageIndex(
          Math.max(
            0,
            p.images.findIndex((img) => img.is_main === 1)
          )
        );
      } catch (err) {
        toast.error('Something went wrong while loading property');
      } finally {
        setLoading(false);
      }
    }
    loadSingleProperty();
    // eslint-disable-next-line
  }, [slug, authData]);

  // When state changes, fetch dependent cities
  useEffect(() => {
    if (formValue.state_id) {
      fetchCities(formValue.state_id);
      // setFormValue((prev) => ({
      //   ...prev,
      //   city_id: null,
      //   area_id: null,
      // }));
      setAreaList([]); // Clear areas, since city reset
    } else {
      setCityList([]);
      setAreaList([]);
      setFormValue((prev) => ({
        ...prev,
        city_id: null,
        area_id: null,
      }));
    }
  }, [formValue.state_id]);

  // When city changes, fetch dependent areas
  useEffect(() => {
    if (formValue.city_id) {
      fetchAreas(formValue.city_id);
      // <-- remove these lines that always clear area
      // setFormValue((prev) => ({
      //   ...prev,
      //   area_id: null,
      // }));
    } else {
      setAreaList([]);
      setFormValue((prev) => ({
        ...prev,
        area_id: null,
      }));
    }
  }, [formValue.city_id]);

  const handleModalComplete = (type) => {
    if (type === 'state') fetchStates();
    if (type === 'city' && formValue.state_id) fetchCities(formValue.state_id);
    if (type === 'area' && formValue.city_id) fetchAreas(formValue.city_id);
    setOpenModal((prev) => ({ ...prev, [type]: false }));
    setEditModal((prev) => ({ ...prev, [type]: false }));
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

  const handleOpen = (type, isEdit = false) => {
    setOpenModal((prev) => ({ ...prev, [type]: true }));
    setEdit((prev) => ({ ...prev, [type]: isEdit }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const slotsLeft = 5 - (existingImages.length + newImages.length);
    const acceptedFiles = files.slice(0, slotsLeft);

    // Append to newImages (File[])
    const updatedNewImages = [...newImages, ...acceptedFiles];
    setNewImages(updatedNewImages);

    // Build previews: existingImages shown first, then new images
    Promise.all([
      ...existingImages.map((img) => `${imageUrl}${img.image_path}`),
      ...updatedNewImages.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      ),
    ]).then((allPreviews) => setPreviews(allPreviews));
  };

  const handleRemoveImage = (idx) => {
    if (idx < existingImages.length) {
      // Remove an existing (DB) image
      const updated = existingImages.filter((_, i) => i !== idx);
      setExistingImages(updated);

      // Also update previews accordingly
      Promise.all([
        ...updated.map((img) => `${imageUrl}${img.image_path}`),
        ...newImages.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(file);
            })
        ),
      ]).then((allPreviews) => setPreviews(allPreviews));
    } else {
      // Remove from new images
      const nIdx = idx - existingImages.length;
      const updated = newImages.filter((_, i) => i !== nIdx);
      setNewImages(updated);
      Promise.all([
        ...existingImages.map((img) => `${imageUrl}${img.image_path}`),
        ...updated.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(file);
            })
        ),
      ]).then((allPreviews) => setPreviews(allPreviews));
    }

    // Adjust main image index if needed
    if (mainImageIndex === idx) setMainImageIndex(0);
    else if (mainImageIndex > idx) setMainImageIndex((prev) => prev - 1);
  };

  const updateProperty = async () => {
    const formData = new FormData();
    // Scalar fields
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
    formData.append('property_rent', formValue.property_price);
    formData.append(
      'property_rent_frequency',
      formValue.property_rent_frequency ?? 'daily'
    );
    formData.append('sharing_type', formValue.sharing_type ?? '');
    formData.append('occupancy_type', formValue.occupancy_type ?? '');
    formData.append('no_of_rooms', formValue.no_of_rooms ?? 1);
    formData.append('no_of_bathrooms', formValue.no_of_bathrooms ?? 1);
    formData.append('year_built', formValue.year_built ?? 2000);
    formData.append('map', formValue.map_link);
    formData.append('status', formValue.status ?? 'active');
    formData.append(
      'is_property_favourite',
      formValue.is_property_favourite ? 1 : 0
    );
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
    formData.append('meta_title', formValue.meta_title);
    formData.append('meta_description', formValue.meta_description);

    formValue.meta_keywords.forEach((keyword) => {
      formData.append('meta_keywords[]', keyword);
    });

    // Amenity/nearby IDs
    formValue.amenities.forEach((id) => {
      formData.append('amenities[]', id);
    });
    formValue.nearby_locations.forEach((loc, index) => {
      if (loc.nearby_location_id) {
        formData.append(`nearby_locations[${index}][nearby_location_id]`, loc.nearby_location_id);
        formData.append(`nearby_locations[${index}][name]`, loc.name || '');
        formData.append(`nearby_locations[${index}][distance]`, loc.distance || '');
      }
    });

    // Handle images:
    existingImages.forEach((img) => {
      formData.append('existing_images[]', img.id); // Send only IDs of images you keep
    });
    newImages.forEach((file) => {
      formData.append('images[]', file); // Send binary new images as in addProperty
    });
    formData.append('main_image_index', mainImageIndex); // Where main image is (in combined [existing, new])

    setAddLoader(true);
    try {
      const res = await fetch(`${apiUrl}admin/update-property/${propertyId}`, {
        method: 'POST',
        headers: {
          Authorization: authData.token,
          Accept: 'application/json',
        },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Property updated successfully!');
        navigate('/admin/properties');
      } else {
        toast.error(json.message || 'Update failed!');
      }
    } catch (err) {
      console.log('Something went wrong.', err);
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

  const addNearbyLocationRow = () => {
    setFormValue((prev) => ({
      ...prev,
      nearby_locations: [
        ...prev.nearby_locations,
        { nearby_location_id: '', name: '', distance: '' },
      ],
    }));
  };

  const removeNearbyLocationRow = (index) => {
    setFormValue((prev) => ({
      ...prev,
      nearby_locations: prev.nearby_locations.filter((_, i) => i !== index),
    }));
  };

  const handleNearbyLocationRowChange = (index, field, value) => {
    setFormValue((prev) => ({
      ...prev,
      nearby_locations: prev.nearby_locations.map((loc, i) =>
        i === index ? { ...loc, [field]: value } : loc
      ),
    }));
  };

  if (loading) {
    return <DataLoader />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-12 flex items-center justify-between mb-4">
          <h2 className="breadcrumb_title">Update Property</h2>
          <Button
            type="submit"
            appearance="primary"
            onClick={() => {
              updateProperty();
            }}
            disabled={addLoader}
          >
            {addLoader ? (
              <div className="flex items-center">
                <Loader />
                <span className="ml-2">Updating Property...</span>
              </div>
            ) : (
              'Update This Property'
            )}
          </Button>
        </div>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm mb-6">
        <Form fluid>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="col-span-1 md:col-span-12">
              <h5 className="text-lg font-semibold text-ink border-b pb-3 mb-2">Basic Information</h5>
            </div>
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="propertyTitle">
                <Form.Label>
                  Property Title
                  <span className="text-red-500">*</span>
                </Form.Label>
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
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="propertyDescription">
                <Form.Label>
                  Property Description
                  <span className="text-red-500">*</span>
                </Form.Label>
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

            <div className="col-span-1 md:col-span-12">
              <h5 className="text-lg font-semibold text-ink border-b pb-3 mb-2">Address</h5>
            </div>
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="address">
                <Form.Label>Street Address</Form.Label>
                <Input
                  placeholder="Enter Street Address"
                  value={formValue.property_address}
                  onChange={(e) =>
                    setFormValue((prev) => ({ ...prev, property_address: e }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="address">
                <Form.Label>
                  Map Link<span className="text-red-500">*</span>
                </Form.Label>
                <Input
                  placeholder="Enter Map Link"
                  value={formValue.map_link}
                  onChange={(e) =>
                    setFormValue((prev) => ({ ...prev, map_link: e }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="state">
                <Form.Label className="flex items-center justify-between">
                  <span>
                    State
                    <span className="text-red-500">*</span>
                  </span>
                  <Button
                    type="button"
                    appearance="link" size="sm"
                    onClick={() => handleOpen('state')}
                  >
                    Add State
                  </Button>
                </Form.Label>
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
            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="city">
                <Form.Label className="flex items-center justify-between">
                  <span>
                    City
                    <span className="text-red-500">*</span>
                  </span>
                  <Button
                    type="button"
                    appearance="link" size="sm"
                    onClick={() => handleOpen('city')}
                  >
                    Add City
                  </Button>
                </Form.Label>
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
            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="area">
                <Form.Label className="flex items-center justify-between">
                  <span>
                    Area
                    <span className="text-red-500">*</span>
                  </span>
                  <Button
                    type="button"
                    appearance="link" size="sm"
                    onClick={() => handleOpen('area')}
                  >
                    Add Area
                  </Button>
                </Form.Label>
                <SelectPicker
                  onOpen={() => {
                    console.log(formValue.city_id, formValue.area_id);
                  }}
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

            <div className="col-span-1 md:col-span-12">
              <h5 className="text-lg font-semibold text-ink border-b pb-3 mb-2">Property Details</h5>
            </div>
            <div className="col-span-1 md:col-span-6">
              <Form.Group controlId="rental">
                <Form.Label className="flex items-center justify-between">
                  <span>
                    Rental
                    <span className="text-red-500">*</span>
                  </span>
                  <Button
                    type="button"
                    appearance="link" size="sm"
                    style={{ visibility: 'hidden' }}
                  >
                    Add Property Type
                  </Button>
                </Form.Label>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="col-span-1 md:col-span-7">
                    <Input
                      placeholder="Amount"
                      value={formValue.property_price}
                      onChange={(val) =>
                        setFormValue((fv) => ({ ...fv, property_price: val }))
                      }
                    />
                  </div>
                  <div className="col-span-1 md:col-span-5">
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
            <div className="col-span-1 md:col-span-6">
              <Form.Group controlId="propertyType">
                <Form.Label className="flex items-center justify-between">
                  <span>
                    Property Type
                    <span className="text-red-500">*</span>
                  </span>
                  <Button
                    type="button"
                    appearance="link" size="sm"
                    onClick={() => {
                      handleOpen('propertyType');
                    }}
                  >
                    Add Property Type
                  </Button>
                </Form.Label>
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
            {/* <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="rooms">
                <Form.Label>No. of Rooms</Form.Label>
                <Input
                  placeholder="Enter Number of Rooms"
                  value={formValue.no_of_rooms}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, no_of_rooms: val }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="bathrooms">
                <Form.Label>No. of Bathrooms</Form.Label>
                <Input
                  placeholder="Enter Number of Bathrooms"
                  value={formValue.no_of_bathrooms}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, no_of_bathrooms: val }))
                  }
                />
              </Form.Group>
            </div> */}
            <div className="col-span-1 md:col-span-3">
              <Form.Group controlId="sharingType">
                <Form.Label>
                  Sharing Type
                  <span className="text-red-500">*</span>
                </Form.Label>
                <SelectPicker
                  data={sharingTypeOptions} block
                  value={formValue.sharing_type}
                  onChange={(value) =>
                    setFormValue((fv) => ({ ...fv, sharing_type: value }))
                  }
                  placeholder="Select sharing type"
                  style={{ width: '100%' }}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-3">
              <Form.Group controlId="occupancyType">
                <Form.Label>
                  Occupancy Type
                  <span className="text-red-500">*</span>
                </Form.Label>
                <SelectPicker
                  data={occupancyTypeOptions} block
                  value={formValue.occupancy_type}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, occupancy_type: val }))
                  }
                  placeholder="Select occupancy type"
                  style={{ width: '100%' }}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-3">
              <Form.Group controlId="status">
                <Form.Label>
                  Status
                  <span className="text-red-500">*</span>
                </Form.Label>{' '}
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
            <div className="col-span-1 md:col-span-3">
              <Form.Group controlId="year">
                <Form.Label>Year Build</Form.Label>
                <Input
                  placeholder="Enter Year Build"
                  value={formValue.year_built}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, year_built: val }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-3">
              <Form.Group controlId="status">
                <Form.Label>
                  Pricing Options
                  <span className="text-red-500">*</span>
                </Form.Label>{' '}
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

                <div className="col-span-1 md:col-span-12 mt-3">
                  <div className="multiple-pricing-section">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="m-0">Multiple Pricing Options</h5>
                      <Button
                        type="button"
                        appearance="primary" color="blue" size="sm"
                        onClick={addMultiplePricing}
                      >
                        + Add Pricing Option
                      </Button>
                    </div>

                    {multiplePricings.map((pricing, index) => (
                      <div
                        key={index}
                        className="pricing-option-card p-5 mb-5 border rounded-xl bg-slate-50/50 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h6 className="font-medium text-slate-800">Pricing Option {index + 1}</h6>
                          {multiplePricings.length > 1 && (
                            <Button
                              type="button"
                              appearance="primary" color="red" size="sm"
                              onClick={() => removeMultiplePricing(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          <div className="col-span-1 md:col-span-6">
                            <Form.Group controlId="rentalAmount">
                              <Form.Label>
                                Rental Amount
                                <span className="text-red-500">*</span>
                              </Form.Label>
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
                          <div className="col-span-1 md:col-span-6">
                            <Form.Group controlId="rentalFrequency">
                              <Form.Label>
                                Rental Frequency
                                <span className="text-red-500">*</span>
                              </Form.Label>

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
                          <div className="col-span-1 md:col-span-6">
                            <Form.Group controlId="sharingType">
                              <Form.Label>
                                Sharing Type
                                <span className="text-red-500">*</span>
                              </Form.Label>
                              <SelectPicker
                                data={sharingTypeOptions} block
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
                          <div className="col-span-1 md:col-span-6">
                            <Form.Group controlId="occupancyType">
                              <Form.Label>
                                Occupancy Type
                                <span className="text-red-500">*</span>
                              </Form.Label>

                              <SelectPicker
                                data={occupancyTypeOptions} block
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

            <div className="col-span-1 md:col-span-12 flex items-center justify-between border-b pb-2 mb-3 mt-4">
              <h5 className="text-lg font-semibold text-ink m-0">
                Amenities
                <span className="text-red-500">*</span>
              </h5>
              <Button
                type="button"
                appearance="link" size="sm"
                onClick={() => {
                  handleOpen('amenities');
                  setSelectedAmenity(null);
                }}
              >
                Add Amenities
              </Button>
            </div>
            {amenities.map((amenities, index) => (
              <div className="col-span-1 md:col-span-2 mb-2" key={index}>
                <Checkbox
                  value={amenities.id}
                  checked={formValue.amenities.includes(amenities.id)}
                  onChange={handleAmenityChange}
                >
                  {amenities.name}
                </Checkbox>
              </div>
            ))}

            <div className="col-span-1 md:col-span-12 flex items-center justify-between border-b pb-2 mb-3 mt-4">
              <h5 className="text-lg font-semibold text-ink m-0">
                Nearby Facilities
              </h5>
              <div className="flex gap-2">
                <Button
                  type="button"
                  color="violet"
                  appearance="primary"
                  size="sm"
                  onClick={addNearbyLocationRow}
                >
                  + Add Row
                </Button>
                <Button
                  type="button"
                  color="violet"
                  appearance="subtle"
                  size="sm"
                  onClick={() => {
                    handleOpen('nearbyLocations');
                  }}
                >
                  Manage Facility Types
                </Button>
              </div>
            </div>

            <div className="col-span-1 md:col-span-12">
              {formValue.nearby_locations.length === 0 ? (
                <div className="text-center py-8 border rounded border-dashed border-gray-300 text-gray-500 bg-gray-50/50">
                  No nearby facilities added yet. Click "+ Add Row" to start adding facilities.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  {/* Grid Table Header */}
                  <div className="grid grid-cols-12 gap-4 bg-slate-50 border-b border-gray-200 px-4 py-3 font-semibold text-xs text-slate-600 uppercase tracking-wider items-center">
                    <div className="col-span-4">
                      Facility Type <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-4">
                      Name <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-2">
                      Distance (in km) <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-2 text-center">
                      Action
                    </div>
                  </div>

                  {/* Grid Table Body */}
                  <div className="divide-y divide-gray-100">
                    {formValue.nearby_locations.map((loc, index) => (
                      <div className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-slate-50/40 transition-colors duration-150" key={index}>
                        <div className="col-span-4">
                          <SelectPicker
                            data={nearbyLocations.map((item) => ({
                              label: item.nearby_location_name,
                              value: item.id,
                            }))}
                            placeholder="Select Facility Type"
                            block
                            cleanable={false}
                            searchable
                            value={loc.nearby_location_id || null}
                            onChange={(value) =>
                              handleNearbyLocationRowChange(
                                index,
                                'nearby_location_id',
                                value
                              )
                            }
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            placeholder="e.g. Indira Gandhi Metro"
                            value={loc.name || ''}
                            onChange={(value) =>
                              handleNearbyLocationRowChange(
                                index,
                                'name',
                                value
                              )
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            placeholder="e.g. 1.5"
                            value={loc.distance || ''}
                            onChange={(value) =>
                              handleNearbyLocationRowChange(
                                index,
                                'distance',
                                value
                              )
                            }
                          />
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <Button
                            type="button"
                            color="red"
                            appearance="subtle"
                            size="sm"
                            onClick={() => removeNearbyLocationRow(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="propertyImages">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Form.Label>
                    <u>Property Media</u> <span className="text-red-500">*</span>
                  </Form.Label>
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
                      className={`upload-img-preview-box${mainImageIndex === idx ? ' main-image-border' : ''
                        }`}
                    >
                      <button
                        type="button"
                        className="upload-img-remove-btn"
                        aria-label="Remove image"
                        onClick={() => handleRemoveImage(idx)}
                      >
                        ×
                      </button>
                      <img src={src} alt={`Preview ${idx + 1}`} />
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <label className="upload-img-uploader-label" tabIndex={0}>
                      +
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
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

            <div className="col-span-1 md:col-span-12">
              <h5 className="text-lg font-semibold text-ink border-b pb-3 mb-2">Meta Information</h5>
            </div>
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="metaTitle">
                <Form.Label>
                  Meta Title
                  <span className="text-red-500">*</span>
                </Form.Label>
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
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="metaDescription">
                <Form.Label>
                  Meta Description
                  <span className="text-red-500">*</span>
                </Form.Label>
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
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="metaKeywords">
                <Form.Label>
                  Meta Keywords
                  <span className="text-red-500">*</span>
                </Form.Label>
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

            <div className="col-span-1 md:col-span-12 flex items-center justify-end">
              <Button
                type="submit"
                appearance="primary"
                onClick={() => {
                  updateProperty();
                }}
                disabled={addLoader}
              >
                {addLoader ? (
                  <div className="flex items-center">
                    <Loader />
                    <span className="ml-2">Updating Property...</span>
                  </div>
                ) : (
                  'Update This Property'
                )}
              </Button>
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

export default EditProperty;
