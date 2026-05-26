// FeaturedProperties.jsx
import Loadable from '@loadable/component';
import { useEffect, useState } from 'react';
import { Loader } from 'rsuite';
import { apiUrl } from '../../../envConfig';
import SinglePropertyCard from './SinglePropertyCard';

const OwlCarousel = Loadable(() => import('react-owl-carousel'));

// Custom hook for fetching featured properties
const useFeaturedProperties = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get_all_featured_properties();
  }, []);

  const get_all_featured_properties = () => {
    setLoading(true);
    fetch(apiUrl + 'website/get-all-featured-properties', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) setFeaturedProperties(json.data);
        else setFeaturedProperties([]);
      })
      .catch((error) => {
        console.log('error', error);
        setFeaturedProperties([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { featuredProperties, loading };
};

// Carousel options
const options1 = {
  responsiveClass: true,
  autoplay: true,
  smartSpeed: 500,
  loop: true,
  margin: 30,
  nav: false,
  responsive: {
    0: { items: 1 },
    400: { items: 1 },
    600: { items: 1 },
    700: { items: 1 },
    1000: { items: 1 },
  },
};

// Main Featured Properties Component
function FeaturedProperties() {
  const { featuredProperties, loading } = useFeaturedProperties();

  if (loading) {
    return <Loader />;
  }

  return (
    featuredProperties.length > 0 && (
      <section id="feature-property" className="feature-property pb30 pt-0">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <div className="main-title text-center">
                <h2 className="title-with-bar">FEATURED LISTINGS</h2>
                <p>
                  Explore Our Handpicked, Verified Listings Quality Shared &
                  Community Living Spaces Tailored for You
                </p>
              </div>
            </div>
          </div>

          {/* Desktop view only */}
          <div className="row desktop-cards d-none d-md-flex">
            {featuredProperties?.map((property) => (
              <div key={property.id} className="col-md-6 col-lg-3">
                <SinglePropertyCard property={property} />
              </div>
            ))}
          </div>

          {/* Mobile view only */}
          <div className="d-block d-md-none">
            <MobileFeaturedProperties featuredProperties={featuredProperties} />
          </div>
        </div>
      </section>
    )
  );
}

// Mobile Featured Properties Component
function MobileFeaturedProperties({ featuredProperties }) {
  // If used independently, fetch data using the hook
  const hookData = useFeaturedProperties();

  // Use props if available, otherwise use hook data
  const properties = featuredProperties || hookData.featuredProperties;
  const loading = featuredProperties ? false : hookData.loading;

  if (loading) {
    return <Loader />;
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center p-3">No featured properties available</div>
    );
  }

  return (
    <OwlCarousel
      className="owl-theme sidebar_feature_property_slider"
      {...options1}
    >
      {properties.map((property) => (
        <SinglePropertyCard key={property.id} property={property} />
      ))}
    </OwlCarousel>
  );
}

// Named exports
export { FeaturedProperties, MobileFeaturedProperties };
