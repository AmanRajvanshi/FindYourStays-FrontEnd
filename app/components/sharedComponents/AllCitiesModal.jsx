import { useMemo, useState } from 'react';
import { Input, Modal } from 'rsuite';

function AllCities({
  openAllCitiesModal,
  setOpenAllCitiesModal,
  cities = [],
  loader,
  selectedCity,
  setSelectedCity,
}) {
  const [search, setSearch] = useState('');

  const filteredCities = useMemo(
    () =>
      cities.filter((city) =>
        city.city_name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, cities]
  );

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setOpenAllCitiesModal(false); // Close modal on selection
  };

  return (
    <Modal
      open={openAllCitiesModal}
      onClose={() => setOpenAllCitiesModal(false)}
      size="sm"
    >
      <Modal.Header>
        <Modal.Title>
          <strong>Select City</strong>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pb-0">
        <div className="p-0 d-flex flex-column align-items-center gap-2">
          <Input
            type="text"
            placeholder="Search City"
            value={search}
            onChange={setSearch}
            className="w-100 mb-3"
            style={{ maxWidth: 300 }}
            autoFocus
          />
          {loader ? (
            <div>Loading...</div>
          ) : filteredCities.length ? (
            <div className="d-flex justify-content-center gap-2 flex-wrap w-100">
              {filteredCities.map((city) => (
                <button
                  key={city.id || city.city_name}
                  type="button"
                  className={`btn rounded-pill shadow-sm px-3 py-1 mb-2 city-select-btn fw-semibold border border-thm ${
                    selectedCity && selectedCity.id === city.id
                      ? 'btn-thm text-white'
                      : 'btn-light text-thm'
                  }`}
                  style={{
                    minWidth: 84,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onClick={() => handleSelectCity(city)}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = '#eaf3ff')
                  }
                  onMouseOut={(e) => {
                    if (selectedCity && selectedCity.id === city.id) {
                      e.currentTarget.style.background = ''; // Or your "active" bg
                    } else {
                      e.currentTarget.style.background = '';
                    }
                  }}
                >
                  {city.city_name}
                </button>
              ))}
            </div>
          ) : (
            <div>No cities available.</div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default AllCities;
