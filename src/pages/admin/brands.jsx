import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../AuthContextProvider';
import BrandModal from '../../components/adminComponents/BrandModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import PageLayout from '../../components/sharedComponents/PageLayout';
import DataTable, { Column, HeaderCell, Cell } from '../../components/sharedComponents/DataTable';
import Button from '../../components/ui/Button';
import { apiUrl, imageUrl } from '../../envConfig';

function Brands() {
  const { authData } = useContext(AuthContext);
  const [brands, setBrands] = useState([]);
  const [openBrandModal, setOpenBrandModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => { get_all_brands(); }, []);

  const get_all_brands = () => {
    fetch(apiUrl + 'admin/get-all-brands', {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    })
      .then((response) => response.json())
      .then((json) => { if (json.success) { setBrands(json.data); setShowNoData(json.data.length === 0); } else { setShowNoData(true); } })
      .catch((error) => console.error('Error:', error))
      .finally(() => setLoading(false));
  };

  const handleCloseModal = () => { setOpenBrandModal(false); setSelectedBrand(null); };

  if (loading) return <DataLoader />;

  return (
    <>
      {showNoData ? (
        <NoDataFound name="Brand" message="No brands found, kindly add a new brand!" showButton={true}
          handleClick={() => { setOpenBrandModal(true); setEdit(false); setSelectedBrand(null); }} />
      ) : (
        <PageLayout
          title="Brands"
          subtitle="Manage operator brands and companies."
          actionLabel="+ Add New Brand"
          actionOnClick={() => { setOpenBrandModal(true); setEdit(false); setSelectedBrand(null); }}
        >
          <DataTable data={brands}>
            <Column width={80} align="center">
              <HeaderCell>Logo</HeaderCell>
              <Cell>
                {(rowData) => rowData.logo ? (
                  <img
                    src={`${imageUrl}${rowData.logo}`}
                    alt="Logo"
                    className="w-8 h-8 rounded-md object-contain border border-line bg-section p-0.5"
                  />
                ) : (
                  <span className="text-muted text-xs italic">No logo</span>
                )}
              </Cell>
            </Column>
            <Column flexGrow={1}>
              <HeaderCell>Company</HeaderCell>
              <Cell dataKey="operator_company_name" />
            </Column>
            <Column flexGrow={1}>
              <HeaderCell>Brand Name</HeaderCell>
              <Cell>
                {(rowData) => (
                  <div className="flex items-center gap-2">
                    <span>{rowData.operator_brand_name}</span>
                    {rowData.is_main_brand ? (
                      <span className="bg-coral/10 text-coral text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        MAIN BRAND
                      </span>
                    ) : null}
                  </div>
                )}
              </Cell>
            </Column>
            <Column flexGrow={1}>
              <HeaderCell>Email</HeaderCell>
              <Cell>{(rowData) => rowData.email || '-'}</Cell>
            </Column>
            <Column width={100} align="center">
              <HeaderCell>Actions</HeaderCell>
              <Cell>
                {(rowData) => (
                  <Button appearance="subtle" size="xs"
                    onClick={() => { setOpenBrandModal(true); setEdit(true); setSelectedBrand(rowData); }}>
                    Edit
                  </Button>
                )}
              </Cell>
            </Column>
          </DataTable>
        </PageLayout>
      )}
      <BrandModal openBrandModal={openBrandModal} setOpenBrandModal={handleCloseModal} edit={edit} get_all_brands={get_all_brands} brand={selectedBrand} />
    </>
  );
}

export default Brands;
