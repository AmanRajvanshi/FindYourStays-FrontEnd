import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../AuthContextProvider';
import AmenitiesModal from '../../components/adminComponents/AmenitiesModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import PageLayout from '../../components/sharedComponents/PageLayout';
import Button from '../../components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_MAP } from '../../consonants/iconMap';
import { apiUrl } from '../../envConfig';

function Amenities() {
  const { authData } = useContext(AuthContext);
  const [amenities, setAmenities] = useState([]);
  const [openAmenitiesModal, setOpenAmenitiesModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => { get_all_amenities(); }, []);

  const get_all_amenities = () => {
    fetch(apiUrl + 'admin/get-all-amenities', {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    })
      .then((response) => response.json())
      .then((json) => { if (json.status) { setAmenities(json.data); setShowNoData(false); } else { setShowNoData(true); } })
      .catch((error) => console.error('Error:', error))
      .finally(() => setLoading(false));
  };

  const handleCloseModal = () => { setOpenAmenitiesModal(false); setSelectedAmenity(null); };

  if (loading) return <DataLoader />;

  return (
    <>
      {showNoData ? (
        <NoDataFound name="Amenity" message="No amenities found, kindly add a new amenity!" showButton={true}
          handleClick={() => { setOpenAmenitiesModal(true); setEdit(false); setSelectedAmenity(null); }} />
      ) : (
        <PageLayout
          title="Amenities"
          subtitle="Manage amenity tags for properties."
          actionLabel="+ Add New Amenity"
          actionOnClick={() => { setOpenAmenitiesModal(true); setEdit(false); setSelectedAmenity(null); }}
        >
          <div className="flex flex-wrap gap-2.5">
            {amenities.map((amenity, index) => {
              const icon = ICON_MAP[amenity.icon] || null;
              return (
                <button
                  key={index}
                  type="button"
                  className="px-4 py-2 bg-line/40 text-ink border border-line font-medium rounded-full hover:bg-coral hover:text-white hover:border-coral transition-all text-sm flex items-center gap-2 group cursor-pointer"
                  onClick={() => { setOpenAmenitiesModal(true); setEdit(true); setSelectedAmenity(amenity); }}
                >
                  {icon && (
                    <FontAwesomeIcon icon={icon} className="text-muted group-hover:text-white opacity-80" />
                  )}
                  <span>{amenity.name}</span>
                </button>
              );
            })}
          </div>
        </PageLayout>
      )}
      <AmenitiesModal openAmenitiesModal={openAmenitiesModal} setOpenAmenitiesModal={handleCloseModal}
        edit={edit} get_all_amenities={get_all_amenities} amenity={selectedAmenity} />
    </>
  );
}

export default Amenities;
