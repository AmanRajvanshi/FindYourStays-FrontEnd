import { useEffect, useState } from 'react';
import { useLoaderData, useParams } from 'react-router';
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from 'react-share';
import { apiUrl, domainUrl, imageUrl } from '../../../envConfig';
import MainLoader from '../../components/layoutComponents/MainLoader';
import CurrencyFormat from '../../components/sharedComponents/CurrencyFormat';
import { MobileFeaturedProperties } from '../../components/sharedComponents/FeaturedProperties';
import PropertyEnquiryForm from '../../components/sharedComponents/PropertyEnquiryForm';
import PropertyTypeCount from '../../components/sharedComponents/PropertyTypeCount';
import SinglePropertyCard from '../../components/sharedComponents/SinglePropertyCard';
import TopViewedProperties from '../../components/sharedComponents/TopViewedProperties';
import {
  occupancyTypeOptions,
  sharingTypeOptions,
} from '../../consonants/propertyOptions';
import { Modal } from 'rsuite';

// Server-side data loading
export async function loader({ params }) {
  const { slug } = params;

  try {
    const response = await fetch(
      `${apiUrl}website/get-single-properties-web/${slug}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const json = await response.json();

    if (json.status) {
      const property = json.property;
      return {
        property,
        relatedProperties: json.related_properties,
        propertyTitle: property.property_title,
        propertyType: property.property_type?.name || 'Property',
        cityName: property.city?.city_name || 'Unknown',
        areaName: property.area?.area_name || 'Unknown',
        stateName: property.state?.state_name || 'Unknown',
        propertyRent: property.property_rent,
        propertyDescription: property.property_description,
        mainImage:
          property.images?.find((img) => img.is_main === 1) ||
          property.images?.[0],
      };
    }
  } catch (error) {
    console.error('Property loader error:', error);
  }

  return {
    property: null,
    relatedProperties: [],
    propertyTitle: 'Property Not Found',
    propertyType: 'Property',
    cityName: 'Unknown',
    areaName: 'Unknown',
    stateName: 'Unknown',
    propertyRent: 0,
    propertyDescription: '',
    mainImage: null,
  };
}

// Dynamic meta tags
// Dynamic meta tags
export function meta({ data }) {
  const {
    propertyTitle = 'Property Not Found',
    propertyType = 'Property',
    cityName = 'Unknown',
    areaName = 'Unknown',
    stateName = 'Unknown',
    propertyRent = 0,
    propertyDescription = '',
    mainImage = null,
    property = null,
  } = data || {};

  // Extract meta_keywords from the property object
  const apiMetaKeywords = property?.meta_keywords || [];

  // Create comprehensive keywords combining API keywords with dynamic ones
  const dynamicKeywords = [
    propertyType,
    cityName,
    areaName,
    stateName,
    'rent',
    'accommodation',
    'PG',
    'hostel',
    'Find Your Stays',
    propertyTitle,
  ];

  // Combine API keywords with dynamic keywords and remove duplicates
  const allKeywords = [...apiMetaKeywords, ...dynamicKeywords];
  const uniqueKeywords = [...new Set(allKeywords.filter(Boolean))]; // Remove duplicates and falsy values

  const meta_title = `${propertyTitle} - ${propertyType} in ${areaName}, ${cityName} | Find Your Stays`;
  const meta_description =
    propertyDescription ||
    `Find ${propertyType} in ${areaName}, ${cityName}. Starting from ₹${propertyRent}/month. Book your perfect accommodation with Find Your Stays.`;

  const imageUrlMeta = mainImage ? `${imageUrl}${mainImage.image_path}` : '';
  const propertyUrl = `${domainUrl}/single-property/${property?.slug || ''}`;

  return [
    { title: meta_title },
    { name: 'description', content: meta_description },

    // Use combined keywords from API and dynamic keywords
    {
      name: 'keywords',
      content: uniqueKeywords.join(', '),
    },

    // Open Graph tags
    { property: 'og:title', content: meta_title },
    { property: 'og:description', content: meta_description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: propertyUrl },
    { property: 'og:site_name', content: 'Find Your Stays' },
    ...(imageUrlMeta ? [{ property: 'og:image', content: imageUrlMeta }] : []),
    ...(imageUrlMeta ? [{ property: 'og:image:width', content: '1200' }] : []),
    ...(imageUrlMeta ? [{ property: 'og:image:height', content: '630' }] : []),

    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: meta_title },
    { name: 'twitter:description', content: meta_description },
    ...(imageUrlMeta ? [{ name: 'twitter:image', content: imageUrlMeta }] : []),

    { name: 'author', content: 'Find Your Stays' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'en' },
    { name: 'revisit-after', content: '7 days' },

    // Geographic tags
    { name: 'geo.region', content: `IN-${stateName}` },
    { name: 'geo.placename', content: `${cityName}, ${stateName}, India` },

    // Article/Content tags
    { property: 'article:section', content: 'Real Estate' },
    {
      property: 'article:tag',
      content: `${propertyType}, ${cityName}, accommodation`,
    },

    // Additional meta tags
    { name: 'theme-color', content: '#68418b' }, // Your brand color
    { name: 'msapplication-TileColor', content: '#68418b' },

    // Canonical URL
    { tagName: 'link', rel: 'canonical', href: propertyUrl },
  ];
}

function SingleProperty() {
  const params = useParams();
  const loaderData = useLoaderData();
  const [isClient, setIsClient] = useState(false);
  const [openCreateListing, setOpenCreateListing] = useState(false);

  // Initialize state with loader data
  const [propertyDetails, setPropertyDetails] = useState(
    loaderData?.property || {}
  );
  const [relatedProperties, setRelatedProperties] = useState(
    loaderData?.relatedProperties || []
  );
  const [loader, setLoader] = useState(!loaderData?.property);

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Check if we need to fetch new data
    const needsNewData =
      !loaderData?.property || loaderData?.property?.slug !== params.slug;

    if (needsNewData) {
      get_single_properties_web(params.slug);
    } else if (isClient) {
      // Data matches current route, just update views
      setTimeout(() => {
        update_views(loaderData.property.slug);
      }, 10000);
    }
  }, [params.slug, loaderData, isClient]);

  useEffect(() => {
    if (loaderData?.property && loaderData.property.slug === params.slug) {
      setPropertyDetails(loaderData.property);
      setRelatedProperties(loaderData.relatedProperties || []);
      setLoader(false);
    }
  }, [loaderData, params.slug]);

  const get_single_properties_web = (slug) => {
    setLoader(true);
    fetch(apiUrl + 'website/get-single-properties-web/' + slug, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          setPropertyDetails(json.property);
          setRelatedProperties(json.related_properties);
          if (isClient) {
            setTimeout(() => {
              update_views(json.property?.slug);
            }, 10000);
          }
        } else {
          setPropertyDetails({});
          setRelatedProperties([]);
        }
      })
      .catch(() => {
        console.log('error');
      })
      .finally(() => {
        setLoader(false);
      });
  };

  const update_views = (slug) => {
    fetch(apiUrl + 'website/update-views/' + slug, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {})
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  if (loader) return <MainLoader />;

  // Handle case where property is not found
  if (!propertyDetails || Object.keys(propertyDetails).length === 0) {
    return (
      <div className="container-fluid py-5">
        <div className="row">
          <div className="col-12 text-center">
            <h2>Property Not Found</h2>
            <p>
              The property you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Listing Single Property */}
      <section className="listing-title-area pt30">
        <div className="container-fluid">
          <div className="row mb30">
            <div className="col-lg-7 col-xl-8">
              <div className="single_property_title mt30-767">
                <h2 className="text-capitalize">
                  {propertyDetails.property_title}
                  <small>
                    {' '}
                    - <strong>{propertyDetails.property_type?.name}</strong>
                  </small>
                </h2>
                <p>
                  {propertyDetails.area?.area_name},{' '}
                  {propertyDetails.city?.city_name},{' '}
                  {propertyDetails.state?.state_name}.
                </p>
              </div>
            </div>
            <div className="col-lg-5 col-xl-4">
              <div className="single_property_social_share">
                <div className="spss style2 mt20 text-right tal-400">
                  <h2 className="text-capitalize">
                    <CurrencyFormat amount={propertyDetails?.property_rent} />
                    <small>/{propertyDetails.property_rent_frequency}</small>
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            {propertyDetails && (
              <PropertyImageGallery property={propertyDetails} />
            )}
          </div>
        </div>
      </section>

      {/* Rest of your existing JSX remains the same... */}
      <section className="our-agent-single pt-0">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12 px-4 border-bottom mb20 pb20">
              <div className="row">
                <div className="col-md-12 col-lg-8">
                  <div className="single_property_title">
                    <h2 className="text-capitalize">
                      {propertyDetails.property_title}
                      <small>
                        {' '}
                        - <strong>{propertyDetails.property_type?.name}</strong>
                      </small>
                    </h2>
                    <p>
                      {propertyDetails.area?.area_name},{' '}
                      {propertyDetails.city?.city_name},{' '}
                      {propertyDetails.state?.state_name}.
                    </p>
                  </div>
                  <div className="single_property_social_share style2">
                    <div className="price">
                      <h2 className="text-capitalize">
                        <CurrencyFormat
                          amount={propertyDetails?.property_rent}
                        />
                        <small>
                          /{propertyDetails.property_rent_frequency}
                        </small>
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 col-lg-4 d-flex align-items-center justify-content-end">
                  <ul className="d-flex list-unstyled m-0">
                    <li className="mr-2">
                      <FacebookShareButton
                        url={
                          domainUrl + 'single-property/' + propertyDetails.slug
                        }
                        quote={propertyDetails.property_title}
                      >
                        <FacebookIcon size={32} round={true} />
                      </FacebookShareButton>
                    </li>
                    <li className="mr-2">
                      <TwitterShareButton
                        url={
                          domainUrl + 'single-property/' + propertyDetails.slug
                        }
                        title={propertyDetails.property_title}
                      >
                        <TwitterIcon size={32} round={true} />
                      </TwitterShareButton>
                    </li>
                    <li className="mr-2">
                      <WhatsappShareButton
                        url={
                          domainUrl + 'single-property/' + propertyDetails.slug
                        }
                        title={propertyDetails.property_title}
                      >
                        <WhatsappIcon size={32} round={true} />
                      </WhatsappShareButton>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-12 col-lg-8">
              <div className="row">
                {propertyDetails.multiple_pricings.length > 0 && (
                  <div className="col-lg-12">
                    <div className="application_statics mb30">
                      <div className="row">
                        <div className="col-lg-12">
                          <h4 className="mb20">Pricing Information</h4>
                        </div>
                        {propertyDetails.multiple_pricings.length > 0 && (
                          <div className="col-lg-12">
                            <div className="row">
                              {propertyDetails.multiple_pricings.map(
                                (pricing, index) => (
                                  <div
                                    key={pricing.id}
                                    className="col-md-6 col-lg-4 mb20"
                                  >
                                    <div className="pricing-card h-100 p-3 border rounded">
                                      <div
                                        className="text-center"
                                        onClick={() =>
                                          setOpenCreateListing(true)
                                        }
                                        style={{
                                          cursor: 'pointer',
                                        }}
                                      >
                                        <div className="price-badge">
                                          <h3 className="text-thm m-0">
                                            <CurrencyFormat
                                              amount={pricing.property_rent}
                                            />
                                            <small className="text-muted">
                                              /{pricing.property_rent_frequency}
                                            </small>
                                          </h3>
                                        </div>
                                      </div>

                                      <ul className="pricing-details list-unstyled">
                                        <li className="d-flex justify-content-between mb10">
                                          <span>Sharing:</span>
                                          <strong>
                                            {
                                              sharingTypeOptions.find(
                                                (option) =>
                                                  option.value ===
                                                  pricing.sharing_type
                                              )?.label
                                            }
                                          </strong>
                                        </li>
                                        <li className="d-flex justify-content-between">
                                          <span>Occupancy:</span>
                                          <strong>
                                            {
                                              occupancyTypeOptions.find(
                                                (option) =>
                                                  option.value ===
                                                  pricing.occupancy_type
                                              )?.label
                                            }
                                          </strong>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-lg-12">
                  <div className="application_statics">
                    <div className="row">
                      <div className="col-lg-12">
                        <h4 className="mb20">Amenities</h4>
                      </div>
                      {propertyDetails.amenities?.map((amenity, index) => (
                        <div className="col-sm-6 col-md-6 col-lg-3" key={index}>
                          <p>
                            <span className="flaticon-tick mr-2" />
                            {amenity.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="application_statics mt30">
                    <h4 className="mb20">Description</h4>
                    <p>{propertyDetails.property_description}</p>
                    <div className="row pt30">
                      <div className="col-lg-12">
                        <h4 className="mb20">Additional details</h4>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 col-lg-6">
                        <p className="m-0">
                          Sharing Type :
                          <strong className="text-capitalize pl10">
                            {
                              sharingTypeOptions.find(
                                (option) =>
                                  option.value === propertyDetails.sharing_type
                              )?.label
                            }
                          </strong>
                        </p>
                      </div>
                      <div className="col-md-6 col-lg-6">
                        <p className="m-0">
                          Occupancy Type :
                          <strong className="text-capitalize pl10">
                            {
                              occupancyTypeOptions.find(
                                (option) =>
                                  option.value ===
                                  propertyDetails.occupancy_type
                              )?.label
                            }
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="application_statics mt30">
                    <div className="row">
                      <div className="col-lg-12">
                        <h4 className="mb20">Nearby Facilities</h4>
                      </div>
                      {propertyDetails.nearby_locations?.map(
                        (nearby_location, index) => (
                          <div
                            className="col-sm-6 col-md-6 col-lg-3"
                            key={index}
                          >
                            <p>
                              <span className="flaticon-tick mr-2" />
                              {nearby_location.nearby_location_name}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="application_statics mt30">
                    <h4 className="mb20">Location</h4>
                    <div className="property_video p0">
                      <div className="thumb">
                        <div className="h400">
                          <iframe
                            src={propertyDetails.map}
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-12 col-lg-4">
              <div className="row">
                <div className="col-lg-12">
                  <div className="sidebar_listing_list">
                    <h4 className="title">Interested In This Property</h4>
                    <p className="mb20">
                      Fill the form below to get in touch with us
                    </p>
                    <div className="sidebar_advanced_search_widget">
                      <PropertyEnquiryForm id={propertyDetails.id} />
                    </div>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="terms_condition_widget">
                    <h4 className="title">Featured Properties</h4>
                    <MobileFeaturedProperties />
                  </div>
                </div>
                <div className="col-lg-12">
                  <PropertyTypeCount />
                </div>
                <div className="col-lg-12">
                  <TopViewedProperties />
                </div>
              </div>
            </div>
            {relatedProperties.length > 0 && (
              <>
                <div className="col-lg-12 mb-3">
                  <h4 className="mt30 mb30">Similar Properties</h4>
                </div>
                {relatedProperties.map((property) => (
                  <div className="col-lg-3" key={property.id}>
                    <SinglePropertyCard property={property} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>
      <PropertyEnquiryModal
        propertyDetails={propertyDetails}
        openCreateListing={openCreateListing}
        setOpenCreateListing={setOpenCreateListing}
      />
    </>
  );
}

function PropertyImageGallery({ property }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { images = [] } = property;

  const mainImage = images.find((img) => img.is_main === 1);
  const otherImages = images.filter((img) => img.is_main !== 1);

  const displayMainImage = mainImage || images[0];
  const displayOtherImages = mainImage ? otherImages : images.slice(1);

  const allImages = displayMainImage
    ? [displayMainImage, ...displayOtherImages]
    : [...images];

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const nextImage = () =>
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  const prevImage = () =>
    setCurrentImageIndex((prevIndex) =>
      prevIndex - 1 < 0 ? allImages.length - 1 : prevIndex - 1
    );

  return (
    <>
      {/* Main Image Column */}
      <div className="col-sm-7 col-lg-7">
        <div className="row">
          <div className="col-lg-12">
            <div className="spls_style_two main-image-wrapper">
              {displayMainImage ? (
                <img
                  className="main-image clickable"
                  src={`${imageUrl}${displayMainImage.image_path}`}
                  alt={displayMainImage.alt_text || 'Main property image'}
                  onClick={() => openModal(0)}
                  loading="lazy"
                />
              ) : (
                <div className="no-photo-placeholder">No photo</div>
              )}
              <span className="main-image-badge">Main Image</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Grid Column */}
      <div className="col-sm-5 col-lg-5">
        <div className="thumb-grid">
          {displayOtherImages.slice(0, 5).map((image, index) => (
            <div
              key={image.id}
              className="thumb-grid-card clickable"
              onClick={() => openModal(displayMainImage ? index + 1 : index)}
            >
              <img
                className="thumb-image"
                src={`${imageUrl}${image.image_path}`}
                alt={image.alt_text || `Property image ${index + 1}`}
                loading="lazy"
              />
              <div className="thumb-overlay" />
              <span className="thumb-icon">+</span>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal propertyImgModal">
          <div
            style={{ position: 'relative', width: '90%', maxWidth: '900px' }}
          >
            <button
              onClick={closeModal}
              className="propertyImgModal-closeButton"
            >
              ×
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={prevImage}
                className="propertyImgModal-prevAfterButton"
              >
                ←
              </button>
              <div style={{ flex: 1 }}>
                <img
                  src={`${imageUrl}${allImages[currentImageIndex].image_path}`}
                  alt={
                    allImages[currentImageIndex].alt_text ||
                    'Modal property image'
                  }
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    maxHeight: '90vh',
                  }}
                />
              </div>
              <button
                onClick={nextImage}
                className="propertyImgModal-prevAfterButton"
              >
                →
              </button>
            </div>
            <div
              style={{ textAlign: 'center', color: 'white', marginTop: '10px' }}
            >
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const PropertyEnquiryModal = ({
  propertyDetails,
  openCreateListing,
  setOpenCreateListing,
}) => {
  return (
    <Modal
      open={openCreateListing}
      onClose={() => setOpenCreateListing(false)}
      size="sm"
    >
      <Modal.Header>
        <Modal.Title>
          <div className="text-center">
            <h3 className="mb-2">Create an Enquiry</h3>
            <p className="text-muted mb-0">
              We will get back to you as soon as possible
            </p>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container-fluid">
          <PropertyEnquiryForm
            id={propertyDetails.id}
            onSuccess={() => setOpenCreateListing(false)}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SingleProperty;
