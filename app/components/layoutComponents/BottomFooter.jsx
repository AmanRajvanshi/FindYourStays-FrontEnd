import moment from 'moment';
import { Link } from 'react-router';

function BottomFooter() {
  return (
    <>
      <section className="footer_middle_area pt20 pb20">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12 col-xl-12">
              <div className="copyright-widget text-center">
                <p>
                  © {moment().format('YYYY')} Find Your Stays. Made by Aman
                  Rajvanshi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <a className="scrollToHome" href="#">
        <i className="flaticon-arrows" />
      </a>
      <a
        aria-label="Chat on WhatsApp"
        href="https://wa.me/+919211985876?text=Hi, I’m interested in your living space and would like to know more details."
        className="whatsapp_float_button"
        target="_blank"
        rel="noreferrer"
      >
        <img
          alt="Chat on WhatsApp"
          src="/images/WhatsAppButtonGreenSmall.svg"
        />
      </a>
    </>
  );
}

export default BottomFooter;
