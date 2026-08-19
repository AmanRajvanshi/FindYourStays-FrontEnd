import { useContext, useEffect, useState } from 'react';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import NearbyLocationsModal from '../../components/adminComponents/NearbyLocationsModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import Button from '../../components/ui/Button';

function NearbyLocations() {
  const { authData } = useContext(AuthContext);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [openNearbyLocationsModal, setOpenNearbyLocationsModal] =
    useState(false);
  const [edit, setEdit] = useState(false);
  const [selectedNearbyLocations, setSelectedNearbyLocations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    get_all_nearby_locations();
  }, []);

  const get_all_nearby_locations = () => {
    setLoading(true); // ensure loading is true on reload
    fetch(apiUrl + 'admin/get-all-nearby-locations', {
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
          setNearbyLocations(json.data);
          setShowNoData(json.data.length === 0);
        } else {
          setShowNoData(true);
        }
      })
      .catch((error) => {
        setShowNoData(true);
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCloseModal = () => {
    setOpenNearbyLocationsModal(false);
    setSelectedNearbyLocations(null);
  };

  if (loading) {
    return <DataLoader />;
  }

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm mb-6">
        {showNoData ? (
          <NoDataFound
            name="Nearby Facilities"
            message="No Nearby Facilities found, kindly add a new Nearby Facility!"
            showButton={true}
            handleClick={() => {
              setOpenNearbyLocationsModal(true);
              setEdit(false);
              setSelectedNearbyLocations(null);
            }}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="mb-0 text-lg font-semibold">Nearby Facilities</h2>
              <Button
                appearance="primary"
                type="button"
                onClick={() => {
                  setOpenNearbyLocationsModal(true);
                  setEdit(false);
                  setSelectedNearbyLocations(null);
                }}
              >
                + Add New Nearby Facility
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {nearbyLocations.map((nearbyLocation, index) => (
                <button
                  key={index}
                  type="button"
                  className="px-4 py-2 !bg-slate-100 !text-slate-700 border !border-slate-200 font-medium !rounded-full hover:!bg-blue-600 hover:!text-white hover:!border-blue-600 transition-all text-sm shadow-sm"
                  onClick={() => {
                    setOpenNearbyLocationsModal(true);
                    setEdit(true);
                    setSelectedNearbyLocations(nearbyLocation);
                  }}
                >
                  {nearbyLocation.nearby_location_name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <NearbyLocationsModal
        openAmenitiesModal={openNearbyLocationsModal}
        setOpenAmenitiesModal={handleCloseModal}
        edit={edit}
        get_all_nearby_locations={get_all_nearby_locations}
        selectedNearbyLocations={selectedNearbyLocations}
      />
    </>
  );
}

export default NearbyLocations;
