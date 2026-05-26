import { Link } from 'react-router';
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from 'react-share';
import { Dropdown, Popover, Whisper } from 'rsuite';
import { domainUrl, imageUrl } from '../../../envConfig';
import CurrencyFormat from './CurrencyFormat';

function SinglePropertyCard({ property }) {
  return (
    <div className="item single_property_card">
      <div className="properti_city home6">
        <Link to={`/single-property/${property.slug}`}>
          <div className="thumb">
            {(() => {
              const mainImage = property.images.find(
                (img) => img.is_main === 1
              );
              return mainImage ? (
                <img
                  src={`${imageUrl}${mainImage.image_path}`}
                  alt={mainImage.alt_text}
                  className="img-fluid w100"
                />
              ) : null;
            })()}
            <div className="thmb_cntnt">
              {property.is_property_favourite == 1 && (
                <ul className="tag mb0">
                  <li className="list-inline-item">
                    <p>Featured</p>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </Link>
        <ul
          className="icon mb0 position-absolute"
          style={{ right: '10px', top: '13px' }}
        >
          <Whisper
            placement="bottomStart"
            trigger="click"
            speaker={
              <Popover full>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey={1}>
                    <FacebookShareButton
                      url={domainUrl + 'single-property/' + property.slug}
                      quote={property.property_title}
                    >
                      <FacebookIcon size={24} round={true} />
                      <span className="ml-2">Facebook</span>
                    </FacebookShareButton>
                  </Dropdown.Item>
                  <Dropdown.Item eventKey={2}>
                    <TwitterShareButton
                      url={domainUrl + 'single-property/' + property.slug}
                      title={property.property_title}
                    >
                      <TwitterIcon size={24} round={true} />
                      <span className="ml-2">Twitter</span>
                    </TwitterShareButton>
                  </Dropdown.Item>
                  <Dropdown.Item eventKey={3}>
                    <WhatsappShareButton
                      url={domainUrl + 'single-property/' + property.slug}
                      title={property.property_title}
                    >
                      <WhatsappIcon size={24} round={true} />
                      <span className="ml-2">Whatsapp</span>
                    </WhatsappShareButton>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Popover>
            }
          >
            <button className="btn btn-thm btn-sm rounded">
              <i className="flaticon-share" />
            </button>
          </Whisper>
        </ul>
        <Link to={`/single-property/${property.slug}`}>
          <div className="overlay">
            <div className="details">
              <div className="d-flex align-items-center justify-content-between">
                <p className="fp_price">
                  <CurrencyFormat amount={property?.property_rent} />
                  <small>/{property?.property_rent_frequency}</small>
                </p>
                <p className="type_property">{property?.property_type?.name}</p>
              </div>
              <ul className="prop_details mb0">
                {property.amenities.slice(0, 2).map((amenity, index) => {
                  return (
                    <li className="list-inline-item" key={index}>
                      <p>{amenity.name}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Link>
      </div>
      <Link to={`/single-property/${property.slug}`}>
        <div className="single_property_details">
          <h4>{property.property_title}</h4>
          <p>
            {property.area.area_name}, {property.city.city_name},{' '}
            {property.state.state_name}.
          </p>
        </div>
      </Link>
    </div>
  );
}

export default SinglePropertyCard;
