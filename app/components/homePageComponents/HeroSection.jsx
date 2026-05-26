import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Input } from 'rsuite';
import { apiUrl, imageUrl } from '../../../envConfig';
import AllCities from '../sharedComponents/AllCitiesModal';
import CounterBlock from '../sharedComponents/CounterBlock';
import CurrencyFormat from '../sharedComponents/CurrencyFormat';

function HeroSection({ allCities, propertyTypeList }) {
  const navigate = useNavigate();
  const [openAllCitiesModal, setOpenAllCitiesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Initialize with null and set in useEffect
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [fetchedProperties, setFetchedProperties] = useState([]);
  const [fetching, setFetching] = useState(false);

  // Set default property type when propertyTypeList loads
  useEffect(() => {
    if (propertyTypeList.length > 0 && !selectedPropertyType) {
      setSelectedPropertyType(propertyTypeList[0]); // Use the complete object
    }
  }, [propertyTypeList, selectedPropertyType]);

  // Set default city when allCities loads
  useEffect(() => {
    if (allCities.length > 0 && !selectedCity) {
      setSelectedCity(allCities[0]);
    }
  }, [allCities, selectedCity]);

  // Search in fetchedProperties (filter dropdown as user types)
  const handleSearch = (val) => {
    setSearchQuery(val);
    if (val.length > 0) {
      const result = fetchedProperties?.filter(
        (item) =>
          item.property_title?.toLowerCase().includes(val.toLowerCase()) ||
          (item.property_description &&
            item.property_description.toLowerCase().includes(val.toLowerCase()))
      );
      setFiltered(result);
      setShowDropdown(true);
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
  };

  // When selecting dropdown item, navigate to property detail page
  const handleSelect = (item) => {
    setShowDropdown(false);
    setFiltered([]);
    setSearchQuery(''); // Clear search query
    navigate(`/single-property/${item.slug}`);
  };

  useEffect(() => {
    if (!selectedPropertyType?.id || !selectedCity?.id) return;

    setFetching(true);
    fetch(
      apiUrl +
        `website/fetch-property-through-city-and-type?city_id=${selectedCity.id}&type_id=${selectedPropertyType.id}`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    )
      .then((res) => res.json())
      .then((json) => {
        if (json.status) setFetchedProperties(json.data.data || []);
        else setFetchedProperties([]);
      })
      .catch(() => setFetchedProperties([]))
      .finally(() => setFetching(false));
  }, [selectedPropertyType?.id, selectedCity?.id]);

  return (
    <>
      <div className="home-four">
        <div className="main-banner-wrapper">
          <div className="banner-style-one">
            <div
              className="heroSlider"
              style={{
                backgroundImage: "url('/images/home/1.jpg')",
              }}
            />
          </div>
        </div>
        <div className="container-fluid home_iconbox_container">
          <div className="row position-relative">
            <div className="col-lg-10 offset-lg-1 d-flex flex-column align-items-center">
              <div className="home_content home4 pt-0 w-100 d-flex flex-column align-items-center">
                <div className="home-text text-center">
                  <h2 className="fz55">
                    Creating Communities Through Comfortable Living
                  </h2>
                  <p className="fz18 text-white">
                    Discover flexible stays designed for modern living and
                    genuine community.
                  </p>
                </div>

                <div className="home_adv_srch_opt home4 mt-4 w-100 d-flex flex-column align-items-center">
                  {/* Tab Navigation */}
                  <ul
                    className="nav nav-pills justify-content-center mb-3"
                    id="pills-tab"
                    role="tablist"
                  >
                    {propertyTypeList?.length > 0 &&
                      propertyTypeList?.map((item, index) => (
                        <li className="nav-item" key={item.id || index}>
                          <a
                            className={`nav-link ${
                              selectedPropertyType?.id === item.id
                                ? 'active'
                                : ''
                            }`}
                            data-toggle="pill"
                            onClick={() => setSelectedPropertyType(item)} // Use complete item object
                            style={{ cursor: 'pointer' }}
                          >
                            {item.name}
                          </a>
                        </li>
                      ))}
                  </ul>

                  {/* Search Input box area */}
                  <div
                    style={{
                      maxWidth: 540,
                      width: '100%',
                      background: 'rgba(255,255,255, 0.102)',
                      borderRadius: 12,
                    }}
                    className="p-4"
                  >
                    {/* Subtitle */}
                    <div className="mb-2 text-start fw-medium text-white">
                      Discover the Best Short & Long-Term Stays in Your City,{' '}
                      {/* <strong className="text-thm2">
                        {selectedPropertyType?.name}
                      </strong>{' '}
                      in{' '}
                      <span style={{ fontWeight: 600 }}>
                        {selectedCity?.city_name}
                      </span>{ */}
                      or choose from all{' '}
                      <a
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontWeight: 'bold',
                          color: '#fff',
                        }}
                        onClick={() => setOpenAllCitiesModal(true)}
                      >
                        Cities
                      </a>
                    </div>

                    {/* Search Input and Button */}
                    <div className="d-flex align-items-center position-relative gap-2">
                      <Input
                        placeholder="Search properties..."
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => searchQuery && setShowDropdown(true)}
                        onBlur={() =>
                          setTimeout(() => setShowDropdown(false), 200)
                        }
                        style={{
                          fontSize: '1rem',
                          minWidth: 0,
                          borderRadius: 6,
                          flex: 1,
                        }}
                        disabled={fetching}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="btn btn-thm"
                        style={{ minWidth: 90, borderRadius: 6 }}
                        onClick={() =>
                          navigate(
                            `/property-listing/${selectedPropertyType?.id}/${selectedCity?.id}`
                          )
                        }
                        disabled={!selectedPropertyType?.id || !selectedCity}
                      >
                        {fetching ? 'Loading...' : 'Search'}
                      </button>

                      {/* Dropdown showing fetchedProperties filtered by search */}
                      {showDropdown && searchQuery && (
                        <div
                          className="dropdown rounded shadow bg-white"
                          style={{
                            position: 'absolute',
                            top: '110%',
                            left: 0,
                            right: 0,
                            zIndex: 99,
                            maxHeight: 200,
                            width: '100%',
                            overflowY: 'auto',
                            marginTop: 2,
                            display: 'block',
                            textAlign: 'left',
                          }}
                        >
                          {filtered.length > 0 ? (
                            filtered.map((item) => (
                              <div
                                key={item.id}
                                className="d-flex p-2 border-bottom align-items-center"
                                style={{ cursor: 'pointer' }}
                                onMouseDown={() => handleSelect(item)}
                              >
                                {(() => {
                                  const mainImage = item.images?.find(
                                    (img) => img.is_main === 1
                                  );
                                  return mainImage ? (
                                    <img
                                      src={`${imageUrl}${mainImage.image_path}`}
                                      alt={mainImage.alt_text || 'Property'}
                                      className="rounded mr-2"
                                      style={{
                                        width: 40,
                                        height: 40,
                                        objectFit: 'cover',
                                        marginRight: 10,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: 4,
                                        marginRight: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      🏠
                                    </div>
                                  );
                                })()}

                                <div>
                                  <h5 className="mb-0">
                                    {item.property_title || 'No title'}
                                  </h5>
                                  <p className="text-muted mb-0">
                                    Rent:{' '}
                                    <CurrencyFormat
                                      amount={item?.property_rent}
                                    />
                                    {item.property_street_address &&
                                      ` - ${item.property_street_address}`}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center">
                              <img
                                src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                                alt="No results"
                                width={64}
                                height={64}
                                style={{ opacity: 0.7 }}
                              />
                              <div className="mt-3 fw-semibold text-secondary">
                                No property found related to your search
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CounterBlock />
        </div>
      </div>

      <AllCities
        openAllCitiesModal={openAllCitiesModal}
        setOpenAllCitiesModal={setOpenAllCitiesModal}
        cities={allCities}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />
    </>
  );
}

export default HeroSection;
