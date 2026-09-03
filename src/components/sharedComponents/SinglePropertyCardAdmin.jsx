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
    property.is_property_favourite === '1' ||
    property.is_property_favourite === true
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

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    let bg = 'bg-section text-ink border-line';
    let label = status || 'Unknown';

    if (statusLower === 'active') {
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      label = 'Active';
    } else if (statusLower === 'inactive') {
      bg = 'bg-amber-50 text-amber-700 border-amber-200/60';
      label = 'Inactive';
    } else if (statusLower === 'draft') {
      bg = 'bg-sky-50 text-sky-700 border-sky-200/60';
      label = 'Draft';
    } else if (statusLower === 'deleted') {
      bg = 'bg-rose-50 text-rose-700 border-rose-200/60';
      label = 'Deleted';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${bg}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
        {label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-line/60 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative group">
      {/* Image and Floating Badges */}
      <div className="relative w-full h-56 shrink-0 bg-section overflow-hidden">
        {(() => {
          const mainImage = property.images.find((img) => img.is_main === 1);
          return mainImage ? (
            <img
              src={`${imageUrl}${mainImage.image_path}`}
              alt={property.property_title || 'Property'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/600x400/f3f4f6/9ca3af?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted bg-section">
              <FontAwesomeIcon icon={faImage} className="text-2xl mb-1.5" />
              <span className="text-xs font-semibold">No Image Preview</span>
            </div>
          );
        })()}

        {/* Status Badge - Top Left */}
        <div className="absolute top-3.5 left-3.5 z-10 backdrop-blur-md bg-white/80 rounded-full shadow-sm p-0.5">
          {getStatusBadge(property.status)}
        </div>

        {/* Favorite Button - Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            mark_as_favourite(property.id, isFavourite);
          }}
          className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm text-muted hover:text-red-500"
          title={isFavourite ? "Unmark Favorite" : "Mark Favorite"}
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={`text-sm transition-colors duration-300 ${isFavourite ? "text-red-500 scale-110" : "text-muted group-hover/fav:text-muted"}`}
          />
        </button>

        {/* Hover Slide-up Actions Panel */}
        <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center backdrop-blur-[2px]">
          <span className="text-white/90 text-xs font-medium tracking-wide">Actions</span>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/admin/edit-property/${property.slug}`); }}
              className="w-8 h-8 rounded-lg bg-white hover:bg-coral hover:text-white text-coral flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Edit Property"
            >
              <FontAwesomeIcon icon={faPencil} className="text-xs" />
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
                  confirmButtonColor: '#ef4444',
                }).then((result) => {
                  if (result.isConfirmed) {
                    mark_as_deleted(property.id);
                  }
                })
              }}
              className="w-8 h-8 rounded-lg bg-white hover:bg-rose-600 hover:text-white text-rose-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Delete Property"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Tag & Pricing Row */}
          <div className="flex justify-between items-start mb-2.5 gap-2">
            <span className="inline-block px-2.5 py-0.5 bg-coral/10 text-coral text-[10px] font-bold uppercase tracking-wider rounded-md">
              {property.type_city_links[0]?.property_type?.name || 'Property'}
            </span>
            <div className="text-right">
              <h5 className="text-lg font-bold text-coral m-0 flex items-baseline justify-end gap-0.5">
                <CurrencyFormat amount={property?.property_rent} />
                <span className="text-xs font-medium text-muted">/{property.property_rent_frequency}</span>
              </h5>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-base font-bold text-ink leading-tight mb-2 group-hover:text-coral transition-colors duration-200 line-clamp-1">
            {property.property_title}
          </h4>

          {/* Address Info */}
          <div className="flex items-start text-xs text-muted mb-2">
            <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 mr-1.5 text-muted/80 shrink-0" />
            <span className="leading-relaxed line-clamp-1">
              {property.property_street_address ? `${property.property_street_address}, ` : ''}
              {property.area?.area_name}, {property.city?.city_name}, {property.state?.state_name}.
            </span>
          </div>
        </div>

        {/* Amenities Section */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-line/50">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-md border border-line/40 text-[10px] font-semibold bg-section/50 text-muted/90 whitespace-nowrap"
            >
              {amenity.name}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md border border-line/40 text-[10px] font-bold bg-section/50 text-coral/80 whitespace-nowrap">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SinglePropertyCardAdmin;