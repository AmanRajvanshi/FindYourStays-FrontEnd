import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPencil, faTrash, faHeart, faImage } from '@fortawesome/free-solid-svg-icons';
import { apiUrl, imageUrl } from '../../envConfig';
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full relative group">
      <div className="relative w-full h-56 shrink-0 bg-gray-100 overflow-hidden">
        {(() => {
          const mainImage = property.images.find((img) => img.is_main === 1);
          return mainImage ? (
            <img
              src={`${imageUrl}${mainImage.image_path}`}
              alt={property.property_title || 'Property'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/600x400/f3f4f6/9ca3af?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <FontAwesomeIcon icon={faImage} className="text-3xl mb-2" />
              <span className="text-sm font-medium">No Image</span>
            </div>
          );
        })()}

        {/* Hover overlay for actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/edit-property/${property.slug}`); }}
            className="w-10 h-10 rounded-full bg-white text-gray-800 hover:text-coral flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            title="Edit Property"
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
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
            }}
            className="w-10 h-10 rounded-full bg-white text-gray-800 hover:text-red-500 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            title="Delete Property"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>

        {/* Favorite Button - Always visible or top right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            mark_as_favourite(property.id, isFavourite);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          title={isFavourite ? "Unmark Favorite" : "Mark Favorite"}
        >
          <FontAwesomeIcon icon={faHeart} className={isFavourite ? "text-red-500 text-sm" : "text-gray-300 text-sm"} />
        </button>
      </div>

      <div className="px-2 py-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-3">
            <h5 className="text-2xl font-bold text-[var(--color-coral)] m-0 flex items-baseline gap-1">
              <CurrencyFormat amount={property?.property_rent} />
              <span className="text-sm font-medium text-gray-500">/{property.property_rent_frequency}</span>
            </h5>
          </div>

          <div className="mb-3">
            <span className="inline-block px-2.5 py-1 bg-coral/10 text-coral text-xs font-bold uppercase tracking-wider rounded-md mb-2">
              {property.type_city_links[0]?.property_type?.name || 'Property'}
            </span>
            <h4 className="text-lg font-bold text-gray-900 leading-tight mb-0">
              {property.property_title}
            </h4>
          </div>

          <div className="flex items-start text-sm text-gray-600 mb-1">
            <FontAwesomeIcon icon={faLocationDot} className="mt-1 mr-2 text-gray-400 shrink-0" />
            <span className="leading-relaxed line-clamp-2">
              {property.property_street_address ? `${property.property_street_address}, ` : ''}
              {property.area?.area_name}, {property.city?.city_name}, {property.state?.state_name}.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-1 pt-1 border-t border-gray-100">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded border border-gray-200 text-[11px] font-medium bg-gray-50 text-gray-600 whitespace-nowrap"
            >
              {amenity.name}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded border border-gray-200 text-[11px] font-medium bg-gray-50 text-gray-500 whitespace-nowrap">
              +{property.amenities.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SinglePropertyCardAdmin;
