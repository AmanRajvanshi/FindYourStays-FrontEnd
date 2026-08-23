import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Input, Pagination, SelectPicker } from 'rsuite';
import { AuthContext } from '../../AuthContextProvider';
import SinglePropertyCardAdmin from '../../components/sharedComponents/SinglePropertyCardAdmin';
import { apiUrl } from '../../envConfig';
import DataLoader from '../../components/sharedComponents/DataLoader';
import PageLayout from '../../components/sharedComponents/PageLayout';
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
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, per_page: 10, current_page: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (authData?.token) { fetchCities(); get_all_property_types(); } }, [authData]);

  useEffect(() => {
    const handler = setTimeout(() => { setSearch(searchInput); setPaginationMeta((prev) => ({ ...prev, current_page: 1 })); }, 700);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (authData?.token) fetchProperties(paginationMeta.current_page, paginationMeta.per_page);
    else if (authData && !authData.token) setLoading(false);
  }, [paginationMeta.current_page, paginationMeta.per_page, search, selectedStatus, selectedCity, selectedType, selectedPriceRange, authData]);

  const fetchCities = () => {
    fetch(`${apiUrl}admin/get-city-by-state/0`, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    }).then((r) => r.json()).then((json) => { if (json.status) setCities(json.data.map((c) => ({ value: c.id, label: c.city_name }))); });
  };

  const get_all_property_types = () => {
    fetch(apiUrl + 'admin/get-all-property-types', {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    }).then((response) => response.json())
      .then((json) => { if (json.status) setPropertyTypesList(json.data.map((s) => ({ value: s.id, label: s.name }))); })
      .catch((err) => console.log(err))
      .finally(() => fetchCities());
  };

  const fetchProperties = async (page = 1, per_page = paginationMeta.per_page) => {
    setLoading(true);
    const params = [`page=${page}`, `per_page=${per_page}`];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (selectedStatus) params.push(`status=${encodeURIComponent(selectedStatus)}`);
    if (selectedCity) params.push(`city_id=${encodeURIComponent(selectedCity)}`);
    if (selectedType) params.push(`property_type=${encodeURIComponent(selectedType)}`);
    if (selectedPriceRange) {
      const nums = selectedPriceRange.replace(/[^\d\-]/g, '').split('-');
      if (nums.length === 2) { params.push(`price_range[]=${nums[0]}`); params.push(`price_range[]=${nums[1]}`); }
    }
    try {
      const res = await fetch(`${apiUrl}admin/get-all-properties?${params.join('&')}`, { headers: { Authorization: authData.token, Accept: 'application/json' } });
      const json = await res.json();
      setProperties(json.data || []);
      setPaginationMeta({ total: json.total, per_page: json.per_page, current_page: json.current_page });
    } catch (err) { setProperties([]); setPaginationMeta((prev) => ({ ...prev, total: 0 })); }
    finally { setLoading(false); }
  };

  if (loading) return <DataLoader />;

  const hasActiveFilters = !!(searchInput || selectedStatus || selectedCity || selectedType || selectedPriceRange);
  const handleClearFilters = () => { setSearchInput(''); setSearch(''); setSelectedStatus(undefined); setSelectedCity(undefined); setSelectedType(undefined); setSelectedPriceRange(undefined); setPaginationMeta((prev) => ({ ...prev, current_page: 1 })); };

  return (
    <PageLayout
      title="Properties"
      subtitle="Manage, filter, and track your property listings."
      actionLabel="+ Add New Property"
      actionOnClick={() => navigate('/admin/add-property')}
      flush
    >
      {/* Filters */}
      <div className="bg-white rounded-xl border border-line/50 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-muted/80">Search & Filters</span>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="text-xs font-semibold text-coral hover:text-coraldark! transition-colors flex items-center gap-1.5 cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3">
            <Input type="text" placeholder="Search by title, address..." style={{ width: '100%' }}
              value={searchInput} onChange={setSearchInput} cleanable />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-2/3 lg:justify-end">
            <SelectPicker data={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Draft', value: 'draft' }, { label: 'Deleted', value: 'deleted' }]}
              placeholder="Status" style={{ width: 140 }} placement="auto" searchable={false} cleanable value={selectedStatus}
              onChange={(val) => { setSelectedStatus(val); setPaginationMeta((prev) => ({ ...prev, current_page: 1 })); }} />
            <SelectPicker data={cities} placeholder="City" style={{ width: 150 }} placement="auto" cleanable value={selectedCity}
              onChange={(val) => { setSelectedCity(val); setPaginationMeta((prev) => ({ ...prev, current_page: 1 })); }} />
            <SelectPicker data={propertyTypesList} placeholder="Property Type" style={{ width: 160 }} placement="auto" searchable={false} cleanable value={selectedType}
              onChange={(val) => { setSelectedType(val); setPaginationMeta((prev) => ({ ...prev, current_page: 1 })); }} />
            <SelectPicker data={pricingRangeOptions} placeholder="Price Range" style={{ width: 160 }} placement="auto" searchable={false} cleanable value={selectedPriceRange}
              onChange={(val) => { setSelectedPriceRange(val); setPaginationMeta((prev) => ({ ...prev, current_page: 1 })); }} />
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="flex flex-col gap-6">
        {properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="h-full">
                  <SinglePropertyCardAdmin property={property}
                    fetchProperties={() => fetchProperties(paginationMeta.current_page, paginationMeta.per_page)} />
                </div>
              ))}
            </div>
            <div className="w-full flex justify-center mt-4 pt-4 border-t border-line/30">
              <Pagination prev last next first size="sm" ellipsis total={paginationMeta.total} limit={paginationMeta.per_page}
                activePage={paginationMeta.current_page} onChangePage={(page) => setPaginationMeta((prev) => ({ ...prev, current_page: page }))} />
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-line/40 shadow-sm text-center">
            <svg className="w-12 h-12 text-muted/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-bold text-ink mb-1">No Properties Found</h3>
            <p className="text-sm text-muted max-w-sm mb-4">We couldn't find any properties matching your current criteria. Try adjusting or resetting your search filters.</p>
            {hasActiveFilters && <Button appearance="ghost" onClick={handleClearFilters}>Reset Search Filters</Button>}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default Properties;
