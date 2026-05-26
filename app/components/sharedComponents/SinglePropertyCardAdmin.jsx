import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { apiUrl, imageUrl } from '../../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import CurrencyFormat from './CurrencyFormat';

function SinglePropertyCardAdmin({ property, fetchProperties }) {
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isFavourite, setIsFavourite] = useState(
    property.is_property_favourite === 1 ||
      property.is_property_favourite === '1'
  );

  const mark_as_favourite = (id, favourite) => {
    const newFavouriteStatus = !favourite;
    setIsFavourite(newFavouriteStatus); // Optimistically update UI

    const updateFavourite = {
      is_property_favourite: newFavouriteStatus ? 1 : 0,
    };

    fetch(`${apiUrl}admin/mark-as-favourite/${id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
      body: JSON.stringify(updateFavourite),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          toast.success(
            newFavouriteStatus
              ? 'Property marked as favorite!'
              : 'Property unmarked from favorite!'
          );
        } else {
          setIsFavourite(favourite); // Revert if API failed
          toast.error('Something went wrong. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsFavourite(favourite); // Revert on error
        toast.error('Failed to update favorite status.');
      });
  };

  const mark_as_deleted = (id) => {
    fetch(`${apiUrl}admin/mark-as-deleted/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          toast.success('Property deleted!');
          fetchProperties();
        } else {
          toast.error('Something went wrong. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.error('Failed to delete property.');
      });
  };

  return (
    <div className="feat_property list">
      <div className="thumb">
        {(() => {
          const mainImage = property.images.find((img) => img.is_main === 1);
          return mainImage ? (
            <img
              src={`${imageUrl}${mainImage.image_path}`}
              alt={mainImage.alt_text}
            />
          ) : null;
        })()}
        <div className="thmb_cntnt">
          <ul className="icon mb0">
            <li
              className="list-inline-item"
              onClick={() => navigate(`/admin/edit-property/${property.slug}`)}
            >
              <a>
                <i className="fa fa-pencil" />
              </a>
            </li>
            <li
              className="list-inline-item"
              onClick={() =>
                Swal.fire({
                  title: 'Delete this property?',
                  text: `Are you sure you want to delete ${property.property_title}?`,
                  showCancelButton: true,
                  confirmButtonText: 'Yes, delete it!',
                  cancelButtonText: 'Cancel',
                }).then((result) => {
                  if (result.isConfirmed) {
                    mark_as_deleted(property.id);
                  }
                })
              }
            >
              <a>
                <i className="fa fa-trash-o" />
              </a>
            </li>
            <li
              className="list-inline-item"
              onClick={() =>
                Swal.fire({
                  title: isFavourite
                    ? 'Unmark this property as favorite?'
                    : 'Mark this property as favorite?',
                  text: isFavourite
                    ? 'This will remove the property from your favorites list.'
                    : 'This will add the property to your favorites list.',
                  showCancelButton: true,
                  confirmButtonText: isFavourite
                    ? 'Yes, unmark as favorite'
                    : 'Yes, mark as favorite',
                  cancelButtonText: 'Cancel',
                }).then((result) => {
                  if (result.isConfirmed) {
                    mark_as_favourite(property.id, isFavourite);
                  }
                })
              }
            >
              <a>
                <i
                  className={
                    isFavourite ? 'fa fa-heart text-danger' : 'fa fa-heart-o'
                  }
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="details">
        <div className="tc_content">
          <div className="dtls_headr w-100 d-flex justify-content-between align-items-center mb-2">
            <h5
              className="d-inline-block text-truncate mb-0"
              style={{ maxWidth: '200px' }}
            >
              {property.property_title}
            </h5>
            <h5 className="fp_price mb-0">
              <CurrencyFormat amount={property?.property_rent} />
              <small>/{property.property_rent_frequency}</small>
            </h5>
          </div>
          <p className="text-thm">
            {property.type_city_links[0]?.property_type?.name}
          </p>
          <h6 className="font-weight-light">
            <span className="flaticon-placeholder" />{' '}
            {property.property_street_address === null
              ? ''
              : property.property_street_address}
            , {property.area.area_name}, {property.city.city_name},{' '}
            {property.state.state_name}.
          </h6>
          <ul className="prop_details mb0">
            {property.amenities.slice(0, 2).map((values, index) => {
              return (
                <li
                  className="list-inline-item"
                  style={{ fontSize: '13px' }}
                  key={index}
                >
                  {values.name}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SinglePropertyCardAdmin;
