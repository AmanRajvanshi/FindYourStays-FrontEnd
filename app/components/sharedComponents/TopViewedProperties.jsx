import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { apiUrl, imageUrl } from '../../../envConfig';
import CurrencyFormat from './CurrencyFormat';

function TopViewedProperties() {
  const [topViewedProperties, setTopViewedProperties] = useState([]);

  useEffect(() => {
    get_top_properties();
  }, []);

  const get_top_properties = () => {
    fetch(apiUrl + 'website/get-top-properties', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          setTopViewedProperties(json.data);
        } else {
          setTopViewedProperties([]);
        }
      })
      .catch(() => {
        console.log('error');
      })
      .finally(() => {});
  };

  return (
    <div className="sidebar_feature_listing">
      <h4 className="title">Top Viewed Properties</h4>
      {topViewedProperties.map((property, index) => (
        <Link
          to={`/single-property/${property.slug}`}
          className="media"
          key={index}
        >
          {(() => {
            const mainImage = property.images.find((img) => img.is_main === 1);
            return mainImage ? (
              <img
                src={`${imageUrl}${mainImage.image_path}`}
                alt={mainImage.alt_text}
                className="align-self-start mr-3 img-fluid w-25"
              />
            ) : null;
          })()}
          <div className="media-body">
            <h5 className="m-0 post_title text-capitalize">
              {property.property_title}
            </h5>
            <ul className="m-0">
              <li className="list-inline-item">
                {property.property_type.name}
              </li>
            </ul>
            <p>
              <CurrencyFormat amount={property?.property_rent} />
              <small>/{property.property_rent_frequency}</small>
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default TopViewedProperties;
