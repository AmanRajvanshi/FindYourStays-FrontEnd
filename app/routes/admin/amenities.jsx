import { useContext, useEffect, useState } from 'react';
import { apiUrl } from '../../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import AmenitiesModal from '../../components/adminComponents/AmenitiesModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';

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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0 text-lg font-semibold">Amenities</h2>
            <button
              className="btn btn-thm"
              type="button"
              onClick={() => {
                setOpenAmenitiesModal(true);
                setEdit(false);
                setSelectedAmenity(null);
              }}
            >
              + Add New Amenity
            </button>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="d-flex flex-wrap gap-3">
                {amenities.map((amenity, index) => (
                  <button
                    key={index}
                    className="btn btn-thm rounded"
                    onClick={() => {
                      setOpenAmenitiesModal(true);
                      setEdit(true);
                      setSelectedAmenity(amenity); // Set the amenity to edit
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
