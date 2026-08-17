import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../AuthContextProvider';
import AmenitiesModal from '../../components/adminComponents/AmenitiesModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import Button from '../../components/ui/Button';
import { apiUrl } from '../../envConfig';

function Amenities() {
  const { authData } = useContext(AuthContext);
  const [amenities, setAmenities] = useState([]);
  const [openAmenitiesModal, setOpenAmenitiesModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState(null); // NEW
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    get_all_amenities();
  }, []);

  const get_all_amenities = () => {
    fetch(apiUrl + 'admin/get-all-amenities', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setAmenities(json.data);
          setShowNoData(false);
        } else {
          setShowNoData(true); // <-- update this line
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Reset selectedAmenity when modal closes
  const handleCloseModal = () => {
    setOpenAmenitiesModal(false);
    setSelectedAmenity(null);
  };

  if (loading) {
    return <DataLoader />;
  }

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm mb-6">
        {showNoData ? (
          <NoDataFound
            name="Amenity"
            message="No amenities found, kindly add a new amenity!"
            showButton={true}
            handleClick={() => {
              setOpenAmenitiesModal(true);
              setEdit(false);
              setSelectedAmenity(null);
            }}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="mb-0 text-lg font-semibold">Amenities</h2>
              <Button
                appearance="primary"
                type="button"
                onClick={() => {
                  setOpenAmenitiesModal(true);
                  setEdit(false);
                  setSelectedAmenity(null);
                }}
              >
                + Add New Amenity
              </Button>
            </div>
            <div className="flex flex-wrap">
              <div className="w-full mt-2">
                <div className="flex flex-wrap gap-3">
                  {amenities.map((amenity, index) => (
                    <button
                      key={index}
                      type="button"
                      className="px-4 py-2 !bg-slate-100 !text-slate-700 border !border-slate-200 font-medium !rounded-full hover:!bg-blue-600 hover:!text-white hover:!border-blue-600 transition-all text-sm shadow-sm"
                      onClick={() => {
                        setOpenAmenitiesModal(true);
                        setEdit(true);
                        setSelectedAmenity(amenity);
                      }}
                    >
                      {amenity.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <AmenitiesModal
        openAmenitiesModal={openAmenitiesModal}
        setOpenAmenitiesModal={handleCloseModal}
        edit={edit}
        get_all_amenities={get_all_amenities}
        amenity={selectedAmenity} // Pass the selected amenity
      />
    </>
  );
}

export default Amenities;
