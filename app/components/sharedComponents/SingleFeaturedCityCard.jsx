import { useEffect, useState } from 'react';
import { Modal } from 'rsuite';
import { imageUrl } from '../../../envConfig';
import { useNavigate } from 'react-router';

function SingleFeaturedCityCard({ className, city, propertyTypeList }) {
  const isComingSoon = className === 'coming-soon-city';
  const [openPropertyTypeModal, setOpenPropertyTypeModal] = useState(false);

  return (
    <>
      <div
        className="properti_city"
        onClick={() => {
          if (!isComingSoon) {
            setOpenPropertyTypeModal(true);
          }
        }}
      >
        <div className={`thumb ${className}`}>
          <img
            className="img-fluid w100"
            src={`${imageUrl}${city?.image}`}
            alt={city?.city_name}
          />

          {isComingSoon && (
            <div className="coming-soon-overlay">
              <span className="coming-soon-text">Coming Soon</span>
            </div>
          )}
        </div>
        <div className="overlay">
          <div className="details">
            <h4>{city?.city_name}</h4>
          </div>
        </div>
      </div>
      <PropertyTypeModal
        openPropertyTypeModal={openPropertyTypeModal}
        setOpenPropertyTypeModal={setOpenPropertyTypeModal}
        cityName={city}
        propertyTypeList={propertyTypeList}
      />
    </>
  );
}

function PropertyTypeModal({
  openPropertyTypeModal,
  setOpenPropertyTypeModal,
  cityName,
  propertyTypeList,
}) {
  const navigate = useNavigate();
  return (
    <Modal
      open={openPropertyTypeModal}
      onClose={() => setOpenPropertyTypeModal(false)}
      size="md"
    >
      <Modal.Body className="pt-4 pb-4 px-4 mt-0">
        <h3 className="text-center mb-4 fw-bold">
          Find the Best Spaces in{' '}
          <span className="text-thm">{cityName?.city_name}</span>
        </h3>
        <div className="d-flex justify-content-center flex-wrap gap-3">
          {propertyTypeList?.map((type) => {
            return (
              <div
                key={type.id}
                onClick={() => {
                  navigate(`/property-listing/${type.id}/${cityName?.id}`);
                }}
                className={`property-type-card text-center`}
                style={{
                  cursor: 'pointer',
                  padding: 20,
                  borderRadius: 10,
                  width: 120,
                }}
              >
                <div
                  className="icon-circle"
                  style={{ fontSize: 40, marginBottom: 10 }}
                >
                  {type.icon || '🏢'}
                </div>
                <div className="label mt-2 fw-semibold">
                  {type.name || type.label}
                </div>
              </div>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default SingleFeaturedCityCard;
