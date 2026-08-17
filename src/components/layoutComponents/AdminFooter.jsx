import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

function AdminFooter() {
  return (
    <>
      <section className="footer_middle_area pt20 pb20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap">
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
        <FontAwesomeIcon icon={faArrowUp} />
      </a>
    </>
  );
}

export default AdminFooter;
