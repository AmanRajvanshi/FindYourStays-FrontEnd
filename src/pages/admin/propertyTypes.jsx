import { useContext, useEffect, useState } from 'react';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import PropertyTypesModal from '../../components/adminComponents/PropertyTypesModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import PageLayout from '../../components/sharedComponents/PageLayout';
import Button from '../../components/ui/Button';

function PropertyTypes() {
  const { authData } = useContext(AuthContext);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [openPropertyTypesModal, setOpenPropertyTypesModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => { get_all_property_types(); }, []);

  const get_all_property_types = () => {
    setLoading(true);
    fetch(apiUrl + 'admin/get-all-property-types', {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    })
      .then((response) => response.json())
      .then((json) => { if (json.status) { setPropertyTypes(json.data); setShowNoData(json.data.length === 0); } else { setShowNoData(true); } })
      .catch((error) => { console.error('Error:', error); setShowNoData(true); })
      .finally(() => setLoading(false));
  };

  const handleCloseModal = () => { setOpenPropertyTypesModal(false); setSelectedPropertyType(null); };

  if (loading) return <DataLoader />;

  return (
    <>
      {showNoData ? (
        <NoDataFound name="Property Types" message="No Property Types found, kindly add a new Property Type!" showButton={true}
          handleClick={() => { setOpenPropertyTypesModal(true); setEdit(false); setSelectedPropertyType(null); }} />
      ) : (
        <PageLayout
          title="Property Types"
          subtitle="Manage property type categories."
          actionLabel="+ Add New Property Type"
          actionOnClick={() => { setOpenPropertyTypesModal(true); setEdit(false); setSelectedPropertyType(null); }}
        >
          <div className="flex flex-wrap gap-2.5">
            {propertyTypes.map((propertyType, index) => (
              <button
                key={index}
                type="button"
                className="px-4 py-2 bg-line/40 text-ink border border-line font-medium rounded-full hover:bg-coral hover:text-white hover:border-coral transition-all text-sm"
                onClick={() => { setOpenPropertyTypesModal(true); setEdit(true); setSelectedPropertyType(propertyType); }}
              >
                {propertyType.name}
              </button>
            ))}
          </div>
        </PageLayout>
      )}
      <PropertyTypesModal open={openPropertyTypesModal} onClose={handleCloseModal} edit={edit}
        propertyType={selectedPropertyType} get_all_property_types={get_all_property_types} />
    </>
  );
}

export default PropertyTypes;
