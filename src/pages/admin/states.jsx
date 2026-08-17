import { useContext, useEffect, useState } from 'react';
import { Pagination, Table, Input } from 'rsuite';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import StateModal from '../../components/adminComponents/StateModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import Button from '../../components/ui/Button';

const { Column, HeaderCell, Cell } = Table;

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

  // Search functionality with debounce
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // If search term is empty, get all states
    if (!searchTerm.trim()) {
      get_all_states(1);
      return;
    }

    // Set new timeout for search
    const timeoutId = setTimeout(() => {
      searchStates(searchTerm.trim());
    }, 3000); // 3 seconds delay

    setSearchTimeout(timeoutId);

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
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
      .finally(() => {
        setLoading(false);
      });
  };

  const searchStates = async (searchValue) => {
    setSearching(true);
    try {
      const response = await fetch(
        `${apiUrl}admin/search-state?search=${encodeURIComponent(searchValue)}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authData.token,
          },
        }
      );
      const json = await response.json();

      if (json.status) {
        setStatesData(json.data);
        // Reset pagination for search results
        setPaginationMeta({
          current_page: 1,
          total: json.data.length,
          per_page: json.data.length,
        });
        setShowNoData(false);
      } else {
        setStatesData([]);
        setPaginationMeta({
          current_page: 1,
          total: 0,
          per_page: 20,
        });
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
    // Show searching indicator when user is typing
    if (value.trim()) {
      setSearching(true);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    get_all_states(1);
  };

  if (loading) {
    return <DataLoader />;
  }

  const states = [
    ...new Map(statesData.map((item) => [item.state_name, item])).values(),
  ];

  return (
    <>
      {showNoData && !searchTerm ? (
        <NoDataFound
          name="State"
          message="No state found, kindly add a new state!"
          showButton={true}
          handleClick={() => {
            handleOpen('state');
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="mb-0 text-lg font-semibold">States</h2>
            <div className="flex gap-2">
              <Button
                 appearance="primary"
                type="button"
                onClick={() => handleOpen('state')}
              >
                + Add New State
              </Button>
            </div>
          </div>

          {/* Search Input with Clear Button */}
          <div className="relative mb-3">
            <Input
              type="text"
              placeholder="Search by state name..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ paddingRight: searchTerm ? '40px' : '12px' }}
            />
            {searchTerm && (
              <Button
                 appearance="primary" className="absolute" size="sm"
                style={{
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  padding: '0',
                  width: '20px',
                  height: '20px',
                }}
                onClick={clearSearch}
                title="Clear search"
              >
                ×
              </Button>
            )}
            {searching && (
              <small className="text-gray-500 block mt-1">
                <i className="fa fa-spinner fa-spin me-1"></i>
                Searching...
              </small>
            )}
          </div>

          {/* Search Results Info */}
          {searchTerm && !searching && (
            <div className="mb-3">
              <small className="text-gray-500">
                {statesData.length > 0
                  ? `Found ${statesData.length} result(s) for "${searchTerm}"`
                  : `No results found for "${searchTerm}"`}
                <Button
                   appearance="link" className="ms-2" size="sm"
                  onClick={clearSearch}
                >
                  Show all states
                </Button>
              </small>
            </div>
          )}

          {/* No Search Results */}
          {showNoData && searchTerm && !searching ? (
            <div className="text-center py-12">
              <div className="mb-3">
                <i className="fa fa-search fa-3x text-gray-500"></i>
              </div>
              <h5>No states found</h5>
              <p className="text-gray-500">
                No states match your search for "{searchTerm}"
              </p>
              <Button  appearance="ghost" color="blue" onClick={clearSearch}>
                Show all states
              </Button>
            </div>
          ) : (
            <>
              <Table
                data={states}
                hover
                showHeader
                bordered
                cellBordered
                autoHeight
                rowHeight={45}
                headerHeight={40}
              >
                <Column width={100}>
                  <HeaderCell>ID</HeaderCell>
                  <Cell dataKey="id" />
                </Column>
                <Column flexGrow={1}>
                  <HeaderCell>State Name</HeaderCell>
                  <Cell dataKey="state_name">
                    {(rowData) => (
                      <Button
                         appearance="link" className="text-left"
                        onClick={() => {
                          handleOpen('state', true, rowData);
                        }}
                        style={{ textDecoration: 'none' }}
                      >
                        {rowData.state_name}
                      </Button>
                    )}
                  </Cell>
                </Column>
                <Column width={100}>
                  <HeaderCell>Actions</HeaderCell>
                  <Cell>
                    {(rowData) => (
                      <Button
                         appearance="ghost" color="blue" size="sm"
                        onClick={() => handleOpen('state', true, rowData)}
                      >
                        Edit
                      </Button>
                    )}
                  </Cell>
                </Column>
              </Table>

              {/* Pagination - Only show for regular results, not search results */}
              {!searchTerm && (
                <div className="flex justify-end mt-3">
                  <Pagination
                    prev
                    last
                    next
                    first
                    size="sm"
                    ellipsis="true"
                    total={paginationMeta.total}
                    limit={paginationMeta.per_page}
                    activePage={paginationMeta.current_page}
                    onChangePage={(page) =>
                      setPaginationMeta((prev) => ({
                        ...prev,
                        current_page: page,
                      }))
                    }
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modals */}
      <StateModal
        openStateModal={openModal.state}
        setOpenStateModal={() => handleClose('state')}
        edit={edit.state}
        setStatesData={setStatesData}
      />
    </>
  );
}
