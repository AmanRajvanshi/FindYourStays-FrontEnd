import { useContext, useEffect, useState } from 'react';
import { Input, Pagination, Table } from 'rsuite';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import CityModal from '../../components/adminComponents/CityModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import Button from '../../components/ui/Button';

const { Column, HeaderCell, Cell } = Table;

export default function Cities() {
  const { authData } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState({ city: false });
  const [edit, setEdit] = useState({ city: false });
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showNoData, setShowNoData] = useState(false);
  const [stateList, setStateList] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 20,
  });
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
    if (!searchTerm) {
      getAllCities(pagination.current_page);
    }
    getAllStates();
  }, [pagination.current_page]);

  // Search functionality with debounce
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // If search term is empty, get all cities
    if (!searchTerm.trim()) {
      getAllCities(1);
      return;
    }

    // Set new timeout for search
    const timeoutId = setTimeout(() => {
      searchCities(searchTerm.trim());
    }, 3000); // 3 seconds delay

    setSearchTimeout(timeoutId);

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchTerm]);

  const getAllCities = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}admin/get-all-cities?page=${page}`,
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
        setCityData(json.data.data);
        setPagination({
          current_page: json.data.current_page,
          total: json.data.total,
          per_page: json.data.per_page,
        });
        setShowNoData(false);
      } else {
        setCityData([]);
        setShowNoData(true);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCityData([]);
      setShowNoData(true);
    } finally {
      setLoading(false);
    }
  };

  const searchCities = async (searchValue) => {
    setSearching(true);
    try {
      const response = await fetch(
        `${apiUrl}admin/search-city?search=${encodeURIComponent(searchValue)}`,
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
        setCityData(json.data);
        // Reset pagination for search results
        setPagination({
          current_page: 1,
          total: json.data.length,
          per_page: json.data.length,
        });
        setShowNoData(false);
      } else {
        setCityData([]);
        setPagination({
          current_page: 1,
          total: 0,
          per_page: 20,
        });
        setShowNoData(true);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      setCityData([]);
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
    getAllCities(1);
  };

  // Custom cell component for city name with edit functionality
  const CityNameCell = ({ rowData }) => {
    const originalCityData = cityData.find((city) => city.id === rowData.id);

    return (
      <Button
         appearance="link" className="text-left"
        onClick={() => handleOpen('city', true, originalCityData)}
        style={{ textDecoration: 'none' }}
      >
        {rowData.city_name}
      </Button>
    );
  };

  // Custom cell component for status display
  const StatusCell = ({ rowData }) => {
    const originalCityData = cityData.find((city) => city.id === rowData.id);
    const status = originalCityData?.status || 'active';

    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
      >
        {status === 'active' ? 'Active' : 'Coming Soon'}
      </span>
    );
  };

  // Custom cell component for main city display
  const MainCityCell = ({ rowData }) => {
    const originalCityData = cityData.find((city) => city.id === rowData.id);
    const isMain =
      originalCityData?.is_main === '1' ||
      originalCityData?.is_main === 1 ||
      originalCityData?.is_main === true;

    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${isMain ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
        {isMain ? 'Yes' : 'No'}
      </span>
    );
  };

  if (loading) return <DataLoader />;

  return (
    <>
      {showNoData && !searchTerm ? (
        <NoDataFound
          name="City"
          message="No cities found, kindly add a new city!"
          showButton={true}
          handleClick={() => handleOpen('city')}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="mb-0 text-lg font-semibold">Cities</h2>
            <Button  appearance="primary" onClick={() => handleOpen('city')}>
              + Add New City
            </Button>
          </div>

          {/* Search Input with Clear Button */}
          <div className="relative mb-3">
            <Input
              type="text"
              placeholder="Search by city name..."
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
                {cityData.length > 0
                  ? `Found ${cityData.length} result(s) for "${searchTerm}"`
                  : `No results found for "${searchTerm}"`}
                <Button
                   appearance="link" className="ms-2" size="sm"
                  onClick={clearSearch}
                >
                  Show all cities
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
              <h5>No cities found</h5>
              <p className="text-gray-500">
                No cities match your search for "{searchTerm}"
              </p>
              <Button  appearance="ghost" color="blue" onClick={clearSearch}>
                Show all cities
              </Button>
            </div>
          ) : (
            <>
              <Table
                data={cityData.map((item) => ({
                  id: item.id,
                  city_name: item.city_name,
                  state_name: item.state?.state_name || 'N/A',
                  state_id: item.state?.id || null,
                  status: item.status,
                  is_main: item.is_main,
                  image: item.image,
                }))}
                hover
                showHeader
                bordered
                cellBordered
                autoHeight
                rowHeight={50}
                headerHeight={40}
              >
                <Column width={80}>
                  <HeaderCell>ID</HeaderCell>
                  <Cell dataKey="id" />
                </Column>

                <Column width={100}>
                  <HeaderCell>Image</HeaderCell>
                  <Cell>
                    {(rowData) =>
                      rowData.image ? (
                        <span className="text-green-500">
                          <i className="fa fa-check"></i>
                        </span>
                      ) : (
                        <span className="text-red-500">
                          <i className="fa fa-times"></i>
                        </span>
                      )
                    }
                  </Cell>
                </Column>

                <Column flexGrow={1}>
                  <HeaderCell>City Name</HeaderCell>
                  <Cell>{(rowData) => <CityNameCell rowData={rowData} />}</Cell>
                </Column>

                <Column flexGrow={1}>
                  <HeaderCell>State</HeaderCell>
                  <Cell dataKey="state_name" />
                </Column>

                <Column width={120}>
                  <HeaderCell>Status</HeaderCell>
                  <Cell>{(rowData) => <StatusCell rowData={rowData} />}</Cell>
                </Column>

                <Column width={100}>
                  <HeaderCell>Main City</HeaderCell>
                  <Cell>{(rowData) => <MainCityCell rowData={rowData} />}</Cell>
                </Column>

                <Column width={100}>
                  <HeaderCell>Actions</HeaderCell>
                  <Cell>
                    {(rowData) => {
                      const originalCityData = cityData.find(
                        (city) => city.id === rowData.id
                      );
                      return (
                        <Button
                           appearance="ghost" color="blue" size="sm"
                          onClick={() =>
                            handleOpen('city', true, originalCityData)
                          }
                        >
                          Edit
                        </Button>
                      );
                    }}
                  </Cell>
                </Column>
              </Table>

              {/* Pagination - Only show for regular results, not search results */}
              {!searchTerm && (
                <div className="flex justify-end mt-4">
                  <Pagination
                    prev
                    last
                    next
                    first
                    size="sm"
                    ellipsis="true"
                    total={pagination.total}
                    limit={pagination.per_page}
                    activePage={pagination.current_page}
                    onChangePage={(page) =>
                      setPagination((prev) => ({ ...prev, current_page: page }))
                    }
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      <CityModal
        openCityModal={openModal.city}
        setOpenCityModal={() => handleClose('city')}
        edit={edit.city}
        setCityData={setCityData}
        token={authData.token}
        stateList={stateList}
      />
    </>
  );
}
