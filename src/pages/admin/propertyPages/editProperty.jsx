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
    brand_id: null,
    alt_name: '',
    space_category: '',
    line_1: '',
    line_2: '',
    pincode: '',
    landmark: '',
    longitude: '',
    latitude: '',
    extra_details: {},
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
    average_rating: '',
    review_count: '',
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
  const [brandsList, setBrandsList] = useState([]);
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


  const getSeatCategoryOptions = () => {
    const selectedTypeName = propertyTypesList.find(pt => pt.value === formValue.property_type_id)?.label?.toLowerCase() || '';
    if (selectedTypeName.includes('coworking') || selectedTypeName.includes('co-working')) {
      return [
        { label: 'Day Pass', value: 'Day Pass' },
        { label: 'Meeting Room', value: 'Meeting Room' },
        { label: 'Flexi Desk', value: 'Flexi Desk' },
        { label: 'Dedicated Seat', value: 'Dedicated Seat' },
        { label: 'Private Cabins', value: 'Private Cabins' },
      ];
    }
    if (selectedTypeName.includes('managed')) {
      return [
        { label: 'Per Seat Price', value: 'Per Seat Price' },
        { label: 'Square Ft.', value: 'Square Ft.' },
      ];
    }
    if (selectedTypeName.includes('coliving') || selectedTypeName.includes('co-living') || selectedTypeName.includes('co living')) {
      return [
        { label: 'Single Occupancy', value: 'Single Occupancy' },
        { label: 'Double Occupancy', value: 'Double Occupancy' },
        { label: 'Triple Occupancy', value: 'Triple Occupancy' },
      ];
    }
    if (selectedTypeName.includes('virtual')) {
      return [
        { label: 'Virtual Office', value: 'Virtual Office' },
        { label: 'Business Address', value: 'Business Address' },
        { label: 'Mail Handling', value: 'Mail Handling' },
        { label: 'Meeting Room', value: 'Meeting Room' },
      ];
    }
    return [
      { label: 'Standard', value: 'Standard' }
    ];
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
      get_all_brands();
      fetchStates();
    }
  }, [authData]);

  // Fetch all states
  const get_all_brands = () => {
    fetch(apiUrl + 'admin/get-all-brands', {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    }).then(r => r.json()).then(json => {
      if (json.success) setBrandsList(json.data.map(b => ({ value: b.id, label: b.operator_brand_name })));
    }).catch(err => console.log(err));
  };

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
          brand_id: p.brand_id || null,
          alt_name: p.alt_name || '',
          space_category: p.space_category || '',
          line_1: p.line_1 || '',
          line_2: p.line_2 || '',
          pincode: p.pincode || '',
          landmark: p.landmark || '',
          longitude: p.longitude || '',
          latitude: p.latitude || '',
          extra_details: typeof p.extra_details === 'string' ? JSON.parse(p.extra_details) : (p.extra_details || {}),
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
          average_rating: p.average_rating?.toString() || '',
          review_count: p.review_count?.toString() || '',
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
              seat_category: mp.seat_category || '',
              duration: mp.duration || '',
              amount: mp.amount || '',
              marked_amount: mp.marked_amount || '',
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


  const handleExtraDetailChange = (key, value) => {
    setFormValue((prev) => ({
      ...prev,
      extra_details: {
        ...(prev.extra_details || {}),
        [key]: value
      }
    }));
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

  const validateForm = () => {
    const errs = [];

    if (!formValue.property_name?.trim()) errs.push('Property Title is required');
    if (!formValue.property_description?.trim()) errs.push('Property Description is required');
    if (!formValue.state_id) errs.push('State is required');
    if (!formValue.city_id) errs.push('City is required');
    if (!formValue.area_id) errs.push('Area is required');
    if (!formValue.property_type_id) errs.push('Property Type is required');
    if (!formValue.status) errs.push('Status is required');

    const selectedTypeName = propertyTypesList.find(pt => pt.value === formValue.property_type_id)?.label?.toLowerCase() || '';
    const isCoworking = selectedTypeName.includes('coworking') || selectedTypeName.includes('co-working');
    const isVirtual = selectedTypeName.includes('virtual');
    const isManaged = selectedTypeName.includes('managed') || selectedTypeName.includes('managed spaces');
    const isSinglePricingRemoved = isCoworking || isManaged || isVirtual;

    if (!isSinglePricingRemoved) {
      if (!formValue.property_price) errs.push('Rental Amount is required');
      if (!formValue.property_rent_frequency) errs.push('Rental Frequency is required');
      if (!formValue.sharing_type) errs.push('Sharing Type is required');
      if (!formValue.occupancy_type) errs.push('Occupancy Type is required');
    }

    if (isSinglePricingRemoved || formValue.has_multiple_pricing) {
      if (!multiplePricings || multiplePricings.length === 0) {
        errs.push('At least one Multiple Pricing option is required');
      } else {
        multiplePricings.forEach((pricing, index) => {
          if (!pricing.seat_category) {
            errs.push(`Pricing Option ${index + 1}: Seat Category is required`);
          }
          if (!pricing.duration) {
            errs.push(`Pricing Option ${index + 1}: Duration is required`);
          }
        });
      }
    }

    if (formValue.average_rating !== '' && formValue.average_rating !== undefined && formValue.average_rating !== null) {
      const rating = parseFloat(formValue.average_rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        errs.push('Average Rating must be a number between 0 and 5');
      }
    }
    if (formValue.review_count !== '' && formValue.review_count !== undefined && formValue.review_count !== null) {
      const count = parseInt(formValue.review_count, 10);
      if (isNaN(count) || count < 0) {
        errs.push('Review Count must be a non-negative integer');
      }
    }

    if (!formValue.meta_title?.trim()) errs.push('Meta Title is required');
    if (!formValue.meta_keywords || formValue.meta_keywords.length === 0) errs.push('At least one Meta Keyword is required');
    if (!formValue.meta_description?.trim()) errs.push('Meta Description is required');

    return errs;
  };

  const updateProperty = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(
        <div>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Please fix the following validation errors:</strong>
          <ul style={{ paddingLeft: '20px', listStyleType: 'disc', fontSize: '13px', margin: 0 }}>
            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>,
        { duration: 5000 }
      );
      return;
    }

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
    if (formValue.brand_id) formData.append('brand_id', formValue.brand_id);
    formData.append('alt_name', formValue.alt_name || '');
    formData.append('space_category', formValue.space_category || '');
    formData.append('line_1', formValue.line_1 || '');
    formData.append('line_2', formValue.line_2 || '');
    formData.append('pincode', formValue.pincode || '');
    formData.append('landmark', formValue.landmark || '');
    formData.append('longitude', formValue.longitude || '');
    formData.append('latitude', formValue.latitude || '');
    formData.append('extra_details', JSON.stringify(formValue.extra_details));
    const selectedTypeName = propertyTypesList.find(pt => pt.value === formValue.property_type_id)?.label?.toLowerCase() || '';
    const isCoworking = selectedTypeName.includes('coworking') || selectedTypeName.includes('co-working');
    const isVirtual = selectedTypeName.includes('virtual');
    const isManaged = selectedTypeName.includes('managed') || selectedTypeName.includes('managed spaces');
    const isSinglePricingRemoved = isCoworking || isManaged || isVirtual;

    formData.append('property_rent', isSinglePricingRemoved ? '' : (formValue.property_price || ''));
    formData.append(
      'property_rent_frequency',
      isSinglePricingRemoved ? '' : (formValue.property_rent_frequency ?? 'daily')
    );
    formData.append('sharing_type', isSinglePricingRemoved ? '' : (formValue.sharing_type ?? ''));
    formData.append('occupancy_type', isSinglePricingRemoved ? '' : (formValue.occupancy_type ?? ''));
    formData.append('no_of_rooms', formValue.no_of_rooms ?? 1);
    formData.append('no_of_bathrooms', formValue.no_of_bathrooms ?? 1);
    formData.append('year_built', isSinglePricingRemoved ? '' : (formValue.year_built ?? ''));
    formData.append('map', formValue.map_link);
    formData.append('status', formValue.status ?? 'active');
    formData.append(
      'is_property_favourite',
      formValue.is_property_favourite ? 1 : 0
    );
    formData.append('average_rating', formValue.average_rating ?? '');
    formData.append('review_count', formValue.review_count ?? '');
    formData.append(
      'has_multiple_pricing',
      (isSinglePricingRemoved || formValue.has_multiple_pricing) ? '1' : '0'
    );

    if (isSinglePricingRemoved || formValue.has_multiple_pricing) {
      // Add multiple pricing data
      multiplePricings.forEach((pricing, index) => {
        formData.append(`multiple_pricings[${index}][seat_category]`, pricing.seat_category || '');
        formData.append(`multiple_pricings[${index}][duration]`, pricing.duration || '');
        formData.append(`multiple_pricings[${index}][amount]`, pricing.amount || '');
        formData.append(`multiple_pricings[${index}][marked_amount]`, pricing.marked_amount || '');
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
          <h2 className="mb-0 text-2xl font-bold tracking-tight text-ink">Update Property</h2>
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
        <Form fluid className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
            <div className="col-span-1 md:col-span-12">
              <h5 className="text-lg font-semibold text-ink border-b pb-3 mb-2">Basic Information</h5>
            </div>
            <div className="col-span-1 md:col-span-6">
              <Form.Group controlId="brandId">
                <Form.Label>Brand</Form.Label>
                <SelectPicker
                  data={[{ value: null, label: 'None' }, ...brandsList]}
                  placeholder="Select Brand"
                  block searchable cleanable
                  value={formValue.brand_id}
                  onChange={(val) => setFormValue(prev => ({ ...prev, brand_id: val }))}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-6">
              <Form.Group controlId="altName">
                <Form.Label>Alt Name</Form.Label>
                <Input placeholder="Alt Name" value={formValue.alt_name} onChange={e => setFormValue(prev => ({ ...prev, alt_name: e }))} />
              </Form.Group>
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
            <div className="col-span-1 md:col-span-6">
              <Form.Group controlId="line_1">
                <Form.Label>Line 1</Form.Label>
                <Input placeholder="Enter Line 1" value={formValue.line_1} onChange={(e) => setFormValue(prev => ({ ...prev, line_1: e }))} />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-6">
              <Form.Group controlId="line_2">
                <Form.Label>Line 2</Form.Label>
                <Input placeholder="Enter Line 2" value={formValue.line_2} onChange={(e) => setFormValue(prev => ({ ...prev, line_2: e }))} />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="pincode">
                <Form.Label>Pincode</Form.Label>
                <Input placeholder="Enter Pincode" value={formValue.pincode} onChange={(e) => setFormValue(prev => ({ ...prev, pincode: e }))} />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="landmark">
                <Form.Label>Landmark</Form.Label>
                <Input placeholder="Enter Landmark" value={formValue.landmark} onChange={(e) => setFormValue(prev => ({ ...prev, landmark: e }))} />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="longitude">
                <Form.Label>Longitude</Form.Label>
                <Input placeholder="Enter Longitude" value={formValue.longitude} onChange={(e) => setFormValue(prev => ({ ...prev, longitude: e }))} />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="latitude">
                <Form.Label>Latitude</Form.Label>
                <Input placeholder="Enter Latitude" value={formValue.latitude} onChange={(e) => setFormValue(prev => ({ ...prev, latitude: e }))} />
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
            
            {/* Row 1: Average Rating, Review Count, Property Type */}
            <div className="col-span-1 md:col-span-3">
              <Form.Group controlId="averageRating">
                <Form.Label>Average Rating</Form.Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="e.g. 4.5"
                  value={formValue.average_rating}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, average_rating: val }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-3">
              <Form.Group controlId="reviewCount">
                <Form.Label>Review Count</Form.Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 120"
                  value={formValue.review_count}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, review_count: val }))
                  }
                />
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
                  onChange={(val) => {
                    const selName = propertyTypesList.find(pt => pt.value === val)?.label?.toLowerCase() || '';
                    const isCow = selName.includes('coworking') || selName.includes('co-working');
                    const isMan = selName.includes('managed');
                    const isVir = selName.includes('virtual');
                    
                    setFormValue((fv) => {
                      const updated = { ...fv, property_type_id: val };
                      if (isCow || isMan || isVir) {
                        updated.has_multiple_pricing = true;
                      }
                      return updated;
                    });
                  }}
                />
              </Form.Group>
            </div>

            {/* Row 2: Rental & Pricing Options (Only if single pricing is NOT removed) */}
            {(() => {
              const selectedTypeName = propertyTypesList.find(pt => pt.value === formValue.property_type_id)?.label?.toLowerCase() || '';
              const isCoworking = selectedTypeName.includes('coworking') || selectedTypeName.includes('co-working');
              const isVirtual = selectedTypeName.includes('virtual');
              const isManaged = selectedTypeName.includes('managed') || selectedTypeName.includes('managed spaces');
              const isSinglePricingRemoved = isCoworking || isManaged || isVirtual;

              return (
                <>
                  {!isSinglePricingRemoved && (
                    <>
                      <div className="col-span-1 md:col-span-6">
                        <Form.Group controlId="rental">
                          <Form.Label className="flex items-center justify-between">
                            <span>
                              Rental
                              <span className="text-red-500">*</span>
                            </span>
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
                        <Form.Group controlId="pricingOptions">
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
                    </>
                  )}

                  {/* Row 3: Type-specific Details */}
                  <div className="col-span-1 md:col-span-12">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full mt-4">
                      {isCoworking && (
                        <>
                          <div className="col-span-1 md:col-span-12"><h5 className="text-lg font-semibold text-ink border-b pb-3 mb-2">Coworking Details</h5></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Working People</Form.Label><Input value={formValue.extra_details?.working_people || ''} onChange={v => handleExtraDetailChange('working_people', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Day Pass Value</Form.Label><Input value={formValue.extra_details?.day_pass_value || ''} onChange={v => handleExtraDetailChange('day_pass_value', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Open Desk Monthly</Form.Label><Input value={formValue.extra_details?.open_desk_monthly || ''} onChange={v => handleExtraDetailChange('open_desk_monthly', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-6"><Form.Group><Form.Label>Open Time</Form.Label><Input type="time" value={formValue.extra_details?.open_time || ''} onChange={v => handleExtraDetailChange('open_time', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-6"><Form.Group><Form.Label>Close Time</Form.Label><Input type="time" value={formValue.extra_details?.close_time || ''} onChange={v => handleExtraDetailChange('close_time', v)} /></Form.Group></div>
                        </>
                      )}
                      {isVirtual && (
                        <>
                          <div className="col-span-1 md:col-span-12"><h5 className="text-lg font-semibold text-ink border-b pb-3 mb-2">Virtual Office Details</h5></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>VO Category</Form.Label><Input value={formValue.extra_details?.vo_category || ''} onChange={v => handleExtraDetailChange('vo_category', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Tenure (Months)</Form.Label><Input type="number" value={formValue.extra_details?.tenure_months || ''} onChange={v => handleExtraDetailChange('tenure_months', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Total Price Amount</Form.Label><Input type="number" value={formValue.extra_details?.total_price_amount || ''} onChange={v => handleExtraDetailChange('total_price_amount', v)} /></Form.Group></div>
                        </>
                      )}
                      {isManaged && (
                        <>
                          <div className="col-span-1 md:col-span-12"><h5 className="text-lg font-semibold text-ink border-b pb-3 mb-2">Managed Office Details</h5></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Contacted Person</Form.Label><Input value={formValue.extra_details?.contacted_person || ''} onChange={v => handleExtraDetailChange('contacted_person', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Contact No</Form.Label><Input value={formValue.extra_details?.contact_no || ''} onChange={v => handleExtraDetailChange('contact_no', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Inventory Type</Form.Label><Input value={formValue.extra_details?.inventory_type || ''} onChange={v => handleExtraDetailChange('inventory_type', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Furnished</Form.Label><Input value={formValue.extra_details?.furnished || ''} onChange={v => handleExtraDetailChange('furnished', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Building Developer</Form.Label><Input value={formValue.extra_details?.building_developer || ''} onChange={v => handleExtraDetailChange('building_developer', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Rating</Form.Label><Input value={formValue.extra_details?.rating || ''} onChange={v => handleExtraDetailChange('rating', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Super Area</Form.Label><Input value={formValue.extra_details?.super_area || ''} onChange={v => handleExtraDetailChange('super_area', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Carpet Area</Form.Label><Input value={formValue.extra_details?.carpet_area || ''} onChange={v => handleExtraDetailChange('carpet_area', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Building Area</Form.Label><Input value={formValue.extra_details?.building_area || ''} onChange={v => handleExtraDetailChange('building_area', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Number of Floor</Form.Label><Input value={formValue.extra_details?.number_of_floor || ''} onChange={v => handleExtraDetailChange('number_of_floor', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Seating Capacity</Form.Label><Input value={formValue.extra_details?.seating_capacity || ''} onChange={v => handleExtraDetailChange('seating_capacity', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Available From</Form.Label><Input type="date" value={formValue.extra_details?.available_from || ''} onChange={v => handleExtraDetailChange('available_from', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Ready to deliver in (Months)</Form.Label><Input value={formValue.extra_details?.ready_to_deliver_in || ''} onChange={v => handleExtraDetailChange('ready_to_deliver_in', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-4"><Form.Group><Form.Label>Lock-in Period</Form.Label><Input value={formValue.extra_details?.lock_in_period || ''} onChange={v => handleExtraDetailChange('lock_in_period', v)} /></Form.Group></div>
                          <div className="col-span-1 md:col-span-12 mt-2">
                            <Toggle checked={formValue.extra_details?.is_popular || false} onChange={v => handleExtraDetailChange('is_popular', v)} /> <span className="ml-2">Is Popular</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Sharing Type, Occupancy Type, Status, Year Build */}
                  {!isSinglePricingRemoved && (
                    <>
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
                    </>
                  )}

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

                  {!isSinglePricingRemoved && (
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
                  )}
                </>
              );
            })()}
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
                        className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end border p-4 rounded-md mb-4 relative"
                      >
                        {multiplePricings.length > 1 && (
                          <div className="absolute top-2 right-2">
                            <Button
                              type="button"
                              appearance="link"
                              className="!text-red-500 !p-0"
                              onClick={() => removeMultiplePricing(index)}
                            >
                              ✕ Remove
                            </Button>
                          </div>
                        )}
                        <div className="col-span-1 md:col-span-3">
                          <Form.Group>
                            <Form.Label>Seat Category</Form.Label>
                            <SelectPicker
                              data={getSeatCategoryOptions()}
                              placeholder="Select Category"
                              block
                              value={pricing.seat_category}
                              onChange={(val) => handleMultiplePricingChange(index, 'seat_category', val)}
                            />
                          </Form.Group>
                        </div>
                        <div className="col-span-1 md:col-span-3">
                          <Form.Group>
                            <Form.Label>Duration</Form.Label>
                            <Input
                              placeholder="e.g. Monthly, Daily"
                              value={pricing.duration}
                              onChange={(val) => handleMultiplePricingChange(index, 'duration', val)}
                            />
                          </Form.Group>
                        </div>
                        <div className="col-span-1 md:col-span-3">
                          <Form.Group>
                            <Form.Label>Amount</Form.Label>
                            <Input
                              placeholder="Amount"
                              value={pricing.amount}
                              onChange={(val) => handleMultiplePricingChange(index, 'amount', val)}
                            />
                          </Form.Group>
                        </div>
                        <div className="col-span-1 md:col-span-3">
                          <Form.Group>
                            <Form.Label>Marked Amount</Form.Label>
                            <Input
                              placeholder="Marked Amount (Optional)"
                              value={pricing.marked_amount}
                              onChange={(val) => handleMultiplePricingChange(index, 'marked_amount', val)}
                            />
                          </Form.Group>
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
                  {amenities.icon && (
                    <span className="text-[10px] text-gray-400 ml-1 font-mono">
                      [{amenities.icon}]
                    </span>
                  )}
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
