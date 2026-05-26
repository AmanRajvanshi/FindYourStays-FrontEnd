import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { apiUrl } from '../../../envConfig';

function PropertyTypeCount() {
  const [propertyCount, setPropertyCount] = useState([]);

  useEffect(() => {
    get_property_count_by_type();
  }, []);

  const get_property_count_by_type = () => {
    fetch(apiUrl + 'website/get-property-count-by-type', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          setPropertyCount(json.data);
        } else {
          setPropertyCount([]);
        }
      })
      .catch(() => {
        console.log('error');
      })
      .finally(() => {});
  };

  return (
    <div className="terms_condition_widget">
      <h4 className="title">Property Types</h4>
      <div className="widget_list">
        <ul className="list_details">
          {propertyCount.map((values, index) => {
            return (
              <li key={index}>
                <Link to={`/property-listing/${values.type_id}/0`}>
                  <i className="fa fa-caret-right mr10" />
                  {values.type_name}
                  <span className="float-right">
                    {values.property_count} properties
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default PropertyTypeCount;
