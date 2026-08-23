import { useContext, useEffect, useState } from 'react';
import { Input, Pagination } from 'rsuite';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import CityModal from '../../components/adminComponents/CityModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import PageLayout from '../../components/sharedComponents/PageLayout';
import DataTable, { Column, HeaderCell, Cell } from '../../components/sharedComponents/DataTable';
import Button from '../../components/ui/Button';

export default function Cities() {
  const { authData } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState({ city: false });
  const [edit, setEdit] = useState({ city: false });
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showNoData, setShowNoData] = useState(false);
  const [stateList, setStateList] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, total: 0, per_page: 20 });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleOpen = (type, isEdit = false, data = null) => {
    setOpenModal((prev) => ({ ...prev, [type]: true }));
    setEdit((prev) => ({ ...prev, [type]: { editing: isEdit, data } }));
  };

  const handleClose = (type) => {
    setOpenModal((prev) => ({ ...prev, [type]: false }));
    setEdit((prev) => ({ ...prev, [type]: false }));
  };

  useEffect(() => {
    if (!searchTerm) getAllCities(pagination.current_page);
    getAllStates();
  }, [pagination.current_page]);

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!searchTerm.trim()) { getAllCities(1); return; }
    const timeoutId = setTimeout(() => searchCities(searchTerm.trim()), 3000);
    setSearchTimeout(timeoutId);
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [searchTerm]);

  const getAllCities = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}admin/get-all-cities?page=${page}`, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
      });
      const json = await response.json();
      if (json.status) {
        setCityData(json.data.data);
        setPagination({ current_page: json.data.current_page, total: json.data.total, per_page: json.data.per_page });
        setShowNoData(false);
      } else { setCityData([]); setShowNoData(true); }
    } catch (error) { console.error('Error fetching cities:', error); setCityData([]); setShowNoData(true); }
    finally { setLoading(false); }
  };

  const searchCities = async (searchValue) => {
    setSearching(true);
    try {
      const response = await fetch(`${apiUrl}admin/search-city?search=${encodeURIComponent(searchValue)}`, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
      });
      const json = await response.json();
      if (json.status) {
        setCityData(json.data);
        setPagination({ current_page: 1, total: json.data.length, per_page: json.data.length });
        setShowNoData(false);
      } else { setCityData([]); setPagination({ current_page: 1, total: 0, per_page: 20 }); setShowNoData(true); }
    } catch (error) { console.error('Error searching cities:', error); setCityData([]); setShowNoData(true); }
    finally { setSearching(false); }
  };

  const getAllStates = () => {
    fetch(`${apiUrl}admin/get-all-states`, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) setStateList(json.data.data.map((s) => ({ label: s.state_name, value: s.id })));
      });
  };

  const handleSearchChange = (value) => { setSearchTerm(value); if (value.trim()) setSearching(true); };
  const clearSearch = () => { setSearchTerm(''); if (searchTimeout) clearTimeout(searchTimeout); getAllCities(1); };

  const StatusCell = ({ rowData }) => {
    const original = cityData.find((c) => c.id === rowData.id);
    const status = original?.status || 'active';
    return (
      <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
        {status === 'active' ? 'Active' : 'Coming Soon'}
      </span>
    );
  };

  const MainCityCell = ({ rowData }) => {
    const original = cityData.find((c) => c.id === rowData.id);
    const isMain = original?.is_main === '1' || original?.is_main === 1 || original?.is_main === true;
    return (
      <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${isMain ? 'bg-coral/10 text-coral' : 'bg-line/50 text-muted'}`}>
        {isMain ? 'Yes' : 'No'}
      </span>
    );
  };

  if (loading) return <DataLoader />;

  return (
    <>
      {showNoData && !searchTerm ? (
        <NoDataFound name="City" message="No cities found, kindly add a new city!" showButton={true} handleClick={() => handleOpen('city')} />
      ) : (
        <PageLayout
          title="Cities"
          subtitle="Manage and organize your cities database."
          actionLabel="+ Add New City"
          actionOnClick={() => handleOpen('city')}
        >
          <div className="relative mb-4">
            <Input type="text" placeholder="Search by city name..." value={searchTerm} onChange={handleSearchChange}
              style={{ paddingRight: searchTerm ? '40px' : '12px' }} />
            {searchTerm && (
              <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors" title="Clear search">×</button>
            )}
            {searching && (
              <small className="text-muted block mt-1">
                <span className="loader !w-3.5 !h-3.5 !border-2 align-middle"></span> Searching...
              </small>
            )}
          </div>

          {searchTerm && !searching && (
            <div className="mb-3">
              <small className="text-muted">
                {cityData.length > 0 ? `Found ${cityData.length} result(s) for "${searchTerm}"` : `No results found for "${searchTerm}"`}
                <Button appearance="link" className="ms-2" size="sm" onClick={clearSearch}>Show all cities</Button>
              </small>
            </div>
          )}

          {showNoData && searchTerm && !searching ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <h5 className="text-ink font-semibold mb-1">No cities found</h5>
              <p className="text-muted text-sm">No cities match your search for "{searchTerm}"</p>
              <Button appearance="ghost" onClick={clearSearch} className="mt-3">Show all cities</Button>
            </div>
          ) : (
            <>
              <DataTable
                data={cityData.map((item) => ({
                  id: item.id, city_name: item.city_name, state_name: item.state?.state_name || 'N/A',
                  status: item.status, is_main: item.is_main, image: item.image,
                }))}
              >
                <Column width={60} align="center">
                  <HeaderCell>ID</HeaderCell>
                  <Cell dataKey="id" />
                </Column>
                <Column width={60} align="center">
                  <HeaderCell>Image</HeaderCell>
                  <Cell>
                    {(rowData) => rowData.image ? (
                      <span className="text-emerald-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg></span>
                    ) : (
                      <span className="text-red-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 6l12 12M18 6L6 18"/></svg></span>
                    )}
                  </Cell>
                </Column>
                <Column flexGrow={1}>
                  <HeaderCell>City Name</HeaderCell>
                  <Cell>
                    {(rowData) => {
                      const original = cityData.find((c) => c.id === rowData.id);
                      return (
                        <Button appearance="link" className="text-left" onClick={() => handleOpen('city', true, original)} style={{ textDecoration: 'none' }}>
                          {rowData.city_name}
                        </Button>
                      );
                    }}
                  </Cell>
                </Column>
                <Column flexGrow={1}>
                  <HeaderCell>State</HeaderCell>
                  <Cell dataKey="state_name" />
                </Column>
                <Column width={110} align="center">
                  <HeaderCell>Status</HeaderCell>
                  <Cell>{(rowData) => <StatusCell rowData={rowData} />}</Cell>
                </Column>
                <Column width={100} align="center">
                  <HeaderCell>Main City</HeaderCell>
                  <Cell>{(rowData) => <MainCityCell rowData={rowData} />}</Cell>
                </Column>
                <Column width={100} align="center">
                  <HeaderCell>Actions</HeaderCell>
                  <Cell>
                    {(rowData) => {
                      const original = cityData.find((c) => c.id === rowData.id);
                      return <Button appearance="subtle" size="xs" onClick={() => handleOpen('city', true, original)}>Edit</Button>;
                    }}
                  </Cell>
                </Column>
              </DataTable>

              {!searchTerm && (
                <div className="flex justify-end mt-4 pt-4 border-t border-line/30">
                  <Pagination prev last next first size="sm" ellipsis="true"
                    total={pagination.total} limit={pagination.per_page} activePage={pagination.current_page}
                    onChangePage={(page) => setPagination((prev) => ({ ...prev, current_page: page }))}
                  />
                </div>
              )}
            </>
          )}
        </PageLayout>
      )}

      <CityModal openCityModal={openModal.city} setOpenCityModal={() => handleClose('city')} edit={edit.city} setCityData={setCityData} token={authData.token} stateList={stateList} />
    </>
  );
}
