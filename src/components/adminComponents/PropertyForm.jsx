import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import {
  Checkbox,
  CheckboxGroup,
  Form,
  Input,
  Loader,
  SelectPicker,
  TagInput,
  Toggle,
} from "rsuite";
import { apiUrl, imageUrl } from "../../envConfig";
import { AuthContext } from "../../AuthContextProvider";
import AmenitiesModal from "./AmenitiesModal";
import AreaModal from "./AreaModal";
import CityModal from "./CityModal";
import NearbyLocationsModal from "./NearbyLocationsModal";
import PropertyTypesModal from "./PropertyTypesModal";
import StateModal from "./StateModal";
import DataLoader from "../sharedComponents/DataLoader";
import Button from "../ui/Button";

// Normalize property type names so "Co Working", "Co-Working" and
// "Coworking" (etc.) all resolve to the same category.
const normalizeTypeName = (name) =>
  (name || "").toLowerCase().replace(/[\s\-_]/g, "");

// Single source of truth for pricing category / occupancy options per
// property type. Single pricing (rent/frequency/sharing type/occupancy
// type) stays eliminated — every property only ever uses "multiple
// pricing" rows. year_built is NOT part of this — it's a normal property
// field, kept independently below.
const PRICING_CONFIG = {
  coworking: {
    label: "Coworking",
    categories: [
      "Day Pass",
      "Meeting Room",
      "Flexi Desk",
      "Dedicated Seat",
      "Private Cabins",
    ],
    hasOccupancyType: false,
    hasNoOfSeats: true,
  },
  virtual: {
    label: "Virtual Office",
    categories: [
      "Mailing Address",
      "GST Registration",
      "New Company Registration",
    ],
    hasOccupancyType: false,
  },
  coliving: {
    label: "Co-living",
    categories: [
      "Private Room",
      "Double Sharing",
      "Triple Sharing",
      "Quad Sharing",
    ],
    hasOccupancyType: true,
    occupancyOptions: ["Boys", "Girls", "Co-ed"],
  },
  managed: {
    label: "Managed Spaces",
    categories: ["Price Per Seat", "Price Per Sq Ft"],
    hasOccupancyType: false,
  },
  default: {
    label: "Standard",
    categories: ["Standard"],
    hasOccupancyType: false,
  },
};

const getPricingConfig = (propertyTypeLabel) => {
  const norm = normalizeTypeName(propertyTypeLabel);
  if (norm.includes("coworking")) return PRICING_CONFIG.coworking;
  if (norm.includes("virtual")) return PRICING_CONFIG.virtual;
  if (norm.includes("coliving")) return PRICING_CONFIG.coliving;
  if (norm.includes("managed")) return PRICING_CONFIG.managed;
  return PRICING_CONFIG.default;
};

const emptyPricingRow = () => ({
  seat_category: "",
  occupancy_type: "",
  no_of_seats: "",
  duration: "",
  amount: "",
  marked_amount: "",
});

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Open Days schedule sent to the backend as:
// { days: ["Monday", "Tuesday", ...], opening_time: "09:00", closing_time: "18:00" }
const emptyOpenDays = () => ({
  days: [],
  opening_time: "",
  closing_time: "",
});

const emptyFormValue = {
  property_name: "",
  brand_id: null,
  alt_name: "",
  space_category: "",
  line_1: "",
  line_2: "",
  pincode: "",
  landmark: "",
  longitude: "",
  latitude: "",
  extra_details: {},
  state_id: null,
  city_id: null,
  area_id: null,
  property_type_id: null,
  property_description: "",
  property_address: "",
  status: "",
  is_property_favourite: false,
  average_rating: "",
  review_count: "",
  year_built: "",
  amenities: [],
  nearby_locations: [],
  meta_title: "",
  meta_description: "",
  meta_keywords: [],
  map_link: "",
};

// Small presentational helper to keep section styling consistent.
function SectionCard({ title, action, children }) {
  return (
    <div className="col-span-1 md:col-span-12 bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 rounded-full bg-blue-500" />
          <h5 className="text-sm font-semibold text-slate-800 m-0 uppercase tracking-wide">
            {title}
          </h5>
        </div>
        {action}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">{children}</div>
    </div>
  );
}

function PropertyForm({ mode = "add" }) {
  const isEdit = mode === "edit";
  const { authData } = useContext(AuthContext);
  const { slug } = useParams();
  const navigate = useNavigate();

  const [formValue, setFormValue] = useState(emptyFormValue);
  const [multiplePricings, setMultiplePricings] = useState([emptyPricingRow()]);
  const [openDays, setOpenDays] = useState(emptyOpenDays());

  // Select data
  const [brandsList, setBrandsList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [propertyTypesList, setPropertyTypesList] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoader, setAddLoader] = useState(false);

  // Images
  const [existingImages, setExistingImages] = useState([]); // edit mode only: [{id, image_path}]
  const [newImages, setNewImages] = useState([]); // File[]
  const [previews, setPreviews] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [propertyId, setPropertyId] = useState(null);

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

  // add near other useState
  const [metaTouched, setMetaTouched] = useState({
    title: false,
    description: false,
    keywords: false,
  });

  // helper: title → keyword tags
  const deriveKeywords = (title) =>
    Array.from(
      new Set(
        (title || "")
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((w) => w.length > 2)
      )
    );

  const selectedTypeLabel =
    propertyTypesList.find((pt) => pt.value === formValue.property_type_id)
      ?.label || "";
  const pricingConfig = getPricingConfig(selectedTypeLabel);
  const norm = normalizeTypeName(selectedTypeLabel);
  const isCoworking = norm.includes("coworking");
  const isManaged = norm.includes("managed");

  // ---------- Pricing row handlers ----------
  const addMultiplePricing = () =>
    setMultiplePricings((prev) => [...prev, emptyPricingRow()]);

  const removeMultiplePricing = (index) => {
    if (multiplePricings.length > 1) {
      setMultiplePricings((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleMultiplePricingChange = (index, field, value) => {
    setMultiplePricings((prev) =>
      prev.map((pricing, i) =>
        i === index ? { ...pricing, [field]: value } : pricing,
      ),
    );
  };

  const handlePropertyTypeChange = (val) => {
    const selName = propertyTypesList.find((pt) => pt.value === val)?.label || "";
    const willBeManaged = normalizeTypeName(selName).includes("managed");
    setFormValue((fv) => ({
      ...fv,
      property_type_id: val,
      // extra_details only ever applies to Managed Spaces — wipe it for
      // every other type so nothing stale (e.g. is_popular) survives a
      // type switch.
      extra_details: willBeManaged ? fv.extra_details : {},
    }));
  };

  // ---------- Open Days handlers ----------
  const handleOpenDaysChange = (val) => setOpenDays((prev) => ({ ...prev, days: val }));
  const handleOpeningTimeChange = (val) => setOpenDays((prev) => ({ ...prev, opening_time: val }));
  const handleClosingTimeChange = (val) => setOpenDays((prev) => ({ ...prev, closing_time: val }));
  const handleToggleAllDays = () => {
    setOpenDays((prev) => ({
      ...prev,
      days: (prev.days || []).length === WEEK_DAYS.length ? [] : [...WEEK_DAYS],
    }));
  };

  // ---------- Lookups ----------
  const get_all_brands = () => {
    fetch(apiUrl + "admin/get-all-brands", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authData.token,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success)
          setBrandsList(
            json.data.map((b) => ({
              value: b.id,
              label: b.operator_brand_name,
            })),
          );
      })
      .catch((err) => console.log(err));
  };

  const fetchStates = () => {
    fetch(`${apiUrl}admin/get-all-states?paginate=0`, {
      headers: { Accept: "application/json", Authorization: authData.token },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status) {
          const list = Array.isArray(json.data)
            ? json.data
            : json.data?.data || [];
          setStateList(
            list.map((s) => ({ value: s.id, label: s.state_name })),
          );
        }
      })
      .catch((err) => console.log(err))
      .finally(() => get_all_property_types());
  };

  const fetchCities = (state_id) => {
    if (!state_id) return setCityList([]);
    fetch(`${apiUrl}admin/get-city-by-state/${state_id}`, {
      headers: { Accept: "application/json", Authorization: authData.token },
    })
      .then((r) => r.json())
      .then((json) => {
        setCityList(
          json.status
            ? json.data.map((c) => ({ value: c.id, label: c.city_name }))
            : [],
        );
      })
      .catch(() => setCityList([]));
  };

  const fetchAreas = (city_id) => {
    if (!city_id) return setAreaList([]);
    fetch(`${apiUrl}admin/get-area-by-city/${city_id}`, {
      headers: { Accept: "application/json", Authorization: authData.token },
    })
      .then((r) => r.json())
      .then((json) => {
        setAreaList(
          json.status
            ? json.data.map((a) => ({ value: a.id, label: a.area_name }))
            : [],
        );
      })
      .catch(() => setAreaList([]));
  };

  const get_all_property_types = () => {
    fetch(apiUrl + "admin/get-all-property-types", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status)
          setPropertyTypesList(
            json.data.map((s) => ({ value: s.id, label: s.name })),
          );
      })
      .catch((err) => console.log(err))
      .finally(() => get_all_amenities());
  };

  const get_all_amenities = () => {
    fetch(apiUrl + "admin/get-all-amenities", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) setAmenities(json.data);
      })
      .catch((error) => console.error("Error:", error))
      .finally(() => get_all_nearby_locations());
  };

  const get_all_nearby_locations = () => {
    fetch(apiUrl + "admin/get-all-nearby-locations", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) setNearbyLocations(json.data);
      })
      .catch((error) => console.error("Error:", error))
      .finally(() => {
        // In edit mode, the single-property fetch (below) owns final loading state.
        if (!isEdit) setLoading(false);
      });
  };

  useEffect(() => {
    if (authData?.token) {
      get_all_brands();
      fetchStates();
    } else if (authData && !authData.token) {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [authData]);

  useEffect(() => {
    setFormValue((fv) => ({
      ...fv,
      meta_title: metaTouched.title ? fv.meta_title : fv.property_name,
      meta_description: metaTouched.description
        ? fv.meta_description
        : (fv.property_description || "").slice(0, 160),
      meta_keywords: metaTouched.keywords
        ? fv.meta_keywords
        : deriveKeywords(fv.property_name),
    }));
    // eslint-disable-next-line
  }, [formValue.property_name, formValue.property_description]);

  // Edit mode: load the property once lookups are underway.
  useEffect(() => {
    if (!isEdit || !slug || !authData?.token) return;

    async function loadSingleProperty() {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}admin/get-single-properties/${slug}`, {
          headers: { Accept: "application/json", Authorization: authData.token },
        });
        const json = await res.json();
        if (!json.success) {
          toast.error(json.message || "Failed to fetch property");
          setLoading(false);
          return;
        }
        const p = json.property;

        const parsedExtraDetails =
          typeof p.extra_details === "string"
            ? JSON.parse(p.extra_details || "null") || {}
            : p.extra_details || {};
        const { open_days: savedOpenDays, ...restExtraDetails } = parsedExtraDetails;

        setFormValue({
          property_name: p.property_title,
          brand_id: p.brand_id || null,
          alt_name: p.alt_name || "",
          space_category: p.space_category || "",
          line_1: p.line_1 || "",
          line_2: p.line_2 || "",
          pincode: p.pincode || "",
          landmark: p.landmark || "",
          longitude: p.longitude || "",
          latitude: p.latitude || "",
          extra_details: restExtraDetails,
          state_id: p.state_id,
          city_id: p.city_id,
          area_id: p.area_id,
          property_type_id: p.property_type,
          property_description: p.property_description,
          property_address: p.property_street_address || "",
          map_link: p.map,
          status: p.status,
          is_property_favourite:
            p.is_property_favourite === "1" || p.is_property_favourite === 1,
          average_rating: p.average_rating?.toString() || "",
          review_count: p.review_count?.toString() || "",
          year_built: p.year_built?.toString() || "",
          amenities: p.amenities.map((a) => a.id),
          nearby_locations: p.nearby_locations.map((n) => ({
            nearby_location_id: n.id,
            name: n.pivot ? n.pivot.name : "",
            distance: n.pivot ? n.pivot.distance : "",
          })),
          meta_title: p.meta_title || "",
          meta_keywords: p.meta_keywords || [],
          meta_description: p.meta_description || "",
        });

        setMetaTouched({
          title: !!p.meta_title,
          description: !!p.meta_description,
          keywords: !!(p.meta_keywords && p.meta_keywords.length),
        });

        setMultiplePricings(
          p.multiple_pricings && p.multiple_pricings.length > 0
            ? p.multiple_pricings.map((mp) => ({
              seat_category: mp.seat_category || "",
              occupancy_type: mp.occupancy_type || "",
              duration: mp.duration || "",
              amount: mp.amount || "",
              marked_amount: mp.marked_amount || "",
            }))
            : [emptyPricingRow()],
        );

        setOpenDays(
          savedOpenDays && typeof savedOpenDays === "object"
            ? {
              days: savedOpenDays.days || [],
              opening_time: savedOpenDays.opening_time || "",
              closing_time: savedOpenDays.closing_time || "",
            }
            : emptyOpenDays(),
        );

        setPropertyId(p.id);
        setExistingImages(p.images);
        setPreviews(p.images.map((img) => `${imageUrl}${img.image_path}`));
        setMainImageIndex(
          Math.max(0, p.images.findIndex((img) => img.is_main === 1)),
        );
      } catch (err) {
        toast.error("Something went wrong while loading property");
      } finally {
        setLoading(false);
      }
    }
    loadSingleProperty();
    // eslint-disable-next-line
  }, [isEdit, slug, authData]);

  useEffect(() => {
    if (formValue.state_id) {
      fetchCities(formValue.state_id);
    } else {
      setCityList([]);
      setAreaList([]);
    }
    // eslint-disable-next-line
  }, [formValue.state_id]);

  useEffect(() => {
    if (formValue.city_id) {
      fetchAreas(formValue.city_id);
    } else {
      setAreaList([]);
    }
    // eslint-disable-next-line
  }, [formValue.city_id]);

  const handleModalComplete = (type) => {
    if (type === "state") fetchStates();
    if (type === "city" && formValue.state_id) fetchCities(formValue.state_id);
    if (type === "area" && formValue.city_id) fetchAreas(formValue.city_id);
    setOpenModal((prev) => ({ ...prev, [type]: false }));
    setEditModal((prev) => ({ ...prev, [type]: false }));
  };

  const handleOpen = (type, editing = false) => {
    setOpenModal((prev) => ({ ...prev, [type]: true }));
    setEditModal((prev) => ({ ...prev, [type]: editing }));
  };

  const handleExtraDetailChange = (key, value) => {
    setFormValue((prev) => ({
      ...prev,
      extra_details: { ...(prev.extra_details || {}), [key]: value },
    }));
  };

  // ---------- Images (works for both add & edit) ----------
  const rebuildPreviews = (existing, files) => {
    Promise.all([
      ...existing.map((img) => `${imageUrl}${img.image_path}`),
      ...files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          }),
      ),
    ]).then(setPreviews);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const slotsLeft = 5 - (existingImages.length + newImages.length);
    const accepted = files.slice(0, Math.max(0, slotsLeft));
    const updated = [...newImages, ...accepted];
    setNewImages(updated);
    rebuildPreviews(existingImages, updated);
  };

  const handleRemoveImage = (idx) => {
    if (idx < existingImages.length) {
      const updated = existingImages.filter((_, i) => i !== idx);
      setExistingImages(updated);
      rebuildPreviews(updated, newImages);
    } else {
      const nIdx = idx - existingImages.length;
      const updated = newImages.filter((_, i) => i !== nIdx);
      setNewImages(updated);
      rebuildPreviews(existingImages, updated);
    }
    if (mainImageIndex === idx) setMainImageIndex(0);
    else if (mainImageIndex > idx) setMainImageIndex((prev) => prev - 1);
  };

  // ---------- Validation ----------
  const validateForm = () => {
    const errs = [];

    if (!formValue.property_name?.trim()) errs.push("Property Title is required");
    if (!formValue.property_description?.trim())
      errs.push("Property Description is required");
    if (!formValue.state_id) errs.push("State is required");
    if (!formValue.city_id) errs.push("City is required");
    if (!formValue.area_id) errs.push("Area is required");
    if (!formValue.property_type_id) errs.push("Property Type is required");
    if (!formValue.status) errs.push("Status is required");
    if (!formValue.map_link?.trim()) errs.push("Map Link is required");

    if (!multiplePricings || multiplePricings.length === 0) {
      errs.push("At least one Pricing option is required");
    } else {
      multiplePricings.forEach((pricing, index) => {
        if (!pricing.seat_category)
          errs.push(`Pricing Option ${index + 1}: Category is required`);
        if (pricingConfig.hasOccupancyType && !pricing.occupancy_type)
          errs.push(`Pricing Option ${index + 1}: Occupancy Type is required`);
        if (!pricing.duration)
          errs.push(`Pricing Option ${index + 1}: Duration is required`);
      });
    }

    if (
      formValue.average_rating !== "" &&
      formValue.average_rating !== undefined &&
      formValue.average_rating !== null
    ) {
      const rating = parseFloat(formValue.average_rating);
      if (isNaN(rating) || rating < 0 || rating > 5)
        errs.push("Average Rating must be a number between 0 and 5");
    }
    if (
      formValue.review_count !== "" &&
      formValue.review_count !== undefined &&
      formValue.review_count !== null
    ) {
      const count = parseInt(formValue.review_count, 10);
      if (isNaN(count) || count < 0)
        errs.push("Review Count must be a non-negative integer");
    }

    if (!formValue.meta_title?.trim()) errs.push("Meta Title is required");
    if (!formValue.meta_keywords || formValue.meta_keywords.length === 0)
      errs.push("At least one Meta Keyword is required");
    if (!formValue.meta_description?.trim())
      errs.push("Meta Description is required");

    return errs;
  };

  const showValidationErrors = (validationErrors) => {
    toast.error(
      <div>
        <strong style={{ display: "block", marginBottom: "4px" }}>
          Please fix the following validation errors:
        </strong>
        <ul
          style={{
            paddingLeft: "20px",
            listStyleType: "disc",
            fontSize: "13px",
            margin: 0,
          }}
        >
          {validationErrors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      </div>,
      { duration: 5000 },
    );
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("property_title", formValue.property_name);
    formData.append("property_description", formValue.property_description);
    formData.append("property_street_address", formValue.property_address || "");
    formData.append("state_id", formValue.state_id);
    formData.append("city_id", formValue.city_id);
    formData.append("area_id", formValue.area_id);
    formData.append("property_type", formValue.property_type_id);
    if (formValue.brand_id) formData.append("brand_id", formValue.brand_id);
    formData.append("alt_name", formValue.alt_name || "");
    formData.append("space_category", formValue.space_category || "");
    formData.append("line_1", formValue.line_1 || "");
    formData.append("line_2", formValue.line_2 || "");
    formData.append("pincode", formValue.pincode || "");
    formData.append("landmark", formValue.landmark || "");
    formData.append("longitude", formValue.longitude || "");
    formData.append("latitude", formValue.latitude || "");
    formData.append(
      "extra_details",
      JSON.stringify({
        ...(isManaged ? formValue.extra_details : {}),
        open_days: openDays,
      }),
    );
    formData.append("year_built", formValue.year_built || "");
    formData.append("map", formValue.map_link);
    formData.append("status", formValue.status ?? "active");
    formData.append("is_property_favourite", formValue.is_property_favourite ? 1 : 0);
    formData.append("average_rating", formValue.average_rating ?? "");
    formData.append("review_count", formValue.review_count ?? "");
    formData.append("meta_title", formValue.meta_title);
    formData.append("meta_description", formValue.meta_description);

    // Pricing is always "multiple pricing" now — single pricing is gone.
    formData.append("has_multiple_pricing", "1");
    multiplePricings.forEach((pricing, index) => {
      formData.append(`multiple_pricings[${index}][seat_category]`, pricing.seat_category || "");
      formData.append(`multiple_pricings[${index}][occupancy_type]`, pricing.occupancy_type || "");
      formData.append(`multiple_pricings[${index}][duration]`, pricing.duration || "");
      formData.append(`multiple_pricings[${index}][amount]`, pricing.amount || "");
      formData.append(`multiple_pricings[${index}][marked_amount]`, pricing.marked_amount || "");
    });

    formValue.meta_keywords.forEach((keyword) => formData.append("meta_keywords[]", keyword));
    formValue.amenities.forEach((id) => formData.append("amenities[]", id));
    formValue.nearby_locations.forEach((loc, index) => {
      if (loc.nearby_location_id) {
        formData.append(`nearby_locations[${index}][nearby_location_id]`, loc.nearby_location_id);
        formData.append(`nearby_locations[${index}][name]`, loc.name || "");
        formData.append(`nearby_locations[${index}][distance]`, loc.distance || "");
      }
    });

    // Images
    if (isEdit) {
      existingImages.forEach((img) => formData.append("existing_images[]", img.id));
    }
    newImages.forEach((file) => formData.append("images[]", file));
    formData.append("main_image_index", mainImageIndex);

    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }

    setAddLoader(true);
    const formData = buildFormData();

    try {
      const url = isEdit
        ? `${apiUrl}admin/update-property/${propertyId}`
        : apiUrl + "admin/add-new-property";

      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: authData.token, Accept: "application/json" },
        body: formData,
      });
      const textResult = await response.text();
      console.log("HTTP Status:", response.status);
      console.log("Response text:", textResult);

      let result;
      try {
        result = textResult ? JSON.parse(textResult) : {};
      } catch (e) {
        throw new Error(`Server returned status ${response.status} with an invalid non-JSON response.`);
      }

      if (response.ok && result?.success) {
        toast.success(result.message || (isEdit ? "Property updated successfully!" : "Property added successfully!"));
        if (isEdit) navigate("/admin/properties");
      } else {
        toast.error(result?.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setAddLoader(false);
    }
  };

  const handleAmenityChange = (value, checked) => {
    setFormValue((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((id) => id !== value),
    }));
  };

  const handleToggleAllAmenities = () => {
    setFormValue((prev) => ({
      ...prev,
      amenities:
        amenities.length > 0 && prev.amenities.length === amenities.length
          ? []
          : amenities.map((a) => a.id),
    }));
  };

  const addNearbyLocationRow = () => {
    setFormValue((prev) => ({
      ...prev,
      nearby_locations: [
        ...prev.nearby_locations,
        { nearby_location_id: "", name: "", distance: "" },
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
        i === index ? { ...loc, [field]: value } : loc,
      ),
    }));
  };

  if (loading) return <DataLoader />;

  const submitLabel = isEdit ? "Update This Property" : "Add This Property";
  const submitLoadingLabel = isEdit ? "Updating Property..." : "Adding Property...";

  const SubmitButton = () => (
    <Button type="submit" appearance="primary" onClick={handleSubmit} disabled={addLoader}>
      {addLoader ? (
        <div className="flex items-center">
          <Loader />
          <span className="ml-2">{submitLoadingLabel}</span>
        </div>
      ) : (
        submitLabel
      )}
    </Button>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="mb-0 text-2xl font-bold tracking-tight text-ink">
          {isEdit ? "Update Property" : "Add New Property"}
        </h2>
        <SubmitButton />
      </div>

      <Form fluid className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Basic Information */}
          <SectionCard title="Basic Information">
            <div className="col-span-1 md:col-span-6">
              <Form.Group controlId="brandId">
                <Form.Label>Brand</Form.Label>
                <SelectPicker
                  data={[{ value: null, label: "None" }, ...brandsList]}
                  placeholder="Select Brand"
                  block
                  searchable
                  cleanable
                  value={formValue.brand_id}
                  onChange={(val) => setFormValue((prev) => ({ ...prev, brand_id: val }))}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-6">
              <Form.Group controlId="altName">
                <Form.Label>Alt Name</Form.Label>
                <Input
                  placeholder="Alt Name"
                  value={formValue.alt_name}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, alt_name: e }))}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="propertyTitle">
                <Form.Label>
                  Property Title<span className="text-red-500">*</span>
                </Form.Label>
                <Input
                  placeholder="Property Title"
                  value={formValue.property_name}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, property_name: e }))}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="propertyDescription">
                <Form.Label>
                  Property Description<span className="text-red-500">*</span>
                </Form.Label>
                <Input
                  as="textarea"
                  rows={4}
                  placeholder="Property Description"
                  value={formValue.property_description}
                  onChange={(e) =>
                    setFormValue((prev) => ({ ...prev, property_description: e }))
                  }
                />
              </Form.Group>
            </div>
          </SectionCard>

          {/* Address */}
          <SectionCard title="Address">
            <div className="col-span-1 md:col-span-6">
              <Form.Group controlId="address">
                <Form.Label>Street Address</Form.Label>
                <Input
                  placeholder="Enter Street Address"
                  value={formValue.property_address}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, property_address: e }))}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-3">
              <Form.Group controlId="line_1">
                <Form.Label>Line 1</Form.Label>
                <Input
                  placeholder="Enter Line 1"
                  value={formValue.line_1}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, line_1: e }))}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-3">
              <Form.Group controlId="line_2">
                <Form.Label>Line 2</Form.Label>
                <Input
                  placeholder="Enter Line 2"
                  value={formValue.line_2}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, line_2: e }))}
                />
              </Form.Group>
            </div>

            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="state">
                <Form.Label className="flex items-center justify-between">
                  <span>
                    State<span className="text-red-500">*</span>
                  </span>
                  <Button type="button" appearance="link" size="sm" onClick={() => handleOpen("state")}>
                    Add State
                  </Button>
                </Form.Label>
                <SelectPicker
                  data={stateList}
                  value={formValue.state_id}
                  onChange={(val) =>
                    setFormValue((fv) => ({ ...fv, state_id: val, city_id: null, area_id: null }))
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
                    City<span className="text-red-500">*</span>
                  </span>
                  <Button type="button" appearance="link" size="sm" onClick={() => handleOpen("city")}>
                    Add City
                  </Button>
                </Form.Label>
                <SelectPicker
                  data={cityList}
                  value={formValue.city_id}
                  onChange={(val) => setFormValue((fv) => ({ ...fv, city_id: val, area_id: null }))}
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
                    Area<span className="text-red-500">*</span>
                  </span>
                  <Button type="button" appearance="link" size="sm" onClick={() => handleOpen("area")}>
                    Add Area
                  </Button>
                </Form.Label>
                <SelectPicker
                  data={areaList}
                  value={formValue.area_id}
                  onChange={(val) => setFormValue((fv) => ({ ...fv, area_id: val }))}
                  disabled={!formValue.city_id}
                  placeholder="Select Area"
                  block
                  searchable
                  cleanable
                />
              </Form.Group>
            </div>

            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="pincode">
                <Form.Label>Pincode</Form.Label>
                <Input
                  placeholder="Enter Pincode"
                  value={formValue.pincode}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, pincode: e }))}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="landmark">
                <Form.Label>Landmark</Form.Label>
                <Input
                  placeholder="Enter Landmark"
                  value={formValue.landmark}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, landmark: e }))}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-4">
              <Form.Group controlId="mapLink">
                <Form.Label>
                  Map Link<span className="text-red-500">*</span>
                </Form.Label>
                <Input
                  placeholder="Enter Map Link"
                  value={formValue.map_link}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, map_link: e }))}
                />
              </Form.Group>
            </div>
          </SectionCard>

          {/* Property Details */}
          <SectionCard title="Property Details">
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="propertyType">
                <Form.Label className="flex items-center justify-between">
                  <span>
                    Property Type<span className="text-red-500">*</span>
                  </span>
                  <Button
                    type="button"
                    appearance="link"
                    size="sm"
                    onClick={() => handleOpen("propertyType")}
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
                  onChange={handlePropertyTypeChange}
                />
              </Form.Group>
            </div>
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
                  onChange={(val) => setFormValue((fv) => ({ ...fv, average_rating: val }))}
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
                  onChange={(val) => setFormValue((fv) => ({ ...fv, review_count: val }))}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-3">
              <Form.Group controlId="status">
                <Form.Label>
                  Status<span className="text-red-500">*</span>
                </Form.Label>
                <SelectPicker
                  data={[
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                    { label: "Draft", value: "draft" },
                  ]}
                  placeholder="Select Status"
                  block
                  searchable={false}
                  cleanable
                  value={formValue.status}
                  onChange={(val) => setFormValue((fv) => ({ ...fv, status: val }))}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-3">
              <Form.Group controlId="yearBuilt">
                <Form.Label>Year Built</Form.Label>
                <Input
                  placeholder="e.g. 2018"
                  value={formValue.year_built}
                  onChange={(val) => setFormValue((fv) => ({ ...fv, year_built: val }))}
                />
              </Form.Group>
            </div>

            {isManaged && (
              <>
                <div className="col-span-1 md:col-span-12">
                  <h5 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mt-2 mb-1">
                    Managed Office Details
                  </h5>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Contacted Person</Form.Label>
                    <Input
                      value={formValue.extra_details?.contacted_person || ""}
                      onChange={(v) => handleExtraDetailChange("contacted_person", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Contact No</Form.Label>
                    <Input
                      value={formValue.extra_details?.contact_no || ""}
                      onChange={(v) => handleExtraDetailChange("contact_no", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Inventory Type</Form.Label>
                    <Input
                      value={formValue.extra_details?.inventory_type || ""}
                      onChange={(v) => handleExtraDetailChange("inventory_type", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Furnished</Form.Label>
                    <Input
                      value={formValue.extra_details?.furnished || ""}
                      onChange={(v) => handleExtraDetailChange("furnished", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Building Developer</Form.Label>
                    <Input
                      value={formValue.extra_details?.building_developer || ""}
                      onChange={(v) => handleExtraDetailChange("building_developer", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Super Area</Form.Label>
                    <Input
                      value={formValue.extra_details?.super_area || ""}
                      onChange={(v) => handleExtraDetailChange("super_area", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Carpet Area</Form.Label>
                    <Input
                      value={formValue.extra_details?.carpet_area || ""}
                      onChange={(v) => handleExtraDetailChange("carpet_area", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Building Area</Form.Label>
                    <Input
                      value={formValue.extra_details?.building_area || ""}
                      onChange={(v) => handleExtraDetailChange("building_area", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Number of Floor</Form.Label>
                    <Input
                      value={formValue.extra_details?.number_of_floor || ""}
                      onChange={(v) => handleExtraDetailChange("number_of_floor", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Seating Capacity</Form.Label>
                    <Input
                      value={formValue.extra_details?.seating_capacity || ""}
                      onChange={(v) => handleExtraDetailChange("seating_capacity", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Available From</Form.Label>
                    <Input
                      type="date"
                      value={formValue.extra_details?.available_from || ""}
                      onChange={(v) => handleExtraDetailChange("available_from", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Ready to deliver in (Months)</Form.Label>
                    <Input
                      value={formValue.extra_details?.ready_to_deliver_in || ""}
                      onChange={(v) => handleExtraDetailChange("ready_to_deliver_in", v)}
                    />
                  </Form.Group>
                </div>
                <div className="col-span-1 md:col-span-4">
                  <Form.Group>
                    <Form.Label>Lock-in Period</Form.Label>
                    <Input
                      value={formValue.extra_details?.lock_in_period || ""}
                      onChange={(v) => handleExtraDetailChange("lock_in_period", v)}
                    />
                  </Form.Group>
                </div>
              </>
            )}
          </SectionCard>

          {/* Pricing — single pricing removed, multiple pricing is now the only mode.
              Rows stack one below another sharing one column grid; last column is
              the remove ("x") action. */}
          <SectionCard
            title={`Pricing (${pricingConfig.label})`}
            action={
              <Button type="button" appearance="primary" color="blue" size="sm" onClick={addMultiplePricing}>
                + Add Pricing Option
              </Button>
            }
          >
            <div className="col-span-1 md:col-span-12 border border-slate-200 rounded-lg overflow-hidden">
              {/* Header row */}
              <div
                className="hidden md:grid gap-3 bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider items-center"
                style={{
                  gridTemplateColumns: pricingConfig.hasOccupancyType
                    ? "2fr 2fr 1.4fr 1fr 1fr 40px"
                    : pricingConfig.hasNoOfSeats
                      ? "2fr 1.4fr 1.4fr 1fr 1fr 40px"
                      : "2fr 1.4fr 1fr 1fr 40px",
                }}
              >
                <span>Category</span>
                {pricingConfig.hasOccupancyType && <span>Occupancy Type</span>}
                <span>Duration</span>
                {pricingConfig.hasNoOfSeats && <span>No of Seats</span>}
                <span>Amount</span>
                <span>Marked Amount</span>
                <span></span>
              </div>

              {/* Data rows */}
              <div className="divide-y divide-slate-100">
                {multiplePricings.map((pricing, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid gap-3 px-4 py-3 items-center"
                    style={{
                      gridTemplateColumns: pricingConfig.hasOccupancyType
                        ? "2fr 2fr 1.4fr 1fr 1fr 40px"
                        : pricingConfig.hasNoOfSeats
                          ? "2fr 1.4fr 1.4fr 1fr 1fr 40px"
                          : "2fr 1.4fr 1fr 1fr 40px",
                    }}
                  >
                    <SelectPicker
                      data={pricingConfig.categories.map((c) => ({ label: c, value: c }))}
                      placeholder="Select Category"
                      block
                      cleanable={false}
                      value={pricing.seat_category}
                      onChange={(val) => handleMultiplePricingChange(index, "seat_category", val)}
                    />
                    {pricingConfig.hasOccupancyType && (
                      <SelectPicker
                        data={pricingConfig.occupancyOptions.map((o) => ({ label: o, value: o }))}
                        placeholder="Select Occupancy"
                        block
                        cleanable={false}
                        value={pricing.occupancy_type}
                        onChange={(val) => handleMultiplePricingChange(index, "occupancy_type", val)}
                      />
                    )}
                    <Input
                      placeholder="e.g. Monthly, Daily"
                      value={pricing.duration}
                      onChange={(val) => handleMultiplePricingChange(index, "duration", val)}
                    />
                    {pricingConfig.hasNoOfSeats && (
                      <Input
                        placeholder="No of Seats"
                        value={pricing.no_of_seats}
                        onChange={(val) => handleMultiplePricingChange(index, "no_of_seats", val)}
                      />
                    )}
                    <Input
                      placeholder="Amount"
                      value={pricing.amount}
                      onChange={(val) => handleMultiplePricingChange(index, "amount", val)}
                    />
                    <Input
                      placeholder="Optional"
                      value={pricing.marked_amount}
                      onChange={(val) => handleMultiplePricingChange(index, "marked_amount", val)}
                    />
                    <button
                      type="button"
                      title="Remove"
                      disabled={multiplePricings.length <= 1}
                      onClick={() => removeMultiplePricing(index)}
                      className="justify-self-center text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Open Days — weekly schedule sent as { days: [...], opening_time, closing_time } */}
          {(isCoworking || isManaged) && (
            <SectionCard
              title="Open Days"
              action={
                <Button
                  type="button"
                  appearance="subtle"
                  size="sm"
                  onClick={handleToggleAllDays}
                >
                  {(openDays.days || []).length === WEEK_DAYS.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              }
            >
              <div className="col-span-1 md:col-span-12">
                <Form.Group controlId="openDays">
                  <Form.Label>Days Open</Form.Label>
                  <CheckboxGroup
                    inline
                    value={openDays.days}
                    onChange={handleOpenDaysChange}
                  >
                    {WEEK_DAYS.map((day) => (
                      <Checkbox key={day} value={day}>
                        {day}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </Form.Group>
              </div>
              <div className="col-span-1 md:col-span-6">
                <Form.Group controlId="openingTime">
                  <Form.Label>Opening Time</Form.Label>
                  <Input
                    type="time"
                    value={openDays.opening_time}
                    onChange={handleOpeningTimeChange}
                  />
                </Form.Group>
              </div>
              <div className="col-span-1 md:col-span-6">
                <Form.Group controlId="closingTime">
                  <Form.Label>Closing Time</Form.Label>
                  <Input
                    type="time"
                    value={openDays.closing_time}
                    onChange={handleClosingTimeChange}
                  />
                </Form.Group>
              </div>
            </SectionCard>
          )}

          {/* Amenities */}
          <SectionCard
            title="Amenities *"
            action={
              <div className="flex items-center gap-2">
                {amenities.length > 0 && (
                  <Button
                    type="button"
                    appearance="subtle"
                    size="sm"
                    onClick={handleToggleAllAmenities}
                  >
                    {formValue.amenities.length === amenities.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                )}
                <Button type="button" appearance="link" size="sm" onClick={() => handleOpen("amenities")}>
                  Add Amenities
                </Button>
              </div>
            }
          >
            {amenities.map((amenity) => (
              <div className="col-span-1 md:col-span-3" key={amenity.id}>
                <Checkbox
                  value={amenity.id}
                  checked={formValue.amenities.includes(amenity.id)}
                  onChange={handleAmenityChange}
                >
                  {amenity.name}
                  {amenity.icon && (
                    <span className="text-[10px] text-gray-400 ml-1 font-mono">[{amenity.icon}]</span>
                  )}
                </Checkbox>
              </div>
            ))}
          </SectionCard>

          {/* Nearby Facilities */}
          <SectionCard
            title="Nearby Facilities"
            action={
              <div className="flex gap-2">
                <Button type="button" color="violet" appearance="primary" size="sm" onClick={addNearbyLocationRow}>
                  + Add Row
                </Button>
                <Button
                  type="button"
                  color="violet"
                  appearance="subtle"
                  size="sm"
                  onClick={() => handleOpen("nearbyLocations")}
                >
                  Manage Facility Types
                </Button>
              </div>
            }
          >
            <div className="col-span-1 md:col-span-12">
              {formValue.nearby_locations.length === 0 ? (
                <div className="text-center py-8 border rounded border-dashed border-gray-300 text-gray-500 bg-gray-50/50">
                  No nearby facilities added yet. Click "+ Add Row" to start adding facilities.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="grid grid-cols-12 gap-4 bg-slate-50 border-b border-gray-200 px-4 py-3 font-semibold text-xs text-slate-600 uppercase tracking-wider items-center">
                    <div className="col-span-4">Facility Type <span className="text-red-500">*</span></div>
                    <div className="col-span-4">Name <span className="text-red-500">*</span></div>
                    <div className="col-span-2">Distance (km) <span className="text-red-500">*</span></div>
                    <div className="col-span-2 text-center">Action</div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {formValue.nearby_locations.map((loc, index) => (
                      <div className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-slate-50/40" key={index}>
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
                              handleNearbyLocationRowChange(index, "nearby_location_id", value)
                            }
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            placeholder="e.g. Indira Gandhi Metro"
                            value={loc.name || ""}
                            onChange={(value) => handleNearbyLocationRowChange(index, "name", value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            placeholder="e.g. 1.5"
                            value={loc.distance || ""}
                            onChange={(value) => handleNearbyLocationRowChange(index, "distance", value)}
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
          </SectionCard>

          {/* Media */}
          <SectionCard title="Property Media *">
            <div className="col-span-1 md:col-span-12">
              {previews.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-slate-600 text-sm">Main Image:</label>
                  <select
                    value={mainImageIndex}
                    onChange={(e) => setMainImageIndex(Number(e.target.value))}
                    className="font-semibold text-blue-700 border border-slate-300 rounded px-2 py-1 text-sm"
                  >
                    {previews.map((_, idx) => (
                      <option key={idx} value={idx}>
                        {idx + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="upload-img-container">
                {previews.map((src, idx) => (
                  <div
                    key={idx}
                    className={`upload-img-preview-box ${mainImageIndex === idx ? "main-image-border" : ""}`}
                    style={{
                      position: "relative",
                      border: mainImageIndex === idx ? "3px solid #0070f3" : "1px solid #eee",
                    }}
                  >
                    <button
                      type="button"
                      title="Remove"
                      className="upload-img-remove-btn"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      &times;
                    </button>
                    <img src={src} alt={`Preview ${idx + 1}`} />
                  </div>
                ))}
                {previews.length < 5 && (
                  <label className="upload-img-uploader-label">
                    +
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
              </div>
              <small className="text-muted block mt-1">Max 5 images. Only images allowed.</small>
            </div>
          </SectionCard>

          {/* Meta Information */}
          <SectionCard title="Meta Information">
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="metaTitle">
                <Form.Label>
                  Meta Title<span className="text-red-500">*</span>
                </Form.Label>
                <Input
                  placeholder="Meta Title"
                  value={formValue.meta_title}
                  onChange={(e) => {
                    setMetaTouched((t) => ({ ...t, title: true }));
                    setFormValue((prev) => ({ ...prev, meta_title: e }));
                  }}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="metaDescription">
                <Form.Label>
                  Meta Description<span className="text-red-500">*</span>
                </Form.Label>
                <Input
                  as="textarea"
                  rows={2}
                  placeholder="Meta Description"
                  value={formValue.meta_description}
                  onChange={(e) => {
                    setMetaTouched((t) => ({ ...t, description: true }));
                    setFormValue((prev) => ({ ...prev, meta_description: e }));
                  }}
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-12">
              <Form.Group controlId="metaKeywords">
                <Form.Label>
                  Meta Keywords<span className="text-red-500">*</span>
                </Form.Label>
                <TagInput
                  trigger={["Enter", "Space", "Comma"]}
                  placeholder="Meta Keywords"
                  style={{ width: "100%" }}
                  value={formValue.meta_keywords}
                  onChange={(e) => {
                    setMetaTouched((t) => ({ ...t, keywords: true }));
                    setFormValue((prev) => ({ ...prev, meta_keywords: e }));
                  }}
                />
              </Form.Group>
            </div>
          </SectionCard>

          <div className="col-span-1 md:col-span-12 flex items-center justify-end">
            <SubmitButton />
          </div>
        </div>
      </Form>

      <StateModal
        openStateModal={openModal.state}
        setOpenStateModal={(s) => setOpenModal((prev) => ({ ...prev, state: s }))}
        edit={{ editing: editModal.state, data: null }}
        onComplete={() => handleModalComplete("state")}
      />
      <CityModal
        openCityModal={openModal.city}
        setOpenCityModal={(s) => setOpenModal((prev) => ({ ...prev, city: s }))}
        edit={{ editing: editModal.city, data: null }}
        token={authData.token}
        onComplete={() => handleModalComplete("city")}
        stateList={stateList}
      />
      <AreaModal
        openAreaModal={openModal.area}
        setOpenAreaModal={(s) => setOpenModal((prev) => ({ ...prev, area: s }))}
        edit={{ editing: editModal.area, data: null }}
        token={authData.token}
        onComplete={() => handleModalComplete("area")}
        stateList={stateList}
      />
      <PropertyTypesModal
        open={openModal.propertyType}
        onClose={() => setOpenModal((prev) => ({ ...prev, propertyType: false }))}
        edit={editModal.propertyType}
        get_all_property_types={get_all_property_types}
      />
      <AmenitiesModal
        openAmenitiesModal={openModal.amenities}
        setOpenAmenitiesModal={() => setOpenModal((prev) => ({ ...prev, amenities: false }))}
        edit={editModal.amenities}
        get_all_amenities={get_all_amenities}
      />
      <NearbyLocationsModal
        openAmenitiesModal={openModal.nearbyLocations}
        setOpenAmenitiesModal={() => setOpenModal((prev) => ({ ...prev, nearbyLocations: false }))}
        edit={editModal.nearbyLocations}
        get_all_nearby_locations={get_all_nearby_locations}
      />
    </>
  );
}

export default PropertyForm;