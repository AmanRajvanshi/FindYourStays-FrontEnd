import Loadable from '@loadable/component';
import SingleFeaturedCityCard from './SingleFeaturedCityCard';
const OwlCarousel = Loadable(() => import('react-owl-carousel'));

const options1 = {
  responsiveClass: true,
  autoplay: true,
  smartSpeed: 500,
  loop: true,
  margin: 30,
  nav: false,
  responsive: {
    0: {
      items: 1,
    },
    400: {
      items: 1,
    },
    600: {
      items: 1,
    },
    700: {
      items: 1,
    },
    1000: {
      items: 1,
    },
  },
};

function MobileFeaturedCity({ allCities, propertyTypes }) {
  return (
    <OwlCarousel
      className="owl-theme sidebar_feature_property_slider"
      {...options1}
    >
      {allCities
        .filter(
          (city) =>
            city.is_main === 1 || city.is_main === '1' || city.is_main === true
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
    </OwlCarousel>
  );
}

export default MobileFeaturedCity;
