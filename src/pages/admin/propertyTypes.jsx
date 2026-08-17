import { useContext, useEffect, useState } from 'react';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import PropertyTypesModal from '../../components/adminComponents/PropertyTypesModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import Button from '../../components/ui/Button';

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
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm mb-6">
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="mb-0 text-lg font-semibold">Property Types</h2>
              <Button
                appearance="primary"
                type="button"
                onClick={() => {
                  setOpenPropertyTypesModal(true);
                  setEdit(false);
                  setSelectedPropertyType(null);
                }}
              >
                + Add New Property Type
              </Button>
            </div>
            <div className="flex flex-wrap">
              <div className="col-lg-12">
                <div className="flex flex-wrap gap-3">
                  {propertyTypes.map((propertyType, index) => (
                    <button
                      key={index}
                      type="button"
                      className="px-4 py-2 !bg-slate-100 !text-slate-700 border !border-slate-200 font-medium !rounded-full hover:!bg-blue-600 hover:!text-white hover:!border-blue-600 transition-all text-sm shadow-sm"
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
      </div>
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
