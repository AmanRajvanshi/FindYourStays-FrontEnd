import Loadable from '@loadable/component';
import SinglePropertyCard from './SinglePropertyCard';
import SingleBlogCard from './SingleBlogCard';
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

function MobileBlogsHome() {
  return (
    <OwlCarousel
      className="owl-theme sidebar_feature_property_slider"
      {...options1}
    >
      <SingleBlogCard />
      <SingleBlogCard />
      <SingleBlogCard />
      <SingleBlogCard />
      <SingleBlogCard />
      <SingleBlogCard />
    </OwlCarousel>
  );
}

export default MobileBlogsHome;
