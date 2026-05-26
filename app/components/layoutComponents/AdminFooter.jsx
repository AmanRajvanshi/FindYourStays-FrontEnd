import moment from 'moment';

function AdminFooter() {
  return (
    <>
      <section className="footer_middle_area pt20 pb20">
        <div className="container">
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
    </>
  );
}

export default AdminFooter;
