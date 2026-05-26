import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Input, Modal } from 'rsuite';
import { apiUrl, domainUrl } from '../../../envConfig';
import HeroSection from '../../components/homePageComponents/HeroSection';
import Testimonials from '../../components/homePageComponents/Testimonials';
import MainLoader from '../../components/layoutComponents/MainLoader';
import { FeaturedProperties } from '../../components/sharedComponents/FeaturedProperties';
import MobileBlogsHome from '../../components/sharedComponents/MobileBlogsHome';
import MobileFeaturedCity from '../../components/sharedComponents/MobileFeaturedCity';
import SingleBlogCard from '../../components/sharedComponents/SingleBlogCard';
import SingleFeaturedCityCard from '../../components/sharedComponents/SingleFeaturedCityCard';

export function meta() {
  const title =
    'Best PGs, Hostels, Co-living & Rentals for Students & Professionals | Top Metro Cities';
  const description =
    "Discover India's most trusted platform for affordable and community-led urban stays. Find Your Stays lists verified PGs, co-living spaces, hostels, and short-term rentals with zero brokerage, flexible move-in terms, and socially engaging living options.";
  const keywords =
    'PG in Gurgaon for working professionals, Co-living spaces in Gurgaon, Hostels in Gurgaon for students, Affordable PG in Delhi, Co-living in Delhi with meals, Hostel accommodation in Delhi, Short term stays in Noida, Long term PG in Noida, Best PG in Gurgaon near Cyberhub, Co-living rooms in Noida Sector 62, PG for students in Delhi NCR, Hostels for girls in Gurgaon, Shared co-living for digital nomads in Delhi, Find Your Stays, accommodation booking, zero brokerage, verified properties';

  return [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },

    // Open Graph tags
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: domainUrl },
    { property: 'og:site_name', content: 'Find Your Stays' },
    { property: 'og:locale', content: 'en_IN' },
    { property: 'og:image', content: `${domainUrl}/og-image.jpg` }, // Add your main OG image
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    {
      property: 'og:image:alt',
      content: 'Find Your Stays - Best PG and Co-living Platform',
    },

    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: `${domainUrl}/twitter-image.jpg` }, // Add your Twitter image
    { name: 'twitter:site', content: '@FindYourStays' }, // Add your Twitter handle
    { name: 'twitter:creator', content: '@FindYourStays' },

    // Additional SEO tags
    { name: 'author', content: 'Find Your Stays' },
    {
      name: 'robots',
      content:
        'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    },
    { name: 'language', content: 'en' },
    { name: 'revisit-after', content: '1 days' }, // More frequent for homepage
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'theme-color', content: '#68418b' }, // Your brand color instead of white
    { name: 'msapplication-TileColor', content: '#68418b' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },

    // Geographic and regional tags
    { name: 'geo.region', content: 'IN' },
    { name: 'geo.placename', content: 'Delhi NCR, India' },
    { name: 'geo.position', content: '28.7041;77.1025' }, // Delhi coordinates
    { name: 'ICBM', content: '28.7041, 77.1025' },

    // Content classification
    {
      name: 'classification',
      content: 'accommodation, rental, PG, hostel, co-living, real estate',
    },
    { name: 'coverage', content: 'India' },
    { name: 'distribution', content: 'global' },
    { name: 'rating', content: 'general' },
    {
      name: 'category',
      content: 'Real Estate, Accommodation, Rental Services',
    },
    { name: 'referrer', content: 'origin-when-cross-origin' },

    // Canonical URL
    { tagName: 'link', rel: 'canonical', href: domainUrl },

    // Alternate languages (if you support multiple languages)
    { tagName: 'link', rel: 'alternate', hrefLang: 'en-in', href: domainUrl },
    {
      tagName: 'link',
      rel: 'alternate',
      hrefLang: 'x-default',
      href: domainUrl,
    },

    // Preconnect for performance
    {
      tagName: 'link',
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      tagName: 'link',
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },

    // // Schema.org structured data for Organization
    // {
    //   tagName: 'script',
    //   type: 'application/ld+json',
    //   children: JSON.stringify({
    //     '@context': 'https://schema.org',
    //     '@type': 'Organization',
    //     name: 'Find Your Stays',
    //     url: domainUrl,
    //     logo: `${domainUrl}/logo.png`,
    //     description: description,
    //     foundingDate: '2024', // Update with actual founding date
    //     founders: [
    //       {
    //         '@type': 'Person',
    //         name: 'Find Your Stays Team',
    //       },
    //     ],
    //     address: {
    //       '@type': 'PostalAddress',
    //       addressCountry: 'India',
    //       addressRegion: 'Delhi NCR',
    //     },
    //     contactPoint: {
    //       '@type': 'ContactPoint',
    //       contactType: 'Customer Service',
    //       areaServed: 'IN',
    //       availableLanguage: 'English',
    //     },
    //     sameAs: [
    //       'https://facebook.com/findyourstays', // Update with actual social links
    //       'https://twitter.com/findyourstays',
    //       'https://instagram.com/findyourstays',
    //       'https://linkedin.com/company/findyourstays',
    //     ],
    //   }),
    // },

    // // Website schema
    // {
    //   tagName: 'script',
    //   type: 'application/ld+json',
    //   children: JSON.stringify({
    //     '@context': 'https://schema.org',
    //     '@type': 'WebSite',
    //     name: 'Find Your Stays',
    //     url: domainUrl,
    //     description: description,
    //     potentialAction: {
    //       '@type': 'SearchAction',
    //       target: `${domainUrl}/search?q={search_term_string}`,
    //       'query-input': 'required name=search_term_string',
    //     },
    //     publisher: {
    //       '@type': 'Organization',
    //       name: 'Find Your Stays',
    //       logo: `${domainUrl}/logo.png`,
    //     },
    //   }),
    // },

    // // Service schema for accommodation services
    // {
    //   tagName: 'script',
    //   type: 'application/ld+json',
    //   children: JSON.stringify({
    //     '@context': 'https://schema.org',
    //     '@type': 'Service',
    //     name: 'PG and Co-living Accommodation Services',
    //     description:
    //       'Premium PG, hostel, and co-living accommodation booking platform',
    //     provider: {
    //       '@type': 'Organization',
    //       name: 'Find Your Stays',
    //       url: domainUrl,
    //     },
    //     areaServed: {
    //       '@type': 'Country',
    //       name: 'India',
    //     },
    //     hasOfferCatalog: {
    //       '@type': 'OfferCatalog',
    //       name: 'Accommodation Options',
    //       itemListElement: [
    //         {
    //           '@type': 'Offer',
    //           itemOffered: {
    //             '@type': 'Service',
    //             name: 'PG Accommodation',
    //             description:
    //               'Paying Guest accommodations for students and professionals',
    //           },
    //         },
    //         {
    //           '@type': 'Offer',
    //           itemOffered: {
    //             '@type': 'Service',
    //             name: 'Co-living Spaces',
    //             description: 'Modern co-living spaces with community amenities',
    //           },
    //         },
    //         {
    //           '@type': 'Offer',
    //           itemOffered: {
    //             '@type': 'Service',
    //             name: 'Hostel Accommodation',
    //             description:
    //               'Budget-friendly hostel stays for travelers and students',
    //           },
    //         },
    //       ],
    //     },
    //   }),
    // },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [allCities, setAllCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  const [propertyTypes, setPropertyTypes] = useState([]);

  const [blogs, setBlogs] = useState([]);

  const [openAllCitiesModal, setOpenAllCitiesModal] = useState(false);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    get_all_cities();
  }, []);

  const get_all_cities = () => {
    fetch(apiUrl + 'website/get-all-cities?paginate=0', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) setAllCities(json.data);
        else setAllCities([]);
      })
      .catch(() => setAllCities([]))
      .finally(() => get_all_property_types());
  };

  const get_all_property_types = () => {
    fetch(apiUrl + 'website/get-all-property-types', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) setPropertyTypes(json.data);
        else setPropertyTypes([]);
      })
      .catch(() => setPropertyTypes([]))
      .finally(() => {
        get_all_blogs();
      });
  };

  const get_all_blogs = () => {
    fetch(apiUrl + 'website/get-all-blogs', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) setBlogs(json.data?.data);
        else setBlogs([]);
      })
      .catch(() => setBlogs([]))
      .finally(() => {
        setLoader(false);
      });
  };

  if (loader) return <MainLoader />;

  return (
    <>
      {/* hero section */}
      <HeroSection allCities={allCities} propertyTypeList={propertyTypes} />

      {/* city property */}
      <section id="property-city" className="property-city pb50 pt60">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <div className="main-title text-center">
                <h2 className="title-with-bar">LISTINGS BY CITIES</h2>
                <p>
                  Discover top living spaces in India's{' '}
                  <a
                    className="text-thm"
                    onClick={() => setOpenAllCitiesModal(true)}
                  >
                    leading cities
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="row desktop-cards d-none d-md-flex">
            {allCities
              .filter(
                (city) =>
                  city.is_main === 1 ||
                  city.is_main === '1' ||
                  city.is_main === true
              )
              .slice(0, 8)
              .map((city, index) => (
                <div key={index} className="col-lg-3 col-xl-3">
                  <SingleFeaturedCityCard
                    className={
                      city.status === 'coming-soon' ? 'coming-soon-city' : ''
                    }
                    city={city}
                    propertyTypeList={propertyTypes}
                  />
                </div>
              ))}
          </div>

          {/* Mobile view only */}
          <div className="d-block d-md-none">
            <MobileFeaturedCity
              allCities={allCities}
              propertyTypes={propertyTypes}
            />
          </div>
        </div>
      </section>

      {/* banner */}
      <section id="property-search" className="property-search bg-img4 mb50">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <div className="search_smart_property text-center">
                <h2>EXPLORE NOW</h2>
                <p>
                  Fuel your search for shared and community living spaces with
                  <strong> Find Your Stays</strong> timely listings and a
                  seamless experience, every step of the way.
                </p>
                <button
                  className="btn ssp_btn"
                  onClick={() => {
                    navigate('#property-city');
                  }}
                >
                  Explore Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* feature property */}
      <FeaturedProperties />

      {/* testimonials */}
      <Testimonials />

      {/* what you search */}
      <section className="you-looking-for">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <div className="main-title text-center mb30">
                <h2 className="title-with-bar">
                  Why you should trust Findyourstays.com ?
                </h2>
                {/* <p>Here could be a nice sub title</p> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* what you search */}
      <section id="property-city" className="property-city pb30">
        <div className="container">
          <div className="row features_row">
            <div className="col-sm-6 col-lg col-xl p0">
              <div className="why_chose_us home6">
                <div className="icon">
                  <span className="flaticon-magnifying-glass" />
                </div>
                <div className="details">
                  <h4>Explore Every Available Option</h4>
                  <p>
                    Find Your Stays simplifies your search by listing all
                    available properties and recommending the best-fit choices -
                    so you skip the hassle of endless scrolling and focus only
                    on what matters.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg col-xl p0">
              <div className="why_chose_us home6">
                <div className="icon">
                  <span className="flaticon-percent" />
                </div>
                <div className="details">
                  <h4>Get the Best Deal Terms</h4>
                  <p>
                    We handle the negotiations for you - ensuring the most
                    competitive prices and flexible terms, whether you're a
                    student or working professional looking for smart living
                    options.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg col-xl p0">
              <div className="why_chose_us home6">
                <div className="icon">
                  <span className="flaticon-money-bag" />
                </div>
                <div className="details">
                  <h4>Enjoy Zero Brokerage Fees</h4>
                  <p>
                    With Find Your Stays, you don't pay any brokerage. Our
                    platform is completely free to use - giving you full
                    transparency and savings while finding your ideal rental
                    without hidden charges.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg col-xl p0">
              <div className="why_chose_us home6">
                <div className="icon">
                  <span className="flaticon-smartphone-call" />
                </div>
                <div className="details">
                  <h4>Access 24/7 Assistance Anytime</h4>
                  <p>
                    Our dedicated customer support team is available round the
                    clock to resolve queries, offer recommendations, or help you
                    through any issue - any time, any day of the week.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg col-xl p0">
              <div className="why_chose_us home6">
                <div className="icon">
                  <span className="flaticon-high-five" />
                </div>
                <div className="details">
                  <h4>Book with Trusted Hosts</h4>
                  <p>
                    Every host listed on Find Your Stays is background -
                    verified to ensure your peace of mind. We prioritize your
                    safety by working only with reliable and thoroughly screened
                    property partners.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* blog */}
      {blogs.length > 0 && (
        <section className="our-blog bgc-f7 pb30">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-12">
                <div className="main-title text-center">
                  <h2 className="title-with-bar">LIVING STORIES</h2>
                  <p>
                    Tips, trends, and community stories,{' '}
                    <Link to="/blogs-listing">View All</Link>
                  </p>
                </div>
              </div>
            </div>
            <div className="row desktop-cards d-none d-md-flex">
              {blogs.slice(0, 4).map((blog) => (
                <div className="col-md-12 col-lg-3 col-xl-3" key={blog.id}>
                  <SingleBlogCard blogData={blog} />
                </div>
              ))}
            </div>
            {/* Mobile view only */}
            <div className="d-block d-md-none">
              <MobileBlogsHome />
            </div>
          </div>
        </section>
      )}

      {/* all cities */}
      <AllCities
        openAllCitiesModal={openAllCitiesModal}
        setOpenAllCitiesModal={setOpenAllCitiesModal}
        cities={allCities}
        selectedCity={selectedCity}
        setSelectedCity={(city) => {
          setSelectedCity(city);
          setOpenAllCitiesModal(false);
        }}
        propertyTypes={propertyTypes} // Add this prop
      />
    </>
  );
}

function AllCities({
  openAllCitiesModal,
  setOpenAllCitiesModal,
  cities = [],
  selectedCity,
  setSelectedCity,
  propertyTypes = [],
}) {
  const [search, setSearch] = useState('');
  const [openPropertyTypeModal, setOpenPropertyTypeModal] = useState(false);

  // Filter cities based on search input (case-insensitive)
  const filteredCities = useMemo(() => {
    if (!search.trim()) return cities;
    return cities.filter((city) =>
      city.city_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, cities]);

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setOpenAllCitiesModal(false);
    setOpenPropertyTypeModal(true);
  };

  return (
    <>
      <Modal
        open={openAllCitiesModal}
        onClose={() => setOpenAllCitiesModal(false)}
        size="sm"
      >
        <Modal.Header>
          <Modal.Title>
            <strong>Select City</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pb-0">
          <div className="p-0 d-flex flex-column align-items-center gap-2">
            <Input
              type="text"
              placeholder="Search City"
              value={search}
              onChange={setSearch}
              className="w-100 mb-3"
              style={{ maxWidth: 300 }}
              autoFocus
            />
            {filteredCities.length > 0 ? (
              <div className="d-flex justify-content-center gap-2 flex-wrap w-100">
                {filteredCities.map((city) => {
                  const isSelected = selectedCity?.id === city.id;
                  return (
                    <button
                      key={city.id || city.city_name}
                      type="button"
                      className={`btn rounded-pill shadow-sm px-3 py-1 mb-2 city-select-btn fw-semibold border ${
                        isSelected
                          ? 'btn-thm text-white border-thm'
                          : 'btn-light text-thm border-thm'
                      }`}
                      style={{
                        minWidth: 84,
                        transition: 'background 0.2s, color 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => handleSelectCity(city)}
                      onMouseOver={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = '#eaf3ff';
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '';
                      }}
                    >
                      {city.city_name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>No cities available.</div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <PropertyTypeModal
        openPropertyTypeModal={openPropertyTypeModal}
        setOpenPropertyTypeModal={setOpenPropertyTypeModal}
        propertyTypes={propertyTypes}
        cityName={selectedCity?.city_name} // Pass city_name instead of id
        cityId={selectedCity?.id}
      />
    </>
  );
}

function PropertyTypeModal({
  openPropertyTypeModal,
  setOpenPropertyTypeModal,
  propertyTypes = [],
  cityName, // This should receive city name, not city id
  cityId,
}) {
  const navigate = useNavigate();
  return (
    <Modal
      open={openPropertyTypeModal}
      onClose={() => setOpenPropertyTypeModal(false)}
      size="md"
    >
      <Modal.Body>
        <h3 className="text-center mb-4 fw-bold">
          Find the Best Spaces in <span className="text-thm">{cityName}</span>
        </h3>
        <div className="d-flex justify-content-center flex-wrap gap-3">
          {propertyTypes.map((type) => {
            return (
              <div
                key={type.id}
                onClick={() =>
                  navigate(`/property-listing/${type.id}/${cityId}`)
                }
                className={`property-type-card text-center`}
                style={{
                  cursor: 'pointer',
                  padding: 20,
                  borderRadius: 10,
                  width: 120,
                }}
              >
                <div
                  className="icon-circle"
                  style={{ fontSize: 40, marginBottom: 10 }}
                >
                  {type.icon || '🏢'}
                </div>
                <div className="label mt-2 fw-semibold">
                  {type.name || type.label}
                </div>
              </div>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
}
