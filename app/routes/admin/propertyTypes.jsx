import { useContext, useEffect, useState } from 'react';
import { apiUrl } from '../../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import PropertyTypesModal from '../../components/adminComponents/PropertyTypesModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';

function PropertyTypes() {
  const { authData } = useContext(AuthContext);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [openPropertyTypesModal, setOpenPropertyTypesModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    get_all_property_types();
  }, []);

  const get_all_property_types = () => {
    setLoading(true);
    fetch(apiUrl + 'admin/get-all-property-types', {
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
          setPropertyTypes(json.data);
          setShowNoData(json.data.length === 0);
        } else {
          setShowNoData(true);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setShowNoData(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Reset selectedPropertyType when modal closes
  const handleCloseModal = () => {
    setOpenPropertyTypesModal(false);
    setSelectedPropertyType(null);
  };

  if (loading) return <DataLoader />;

  return (
    <>
      {showNoData ? (
        <NoDataFound
          name="Property Types"
          message="No Property Types found, kindly add a new Property Type!"
          showButton={true}
          handleClick={() => {
            setOpenPropertyTypesModal(true);
            setEdit(false);
            setSelectedPropertyType(null);
          }}
        />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0 text-lg font-semibold">Property Types</h2>
            <button
              className="btn btn-thm"
              type="button"
              onClick={() => {
                setOpenPropertyTypesModal(true);
                setEdit(false);
                setSelectedPropertyType(null);
              }}
            >
              + Add New Property Type
            </button>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="d-flex flex-wrap gap-3">
                {propertyTypes.map((propertyType, index) => (
                  <button
                    key={index}
                    className="btn btn-thm rounded"
                    onClick={() => {
                      setOpenPropertyTypesModal(true);
                      setEdit(true);
                      setSelectedPropertyType(propertyType);
                    }}
                  >
                    {propertyType.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      <PropertyTypesModal
        open={openPropertyTypesModal}
        onClose={handleCloseModal}
        edit={edit}
        propertyType={selectedPropertyType}
        get_all_property_types={get_all_property_types}
      />
    </>
  );
}

export default PropertyTypes;
