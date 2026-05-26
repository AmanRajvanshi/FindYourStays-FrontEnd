import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router';
import { Pagination, SelectPicker } from 'rsuite';
import { apiUrl, domainUrl } from '../../../envConfig';
import MainLoader from '../../components/layoutComponents/MainLoader';
import FilterModal from '../../components/sharedComponents/FilterModal';
import SinglePropertyCard from '../../components/sharedComponents/SinglePropertyCard';
import {
  occupancyTypeOptions,
  pricingRangeOptions,
  sharingTypeOptions,
} from '../../consonants/propertyOptions';

export async function loader({ params }) {
  const { propertyId, cityId } = params;

  try {
    let propertyName = 'Properties';
    let cityName = 'All Cities';

    // Fetch property types
    if (propertyId) {
      const response = await fetch(`${apiUrl}website/get-all-property-types`);
      const json = await response.json();

      if (json.status) {
        const propertyType = json.data.find(
          (type) => type.id.toString() === propertyId
        );
        if (propertyType) {
          propertyName = propertyType.name;
        }
      }
    }

    // Fetch cities
    if (cityId && cityId !== '0') {
      const response = await fetch(
        `${apiUrl}website/get-all-cities?paginate=0`
      );
      const json = await response.json();

      if (json.status) {
        const city = json.data.find((c) => c.id.toString() === cityId);
        if (city) {
          cityName = city.city_name;
        }
      }
    }

    return { propertyName, cityName, propertyId, cityId };
  } catch (error) {
    console.error('Loader error:', error);
    return {
      propertyName: 'Properties',
      cityName: 'All Cities',
      propertyId,
      cityId,
    };
  }
}

export function meta({ data }) {
  const {
    propertyName = 'Properties',
    cityName = 'All Cities',
    propertyId,
    cityId,
  } = data || {};

  // Create dynamic title and description
  const title = `Get the best ${propertyName} in ${cityName} | Find Your Stays`;
  const description = `Browse and find the best ${propertyName} in ${cityName}. Discover your perfect accommodation with Find Your Stays - verified properties, zero brokerage, flexible terms.`;

  // Create comprehensive keywords
  const keywords = [
    `${propertyName} in ${cityName}`,
    `best ${propertyName} ${cityName}`,
    `affordable ${propertyName}`,
    `${propertyName} near me`,
    `${propertyName} booking`,
    `${propertyName} rental`,
    'Find Your Stays',
    'zero brokerage',
    'verified properties',
    'accommodation booking',
    'PG booking',
    'hostel booking',
    'co-living spaces',
    cityName !== 'All Cities' ? `${cityName} accommodation` : 'accommodation',
    cityName !== 'All Cities' ? `${cityName} rental` : 'rental',
    'student accommodation',
    'working professional stay',
    'furnished rooms',
    'shared accommodation',
  ]
    .filter(Boolean)
    .join(', ');

  // Create URL for this listing page
  const listingUrl = `${domainUrl}/property-listing/${propertyId || 'all'}/${
    cityId || 'all'
  }`;

  return [
    { title },
    { name: 'description', content: description },

    // Enhanced keywords
    { name: 'keywords', content: keywords },

    // Open Graph tags
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: listingUrl },
    { property: 'og:site_name', content: 'Find Your Stays' },
    { property: 'og:locale', content: 'en_IN' },
    { property: 'og:image', content: `${domainUrl}/property-listing-og.jpg` }, // Add a generic listing page image

    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    {
      name: 'twitter:image',
      content: `${domainUrl}/property-listing-twitter.jpg`,
    },
    { name: 'twitter:site', content: '@FindYourStays' },

    // Additional SEO tags
    { name: 'author', content: 'Find Your Stays' },
    {
      name: 'robots',
      content: 'index, follow, max-snippet:-1, max-image-preview:large',
    },
    { name: 'language', content: 'en' },
    { name: 'revisit-after', content: '3 days' }, // Frequent updates for listings
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'theme-color', content: '#68418b' },

    // Geographic tags (conditional on city)
    ...(cityName !== 'All Cities'
      ? [
          { name: 'geo.region', content: 'IN' },
          { name: 'geo.placename', content: `${cityName}, India` },
        ]
      : [
          { name: 'geo.region', content: 'IN' },
          { name: 'geo.placename', content: 'India' },
        ]),

    // Content classification
    {
      name: 'classification',
      content: 'real estate listing, property search, accommodation',
    },
    {
      name: 'category',
      content: `Real Estate, ${propertyName}, Accommodation`,
    },
    {
      name: 'coverage',
      content: cityName !== 'All Cities' ? cityName : 'India',
    },

    // Canonical URL
    { tagName: 'link', rel: 'canonical', href: listingUrl },

    // Schema.org structured data for ItemList (Property Listings)
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${propertyName} in ${cityName}`,
        description: description,
        url: listingUrl,
        numberOfItems: 'TBD', // You can make this dynamic from your API
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: [], // This would be populated dynamically with actual listings
        provider: {
          '@type': 'Organization',
          name: 'Find Your Stays',
          url: domainUrl,
        },
      }),
    },

    // WebPage schema
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description: description,
        url: listingUrl,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Find Your Stays',
          url: domainUrl,
        },
        about: {
          '@type': 'Thing',
          name: `${propertyName} Listings`,
          description: `Find the best ${propertyName} accommodations`,
        },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: domainUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Properties',
              item: `${domainUrl}/property-listing`,
            },
            ...(propertyName !== 'Properties'
              ? [
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: propertyName,
                    item: `${domainUrl}/property-listing/${propertyId}`,
                  },
                ]
              : []),
            ...(cityName !== 'All Cities'
              ? [
                  {
                    '@type': 'ListItem',
                    position: propertyName !== 'Properties' ? 4 : 3,
                    name: cityName,
                    item: listingUrl,
                  },
                ]
              : []),
          ],
        },
        mainEntity: {
          '@type': 'SearchResultsPage',
          name: `${propertyName} Search Results`,
          about: `${propertyName} in ${cityName}`,
        },
      }),
    },

    // Local Business/Service Area schema (if specific city)
    ...(cityName !== 'All Cities'
      ? [
          {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: `${propertyName} Booking Service in ${cityName}`,
              description: `Professional ${propertyName} booking and rental services in ${cityName}`,
              provider: {
                '@type': 'Organization',
                name: 'Find Your Stays',
                url: domainUrl,
              },
              areaServed: {
                '@type': 'City',
                name: cityName,
                addressCountry: 'India',
              },
              serviceType: propertyName,
              availableChannel: {
                '@type': 'ServiceChannel',
                serviceUrl: listingUrl,
                serviceName: 'Online Booking Platform',
              },
            }),
          },
        ]
      : []),
  ];
}

function PropertyListing() {
  const { propertyId, cityId } = useParams();
  const navigate = useNavigate();
  const loaderData = useLoaderData();

  const [openFilterModal, setOpenFilterModal] = useState(false);

  // Initialize states from params if present, else use defaults
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState(''); // 0 means all cities
  const [selectedArea, setSelectedArea] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sharingType, setSharingType] = useState('');
  const [occupancyType, setOccupancyType] = useState('');

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const getPageTitle = () => {
    if (loaderData) {
      const { propertyName, cityName } = loaderData;
      if (propertyName === 'Properties' && cityName === 'All Cities') {
        return 'Properties';
      }
      return `${propertyName} in ${cityName}`;
    }
    return 'Properties';
  };

  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 12,
    current_page: 1,
    last_page: 1,
    from: null,
    to: null,
  });

  // Dynamic data from API
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  // Fetch property types and cities on component mount
  useEffect(() => {
    fetchPropertyTypes();
    fetchCities();
  }, []);

  // Fetch areas when city changes (and city is not "0")
  useEffect(() => {
    if (city && city !== '0') {
      fetchAreas(city);
    } else {
      setAreas([]);
      setSelectedArea('');
    }
  }, [city]);

  // Fetch properties when filters change
  useEffect(() => {
    if (propertyType) {
      fetchProperties();
    }
  }, [
    propertyType,
    city,
    selectedArea,
    priceRange,
    sharingType, // Changed from availability
    occupancyType, // Changed from sharing
    pagination.current_page,
  ]);

  // Update states when URL params change
  useEffect(() => {
    setPropertyType(propertyId || '');
    setCity(cityId || '0');
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  }, [propertyId, cityId]);

  // Update URL when property type or city changes
  const updateURL = (newPropertyType, newCity) => {
    const propertyTypeParam = newPropertyType || propertyType || '';
    const cityParam = newCity || city || '0';

    if (propertyTypeParam) {
      navigate(`/property-listing/${propertyTypeParam}/${cityParam}`, {
        replace: true,
      });
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const response = await fetch(`${apiUrl}website/get-all-property-types`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const json = await response.json();
      if (json.status) {
        const formattedTypes = json.data.map((type) => ({
          label: type.name,
          value: type.id.toString(), // Convert to string
        }));
        setPropertyTypes(formattedTypes);
      }
    } catch (error) {
      console.error('Error fetching property types:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch(
        `${apiUrl}website/get-all-cities?paginate=0`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );
      const json = await response.json();
      if (json.status) {
        const formattedCities = [
          { label: 'All Cities', value: '0' },
          ...json.data.map((city) => ({
            label: city.city_name,
            value: city.id.toString(), // Convert to string
          })),
        ];
        setCities(formattedCities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchAreas = async (cityId) => {
    try {
      const response = await fetch(
        `${apiUrl}website/get-area-by-city-web/${cityId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );
      const json = await response.json();
      if (json.status) {
        const formattedAreas = [
          ...json.data.map((area) => ({
            label: area.area_name,
            value: area.id,
          })),
        ];
        setAreas(formattedAreas);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    }
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (propertyType) params.append('type_id', propertyType);
    if (city) params.append('city_id', city);
    if (selectedArea) params.append('area_id', selectedArea);
    if (priceRange) params.append('price_range', priceRange);
    if (sharingType) params.append('sharing_type', sharingType);
    if (occupancyType) params.append('occupancy_type', occupancyType);

    params.append('page', pagination.current_page.toString());
    params.append('per_page', pagination.per_page.toString());

    return params.toString();
  };

  const fetchProperties = async () => {
    if (!propertyType) {
      setProperties([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}website/fetch-property-through-city-and-type?${buildQueryParams()}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );

      const json = await response.json();

      if (json.status) {
        setProperties(json.data.data || []);

        setPagination((prev) => ({
          ...prev,
          total: json.data.total || 0,
          per_page: json.data.per_page || 12,
          current_page: json.data.current_page || 1,
          last_page: json.data.last_page || 1,
          from: json.data.from,
          to: json.data.to,
        }));
      } else {
        setProperties([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
        console.error('API Error:', json.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setProperties([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // Modified property type change handler
  const handlePropertyTypeChange = (value) => {
    setPropertyType(value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    // Keep the current city when changing property type
    updateURL(value, city);
  };

  // Modified city change handler
  const handleCityChange = (value) => {
    setCity(value);
    setSelectedArea(''); // Reset selected area when city changes
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    // Keep the current property type when changing city
    updateURL(propertyType, value);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, current_page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <MainLoader />;
  }

  return (
    <>
      <section className="our-listing py-4">
        <div className="container-fluid">
          {/* Header + Filters Row */}
          <div className="row pb-4 border-bottom align-items-center">
            <div className="col-12 d-flex flex-wrap justify-content-between align-items-center gap-2">
              {/* Dynamic Heading */}
              <h3 className="breadcrumb_title m-0 fw-semibold fs-4">
                {getPageTitle()}
              </h3>

              {/* Filters: desktop full, mobile filter button */}
              <div className="d-none d-lg-flex flex-wrap justify-content-end gap-2">
                <SelectPicker
                  data={propertyTypes}
                  placeholder="Property Type"
                  style={{ minWidth: 160 }}
                  value={propertyType}
                  onChange={handlePropertyTypeChange}
                  cleanable={false}
                />
                <SelectPicker
                  data={cities}
                  placeholder="City"
                  style={{ minWidth: 140 }}
                  value={city}
                  onChange={handleCityChange}
                  cleanable={false}
                />
                <SelectPicker
                  data={pricingRangeOptions}
                  placeholder="Price Range"
                  style={{ minWidth: 150 }}
                  value={priceRange}
                  onChange={setPriceRange}
                  cleanable
                />
                <SelectPicker
                  data={sharingTypeOptions}
                  placeholder="Sharing Type"
                  style={{ minWidth: 130 }}
                  value={sharingType}
                  onChange={setSharingType}
                  cleanable
                />
                <SelectPicker
                  data={occupancyTypeOptions}
                  placeholder="Occupancy Type"
                  style={{ minWidth: 140 }}
                  value={occupancyType}
                  onChange={setOccupancyType}
                  cleanable
                />
              </div>

              {/* Mobile Filter Button */}
              <span
                className="flaticon-filter-results-button d-lg-none"
                onClick={() => setOpenFilterModal(true)}
              />
            </div>
          </div>

          {/* Mobile Filter Modal */}
          <FilterModal
            open={openFilterModal}
            setOpen={setOpenFilterModal}
            data={cities}
            propertyTypes={propertyTypes}
            priceRanges={pricingRangeOptions}
            sharingTypeOptions={sharingTypeOptions} // Updated prop name
            occupancyTypeOptions={occupancyTypeOptions} // Updated prop name
            areas={areas}
            propertyType={propertyType}
            setPropertyType={handlePropertyTypeChange}
            city={city}
            setCity={handleCityChange}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sharingType={sharingType} // Updated prop name
            setSharingType={setSharingType} // Updated prop name
            occupancyType={occupancyType} // Updated prop name
            setOccupancyType={setOccupancyType} // Updated prop name
          />

          {/* Areas row - Show only when a specific city is selected */}
          {city !== '0' && areas.length > 0 && (
            <div className="row pt-3">
              <div className="col-12 d-flex gap-3 align-items-center overflow-auto hide-scrollbar">
                <button
                  key="0"
                  className={`area-btn ${selectedArea === '0' ? 'active' : ''}`}
                  onClick={() => setSelectedArea('0')}
                >
                  All Areas
                </button>
                {areas.map((area) => (
                  <button
                    key={area.value}
                    className={`area-btn ${
                      selectedArea === area.value ? 'active' : ''
                    }`}
                    onClick={() => setSelectedArea(area.value)}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Property Cards */}
          <div className="row mt-4">
            {!propertyType ? (
              <div className="col-12 text-center py-5">
                <p className="text-muted fs-5">
                  Please select a property type to view properties.
                </p>
              </div>
            ) : properties.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="text-muted fs-5">
                  No properties found matching your criteria.
                </p>
              </div>
            ) : (
              properties.map((property) => (
                <div key={property.id} className="col-md-6 col-lg-3 mb-4">
                  <SinglePropertyCard property={property} />
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {properties.length > 0 && pagination.last_page > 1 && (
            <div className="row">
              <div className="col-12 d-flex justify-content-center mt-4">
                <Pagination
                  prev
                  last
                  next
                  first
                  size="sm"
                  ellipsis
                  total={pagination.total}
                  limit={pagination.per_page}
                  activePage={pagination.current_page}
                  onChangePage={handlePageChange}
                />
              </div>
            </div>
          )}

          {/* Results summary */}
          {properties.length > 0 && (
            <div className="row mt-3">
              <div className="col-12 text-center">
                <small className="text-muted">
                  Showing {pagination.from} to {pagination.to} of{' '}
                  {pagination.total} properties
                </small>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default PropertyListing;
