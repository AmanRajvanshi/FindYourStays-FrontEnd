import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { apiUrl } from '../../../envConfig';
import BottomFooter from './BottomFooter';

function Footer() {
  const [companyDetails, setCompanyDetails] = useState({});
  const [getStatisPages, setGetStatisPages] = useState([]);

  useEffect(() => {
    get_company_details();
  }, []);

  const get_company_details = () => {
    fetch(apiUrl + 'website/get-company-details', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) setCompanyDetails(json.data);
        else setCompanyDetails({});
      })
      .catch(() => setCompanyDetails({}))
      .finally(() => {
        get_static_pages();
      });
  };

  const get_static_pages = () => {
    fetch(apiUrl + 'website/get-active-pages', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) setGetStatisPages(json.data);
        else setGetStatisPages([]);
      })
      .catch(() => setGetStatisPages([]));
  };

  return (
    <>
      <section className="footer_one home3">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-6 col-md-6 col-lg col-xl">
              <div className="footer_about_widget home3">
                <Link to="/">
                  <img
                    src="/logos/full_logo.png"
                    alt="footer-logo.png"
                    className="mb30 w-75"
                  />
                </Link>
                <div className="footer_social_widget home3">
                  <ul className="mb30 d-flex">
                    {companyDetails.company_facebook && (
                      <li>
                        <a
                          href={companyDetails.company_facebook}
                          target="_blank"
                        >
                          <i className="fa fa-facebook" />
                        </a>
                      </li>
                    )}
                    {companyDetails.company_twitter && (
                      <li>
                        <a
                          href={companyDetails.company_twitter}
                          target="_blank"
                        >
                          <i className="fa fa-twitter" />
                        </a>
                      </li>
                    )}
                    {companyDetails.company_instagram && (
                      <li>
                        <a
                          href={companyDetails.company_instagram}
                          target="_blank"
                        >
                          <i className="fa fa-instagram" />
                        </a>
                      </li>
                    )}
                    {companyDetails.company_linkedin && (
                      <li>
                        <a
                          href={companyDetails.company_linkedin}
                          target="_blank"
                        >
                          <i className="fa fa-linkedin" />
                        </a>
                      </li>
                    )}
                    {companyDetails.company_youtube && (
                      <li>
                        <a
                          href={companyDetails.company_youtube}
                          target="_blank"
                        >
                          <i className="fa fa-youtube" />
                        </a>
                      </li>
                    )}
                    {companyDetails.company_google && (
                      <li>
                        <a href={companyDetails.company_google} target="_blank">
                          <i className="fa fa-google" />
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            {(() => {
              const firstColumnItems = getStatisPages.slice(
                0,
                Math.ceil(getStatisPages.length / 2)
              );
              const secondColumnItems = getStatisPages.slice(
                Math.ceil(getStatisPages.length / 2)
              );

              return (
                <>
                  <div className="col-sm-6 col-md-6 col-lg col-xl">
                    <div className="footer_qlink_widget home3">
                      <h4>Pages</h4>
                      <ul className="list-unstyled">
                        <li>
                          <Link to={`/blogs-listing`}>Blogs Listing</Link>
                        </li>
                        {firstColumnItems.map((item, index) => (
                          <li key={index}>
                            <Link to={`/${item.slug}`}>{item.title}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {secondColumnItems.length > 0 && (
                    <div className="col-sm-6 col-md-6 col-lg col-xl">
                      <div className="footer_qlink_widget home3">
                        <h4>Pages</h4>
                        <ul className="list-unstyled">
                          {secondColumnItems.map((item, index) => (
                            <li key={index}>
                              <Link to={`/${item.slug}`}>{item.title}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            <div className="col-sm-6 col-md-6 col-lg col-xl">
              <div className="footer_qlink_widget home3">
                <h4>Contact us at</h4>
                <ul className="mb30">
                  {companyDetails.company_phone1 && (
                    <li className="mb-2">
                      Phone :{' '}
                      <a href={`tel:+91${companyDetails.company_phone1}`}>
                        +91 {companyDetails.company_phone1}
                      </a>
                    </li>
                  )}
                  {companyDetails.company_phone2 && (
                    <li className="mb-2">
                      Phone :{' '}
                      <a href={`tel:+91${companyDetails.company_phone2}`}>
                        +91 {companyDetails.company_phone2}
                      </a>
                    </li>
                  )}
                  {companyDetails.company_email && (
                    <li className="mb-2">
                      Mail :{' '}
                      <a href={`mailto:${companyDetails.company_email}`}>
                        {companyDetails.company_email}
                      </a>
                    </li>
                  )}
                  {companyDetails.company_address && (
                    <li className="mb-2">
                      Address : {companyDetails.company_address}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BottomFooter />
    </>
  );
}

export default Footer;
