import { useContext, useEffect, useState } from 'react';
import { Table, Pagination, Input } from 'rsuite';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import AreaModal from '../../components/adminComponents/AreaModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import Button from '../../components/ui/Button';

const { Column, HeaderCell, Cell } = Table;

export default function CitiesAndAreas() {
  const { authData } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState({ area: false });
  const [edit, setEdit] = useState({ area: false });
  const [areasData, setAreasData] = useState([]);
  const [stateList, setStateList] = useState([]);
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

  const handleClose = (type) => {
    setOpenModal((prev) => ({ ...prev, [type]: false }));
    setEdit((prev) => ({ ...prev, [type]: false }));
  };

  useEffect(() => {
    if (!searchTerm) {
      get_all_areas(paginationMeta.current_page);
    }
    getAllStates();
  }, [paginationMeta.current_page]);

  // Search functionality with debounce
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // If search term is empty, get all areas
    if (!searchTerm.trim()) {
      get_all_areas(1);
      return;
    }

    // Set new timeout for search
    const timeoutId = setTimeout(() => {
      searchAreas(searchTerm.trim());
    }, 3000); // 3 seconds delay

    setSearchTimeout(timeoutId);

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchTerm]);

  const get_all_areas = (page = 1) => {
    setLoading(true);
    fetch(`${apiUrl}admin/get-all-areas?page=${page}`, {
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
          setAreasData(json.data.data);
          setPaginationMeta({
            current_page: json.data.current_page,
            per_page: json.data.per_page,
            total: json.data.total,
          });
          setShowNoData(false);
        } else {
          setAreasData([]);
          setShowNoData(true);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setAreasData([]);
        setShowNoData(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const searchAreas = async (searchValue) => {
    setSearching(true);
    try {
      const response = await fetch(
        `${apiUrl}admin/search-area?search=${encodeURIComponent(searchValue)}`,
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
        setAreasData(json.data);
        // Reset pagination for search results
        setPaginationMeta({
          current_page: 1,
          total: json.data.length,
          per_page: json.data.length,
        });
        setShowNoData(false);
      } else {
        setAreasData([]);
        setPaginationMeta({
          current_page: 1,
          total: 0,
          per_page: 20,
        });
        setShowNoData(true);
      }
    } catch (error) {
      console.error('Error searching areas:', error);
      setAreasData([]);
      setShowNoData(true);
    } finally {
      setSearching(false);
    }
  };

  const getAllStates = () => {
    fetch(`${apiUrl}admin/get-all-states`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          const options = json.data.data.map((s) => ({
            label: s.state_name,
            value: s.id,
          }));
          setStateList(options);
        }
      });
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
    get_all_areas(1);
  };

  // For edit flex flex-wrap
  const handleOpenEditArea = (areaData) => {
    setOpenModal((prev) => ({ ...prev, area: true }));
    setEdit((prev) => ({
      ...prev,
      area: { editing: true, data: areaData },
    }));
  };

  // For add new area
  const handleAddArea = () => {
    setOpenModal((prev) => ({ ...prev, area: true }));
    setEdit((prev) => ({
      ...prev,
      area: { editing: false, data: null },
    }));
  };

  if (loading) {
    return <DataLoader />;
  }

  const areas = areasData.map((item) => ({
    id: item.id,
    area_name: item.area_name,
    city_name: item.city?.city_name || 'N/A',
    state_name: item.state?.state_name || item.city?.state?.state_name || 'N/A',
    state_id: item.state?.id || item.city?.state?.id || null,
    city_id: item.city?.id || null,
  }));

  return (
    <>
      {showNoData && !searchTerm ? (
        <NoDataFound
          name="Area"
          message="No area found, kindly add a new area!"
          showButton={true}
          handleClick={handleAddArea}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="mb-0 text-lg font-semibold">Areas</h2>
            <div className="flex gap-2">
              <Button
                appearance="primary"
                type="button"
                onClick={handleAddArea}
              >
                + Add New Area
              </Button>
            </div>
          </div>

          {/* Search Input with Clear Button */}
          <div className="relative mb-3">
            <Input
              type="text"
              placeholder="Search by area name..."
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
                {areasData.length > 0
                  ? `Found ${areasData.length} result(s) for "${searchTerm}"`
                  : `No results found for "${searchTerm}"`}
                <Button
                  appearance="link" className="ms-2" size="sm"
                  onClick={clearSearch}
                >
                  Show all areas
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
              <h5>No areas found</h5>
              <p className="text-gray-500">
                No areas match your search for "{searchTerm}"
              </p>
              <Button appearance="ghost" color="blue" onClick={clearSearch}>
                Show all areas
              </Button>
            </div>
          ) : (
            <>
              <Table
                data={areas}
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
                  <HeaderCell>State</HeaderCell>
                  <Cell dataKey="state_name" />
                </Column>
                <Column flexGrow={1}>
                  <HeaderCell>City</HeaderCell>
                  <Cell dataKey="city_name" />
                </Column>
                <Column flexGrow={3}>
                  <HeaderCell>Area Name</HeaderCell>
                  <Cell dataKey="area_name">
                    {(rowData) => (
                      <Button
                        appearance="link" className="text-left" size="sm"
                        onClick={() => handleOpenEditArea(rowData)}
                        style={{ textDecoration: 'none' }}
                      >
                        {rowData.area_name}
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
                        onClick={() => handleOpenEditArea(rowData)}
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
      <AreaModal
        openAreaModal={openModal.area}
        setOpenAreaModal={() => handleClose('area')}
        edit={edit.area}
        setAreaData={setAreasData}
        token={authData.token}
        stateList={stateList}
      />
    </>
  );
}
