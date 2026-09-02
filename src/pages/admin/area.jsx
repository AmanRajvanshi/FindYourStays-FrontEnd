import { useContext, useEffect, useState } from 'react';
import { Pagination, Input } from 'rsuite';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import AreaModal from '../../components/adminComponents/AreaModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import PageLayout from '../../components/sharedComponents/PageLayout';
import DataTable, { Column, HeaderCell, Cell } from '../../components/sharedComponents/DataTable';
import Button from '../../components/ui/Button';

export default function CitiesAndAreas() {
  const { authData } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState({ area: false });
  const [edit, setEdit] = useState({ area: false });
  const [areasData, setAreasData] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({ current_page: 1, per_page: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showNoData, setShowNoData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleClose = (type) => {
    setOpenModal((prev) => ({ ...prev, [type]: false }));
    setEdit((prev) => ({ ...prev, [type]: false }));
  };

  useEffect(() => {
    if (!searchTerm) get_all_areas(paginationMeta.current_page);
    getAllStates();
  }, [paginationMeta.current_page]);

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!searchTerm.trim()) { get_all_areas(1); return; }
    const timeoutId = setTimeout(() => searchAreas(searchTerm.trim()), 3000);
    setSearchTimeout(timeoutId);
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [searchTerm]);

  const get_all_areas = (page = 1) => {
    setLoading(true);
    fetch(`${apiUrl}admin/get-all-areas?page=${page}`, {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setAreasData(json.data.data);
          setPaginationMeta({ current_page: json.data.current_page, per_page: json.data.per_page, total: json.data.total });
          setShowNoData(false);
        } else { setAreasData([]); setShowNoData(true); }
      })
      .catch((error) => { console.error('Error:', error); setAreasData([]); setShowNoData(true); })
      .finally(() => setLoading(false));
  };

  const searchAreas = async (searchValue) => {
    setSearching(true);
    try {
      const response = await fetch(`${apiUrl}admin/search-area?search=${encodeURIComponent(searchValue)}`, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
      });
      const json = await response.json();
      if (json.status) {
        setAreasData(json.data);
        setPaginationMeta({ current_page: 1, total: json.data.length, per_page: json.data.length });
        setShowNoData(false);
      } else { setAreasData([]); setPaginationMeta({ current_page: 1, total: 0, per_page: 20 }); setShowNoData(true); }
    } catch (error) { console.error('Error searching areas:', error); setAreasData([]); setShowNoData(true); }
    finally { setSearching(false); }
  };

  const getAllStates = () => {
    fetch(`${apiUrl}admin/get-all-states?paginate=0`, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          const list = Array.isArray(json.data) ? json.data : (json.data?.data || []);
          setStateList(list.map((s) => ({ label: s.state_name, value: s.id })));
        }
      });
  };

  const handleSearchChange = (value) => { setSearchTerm(value); if (value.trim()) setSearching(true); };
  const clearSearch = () => { setSearchTerm(''); if (searchTimeout) clearTimeout(searchTimeout); get_all_areas(1); };

  const handleOpenEditArea = (areaData) => {
    setOpenModal((prev) => ({ ...prev, area: true }));
    setEdit((prev) => ({ ...prev, area: { editing: true, data: areaData } }));
  };

  const handleAddArea = () => {
    setOpenModal((prev) => ({ ...prev, area: true }));
    setEdit((prev) => ({ ...prev, area: { editing: false, data: null } }));
  };

  if (loading) return <DataLoader />;

  const areas = areasData.map((item) => ({
    id: item.id, area_name: item.area_name,
    city_name: item.city?.city_name || 'N/A',
    state_name: item.state?.state_name || item.city?.state?.state_name || 'N/A',
  }));

  return (
    <>
      {showNoData && !searchTerm ? (
        <NoDataFound name="Area" message="No area found, kindly add a new area!" showButton={true} handleClick={handleAddArea} />
      ) : (
        <PageLayout
          title="Areas"
          subtitle="Manage and organize your areas database."
          actionLabel="+ Add New Area"
          actionOnClick={handleAddArea}
        >
          <div className="relative mb-4">
            <Input type="text" placeholder="Search by area name..." value={searchTerm} onChange={handleSearchChange}
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
                {areasData.length > 0 ? `Found ${areasData.length} result(s) for "${searchTerm}"` : `No results found for "${searchTerm}"`}
                <Button appearance="link" className="ms-2" size="sm" onClick={clearSearch}>Show all areas</Button>
              </small>
            </div>
          )}

          {showNoData && searchTerm && !searching ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <h5 className="text-ink font-semibold mb-1">No areas found</h5>
              <p className="text-muted text-sm">No areas match your search for "{searchTerm}"</p>
              <Button appearance="ghost" onClick={clearSearch} className="mt-3">Show all areas</Button>
            </div>
          ) : (
            <>
              <DataTable data={areas}>
                <Column width={80} align="center">
                  <HeaderCell>ID</HeaderCell>
                  <Cell dataKey="id" />
                </Column>
                <Column flexGrow={1}>
                  <HeaderCell>State</HeaderCell>
                  <Cell dataKey="state_name" />
                </Column>
                <Column flexGrow={1}>
                  <HeaderCell>City</HeaderCell>
                  <Cell dataKey="city_name" />
                </Column>
                <Column flexGrow={2}>
                  <HeaderCell>Area Name</HeaderCell>
                  <Cell dataKey="area_name">
                    {(rowData) => (
                      <Button appearance="link" className="text-left" onClick={() => handleOpenEditArea(rowData)} style={{ textDecoration: 'none' }}>
                        {rowData.area_name}
                      </Button>
                    )}
                  </Cell>
                </Column>
                <Column width={100} align="center">
                  <HeaderCell>Actions</HeaderCell>
                  <Cell>
                    {(rowData) => (
                      <Button appearance="subtle" size="xs" onClick={() => handleOpenEditArea(rowData)}>Edit</Button>
                    )}
                  </Cell>
                </Column>
              </DataTable>

              {!searchTerm && (
                <div className="flex justify-end mt-4 pt-4 border-t border-line/30">
                  <Pagination prev last next first size="sm" ellipsis="true"
                    total={paginationMeta.total} limit={paginationMeta.per_page} activePage={paginationMeta.current_page}
                    onChangePage={(page) => setPaginationMeta((prev) => ({ ...prev, current_page: page }))}
                  />
                </div>
              )}
            </>
          )}
        </PageLayout>
      )}

      <AreaModal openAreaModal={openModal.area} setOpenAreaModal={() => handleClose('area')} edit={edit.area} setAreaData={setAreasData} token={authData.token} stateList={stateList} />
    </>
  );
}
