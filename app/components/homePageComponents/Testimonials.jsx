const OwlCarousel = Loadable(() => import('react-owl-carousel'));
import Loadable from '@loadable/component';
import { useEffect, useState } from 'react';
import { apiUrl, imageUrl } from '../../../envConfig';

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
      items: 3,
    },
  },
};

function Testimonials() {
  const [testimonialsData, setTestimonialsData] = useState([]);
  useEffect(() => {
    get_all_testimonials();
  }, []);

  const get_all_testimonials = () => {
    fetch(apiUrl + 'website/get-all-testimonials', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) setTestimonialsData(json.data);
        else setTestimonialsData([]);
      })
      .catch(() => setTestimonialsData([]))
      .finally(() => {});
  };
  return (
    testimonialsData.length > 0 && (
      <section className="our-testimonials bgc-f7">
        <div className="container-fluid ovh">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <div className="main-title text-center">
                <h2 className="title-with-bar">TESTIMONIALS</h2>
                <p>Discover Why People Choose Us</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <OwlCarousel
                className="owl-theme testimonial_slider_home9 mt-4"
                {...options1}
              >
                {testimonialsData.map((item) => (
                  <div className="item">
                    <div className="testimonial_post mb-0">
                      <div className="details">
                        <div className="icon text-thm2">
                          <span className="fa fa-quote-left" />
                        </div>
                        <p>{item.description}</p>
                      </div>
                      <div className="thumb">
                        <img src={`${imageUrl}${item.image}`} alt="1.jpg" />
                        <h4 className="title">{item.name}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </OwlCarousel>
            </div>
          </div>
        </div>
      </section>
    )
  );
}

export default Testimonials;
