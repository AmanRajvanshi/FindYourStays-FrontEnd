import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Input, Pagination, SelectPicker } from 'rsuite';
import { AuthContext } from '../../AuthContextProvider';
import SinglePropertyCardAdmin from '../../components/sharedComponents/SinglePropertyCardAdmin';
import { apiUrl } from '../../envConfig';
import DataLoader from '../../components/sharedComponents/DataLoader';
import { pricingRangeOptions } from '../../consonants/propertyOptions';
import Button from '../../components/ui/Button';

function Properties() {
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [propertyTypesList, setPropertyTypesList] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState();
  const [selectedCity, setSelectedCity] = useState();
  const [selectedType, setSelectedType] = useState();
  const [selectedPriceRange, setSelectedPriceRange] = useState();
  const [properties, setProperties] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authData?.token) {
      fetchCities();
      get_all_property_types();
    }
  }, [authData]);

  // Debouncer for search input: wait for 2 seconds pause before search triggers
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPaginationMeta((prev) => ({ ...prev, current_page: 1 })); // Optionally reset to first page on new search
    }, 700);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (authData?.token) {
      fetchProperties(paginationMeta.current_page, paginationMeta.per_page);
    } else if (authData && !authData.token) {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [
    paginationMeta.current_page,
    paginationMeta.per_page,
    search,
    selectedStatus,
    selectedCity,
    selectedType,
    selectedPriceRange,
    authData,
  ]);

  const fetchCities = () => {
    fetch(`${apiUrl}admin/get-city-by-state/0`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status) {
          const options = json.data.map((c) => ({
            value: c.id,
            label: c.city_name,
          }));
          setCities(options);
        }
      });
  };

  const get_all_property_types = () => {
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
          const options = json.data.map((s) => ({
            value: s.id,
            label: s.name,
          }));
          setPropertyTypesList(options);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        fetchCities();
      });
  };

  const fetchProperties = async (
    page = 1,
    per_page = paginationMeta.per_page
  ) => {
    setLoading(true);
    const params = [`page=${page}`, `per_page=${per_page}`];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (selectedStatus)
      params.push(`status=${encodeURIComponent(selectedStatus)}`);
    if (selectedCity)
      params.push(`city_id=${encodeURIComponent(selectedCity)}`);
    if (selectedType)
      params.push(`property_type=${encodeURIComponent(selectedType)}`);
    if (selectedPriceRange) {
      const nums = selectedPriceRange.replace(/[^\d\-]/g, '').split('-');
      if (nums.length === 2) {
        params.push(`price_range[]=${nums[0]}`);
        params.push(`price_range[]=${nums[1]}`);
      }
    }
    const url = `${apiUrl}admin/get-all-properties?${params.join('&')}`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: authData.token,
          Accept: 'application/json',
        },
      });
      const json = await res.json();
      setProperties(json.data || []);
      setPaginationMeta({
        total: json.total,
        per_page: json.per_page,
        current_page: json.current_page,
      });
    } catch (err) {
      setProperties([]);
      setPaginationMeta((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DataLoader />;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="mb-0 text-lg font-semibold">Properties</h2>
        <Button
           appearance="primary"
          type="button"
          onClick={() => {
            navigate('/admin/add-property');
          }}
        >
          + Add New Property
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row justify-between mb-4 gap-4">
          <div className="flex justify-start w-full lg:w-1/3">
            <Input
              type="text"
              placeholder="Search Properties"
              style={{ width: '100%' }}
              value={searchInput}
              onChange={setSearchInput}
              cleanable
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2 w-full lg:w-2/3">
            <SelectPicker
              data={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Draft', value: 'draft' },
                { label: 'Deleted', value: 'deleted' },
              ]}
              placeholder="Status"
              style={{ minWidth: 160 }}
              placement="auto"
              searchable={false}
              cleanable
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setPaginationMeta((prev) => ({ ...prev, current_page: 1 }));
              }}
            />
            <SelectPicker
              data={cities}
              placeholder="City"
              style={{ minWidth: 160 }}
              placement="auto"
              cleanable
              value={selectedCity}
              onChange={(val) => {
                setSelectedCity(val);
                setPaginationMeta((prev) => ({ ...prev, current_page: 1 }));
              }}
            />
            <SelectPicker
              data={propertyTypesList}
              placeholder="Property Type"
              style={{ minWidth: 160 }}
              placement="auto"
              searchable={false}
              cleanable
              value={selectedType}
              onChange={(val) => {
                setSelectedType(val);
                setPaginationMeta((prev) => ({ ...prev, current_page: 1 }));
              }}
            />
            <SelectPicker
              data={pricingRangeOptions}
              placeholder="Price Range"
              style={{ minWidth: 160 }}
              placement="auto"
              searchable={false}
              cleanable
              value={selectedPriceRange}
              onChange={(val) => {
                setSelectedPriceRange(val);
                setPaginationMeta((prev) => ({ ...prev, current_page: 1 }));
              }}
            />
          </div>
        </div>
        {properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <div key={property.id}>
                  <SinglePropertyCardAdmin
                    property={property}
                    fetchProperties={() =>
                      fetchProperties(
                        paginationMeta.current_page,
                        paginationMeta.per_page
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <div className="w-full flex justify-center mt-3">
              <Pagination
                prev
                last
                next
                first
                size="sm"
                ellipsis
                total={paginationMeta.total}
                limit={paginationMeta.per_page}
                activePage={paginationMeta.current_page}
                onChangePage={(page) =>
                  setPaginationMeta((prev) => ({ ...prev, current_page: page }))
                }
              />
            </div>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <h3 className="fw-semibold">No Properties Found</h3>
          </div>
        )}
      </div>
    </>
  );
}

export default Properties;
