import { useContext, useEffect, useState } from 'react';
import { Pagination, Input } from 'rsuite';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import StateModal from '../../components/adminComponents/StateModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import PageLayout from '../../components/sharedComponents/PageLayout';
import DataTable, { Column, HeaderCell, Cell } from '../../components/sharedComponents/DataTable';
import Button from '../../components/ui/Button';

export default function States() {
  const { authData } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState({ state: false });
  const [edit, setEdit] = useState({ state: false });
  const [statesData, setStatesData] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showNoData, setShowNoData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleOpen = (type, isEdit = false, data = null) => {
    setOpenModal((prev) => ({ ...prev, [type]: true }));
    setEdit((prev) => ({ ...prev, [type]: { editing: isEdit, data } }));
  };

  const handleClose = (type) => {
    setOpenModal((prev) => ({ ...prev, [type]: false }));
    setEdit((prev) => ({ ...prev, [type]: { editing: false, data: null } }));
  };

  useEffect(() => {
    if (!searchTerm) {
      get_all_states(paginationMeta.current_page);
    }
  }, [paginationMeta.current_page]);

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!searchTerm.trim()) {
      get_all_states(1);
      return;
    }
    const timeoutId = setTimeout(() => searchStates(searchTerm.trim()), 3000);
    setSearchTimeout(timeoutId);
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [searchTerm]);

  const get_all_states = (page = 1) => {
    setLoading(true);
    fetch(`${apiUrl}admin/get-all-states?page=${page}`, {
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
          setStatesData(json.data.data);
          setPaginationMeta({
            current_page: json.data.current_page,
            per_page: json.data.per_page,
            total: json.data.total,
          });
          setShowNoData(false);
        } else {
          setStatesData([]);
          setShowNoData(true);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setStatesData([]);
        setShowNoData(true);
      })
      .finally(() => setLoading(false));
  };

  const searchStates = async (searchValue) => {
    setSearching(true);
    try {
      const response = await fetch(
        `${apiUrl}admin/search-state?search=${encodeURIComponent(searchValue)}`,
        { headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token } }
      );
      const json = await response.json();
      if (json.status) {
        setStatesData(json.data);
        setPaginationMeta({ current_page: 1, total: json.data.length, per_page: json.data.length });
        setShowNoData(false);
      } else {
        setStatesData([]);
        setPaginationMeta({ current_page: 1, total: 0, per_page: 20 });
        setShowNoData(true);
      }
    } catch (error) {
      console.error('Error searching states:', error);
      setStatesData([]);
      setShowNoData(true);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim()) setSearching(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (searchTimeout) clearTimeout(searchTimeout);
    get_all_states(1);
  };

  if (loading) return <DataLoader />;

  const states = [...new Map(statesData.map((item) => [item.state_name, item])).values()];

  return (
    <>
      {showNoData && !searchTerm ? (
        <NoDataFound
          name="State"
          message="No state found, kindly add a new state!"
          showButton={true}
          handleClick={() => handleOpen('state')}
        />
      ) : (
        <PageLayout
          title="States"
          actionLabel="+ Add New State"
          actionOnClick={() => handleOpen('state')}
        >
          {/* Search */}
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search by state name..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ paddingRight: searchTerm ? '40px' : '12px' }}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                title="Clear search"
              >
                ×
              </button>
            )}
            {searching && (
              <small className="text-muted block mt-1">
                <span className="loader !w-3.5 !h-3.5 !border-2 align-middle"></span>
                Searching...
              </small>
            )}
          </div>

          {searchTerm && !searching && (
            <div className="mb-3">
              <small className="text-muted">
                {statesData.length > 0
                  ? `Found ${statesData.length} result(s) for "${searchTerm}"`
                  : `No results found for "${searchTerm}"`}
                <Button appearance="link" className="ms-2" size="sm" onClick={clearSearch}>
                  Show all states
                </Button>
              </small>
            </div>
          )}

          {showNoData && searchTerm && !searching ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <h5 className="text-ink font-semibold mb-1">No states found</h5>
              <p className="text-muted text-sm">No states match your search for "{searchTerm}"</p>
              <Button appearance="ghost" onClick={clearSearch} className="mt-3">Show all states</Button>
            </div>
          ) : (
            <>
              <DataTable data={states}>
                <Column width={80} align="center">
                  <HeaderCell>ID</HeaderCell>
                  <Cell dataKey="id" />
                </Column>
                <Column flexGrow={1}>
                  <HeaderCell>State Name</HeaderCell>
                  <Cell dataKey="state_name">
                    {(rowData) => (
                      <Button
                        appearance="link"
                        className="text-left"
                        onClick={() => handleOpen('state', true, rowData)}
                        style={{ textDecoration: 'none' }}
                      >
                        {rowData.state_name}
                      </Button>
                    )}
                  </Cell>
                </Column>
                <Column width={100} align="center">
                  <HeaderCell>Actions</HeaderCell>
                  <Cell>
                    {(rowData) => (
                      <Button appearance="subtle" size="xs" onClick={() => handleOpen('state', true, rowData)}>
                        Edit
                      </Button>
                    )}
                  </Cell>
                </Column>
              </DataTable>

              {!searchTerm && (
                <div className="flex justify-end mt-4 pt-4 border-t border-line/30">
                  <Pagination
                    prev last next first size="sm" ellipsis="true"
                    total={paginationMeta.total}
                    limit={paginationMeta.per_page}
                    activePage={paginationMeta.current_page}
                    onChangePage={(page) => setPaginationMeta((prev) => ({ ...prev, current_page: page }))}
                  />
                </div>
              )}
            </>
          )}
        </PageLayout>
      )}

      <StateModal
        openStateModal={openModal.state}
        setOpenStateModal={() => handleClose('state')}
        edit={edit.state}
        setStatesData={setStatesData}
      />
    </>
  );
}
