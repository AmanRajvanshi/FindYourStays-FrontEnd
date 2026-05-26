import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation } from 'react-router';
import { Form, Input, Loader, Modal, SelectPicker } from 'rsuite';
import { apiUrl } from '../../../envConfig';

function Header() {
  const location = useLocation();
  const [openCreateListing, setOpenCreateListing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [propertyTypeList, setPropertyTypeList] = useState([]);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    property_type: '',
    message: '',
    loader: false,
  });

  // 🔄 Auto-close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
    setOpenDropdown(null);
    get_all_property_types();
  }, [location]);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const get_all_property_types = () => {
    fetch(apiUrl + 'website/get-all-property-types', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setPropertyTypeList(json.data);
        } else {
          setPropertyTypeList([]);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {});
  };

  const addUserCreateListing = () => {
    setFormValues({ ...formValues, loader: true });
    fetch(apiUrl + 'website/add-user-create-listing', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formValues),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setOpenCreateListing(false);
          setFormValues({
            name: '',
            email: '',
            phone: '',
            property_type: '',
            message: '',
            loader: false,
          });
          toast.success(json.message);
        } else {
          setFormValues({ ...formValues, loader: false });
          toast.error(json.message);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setFormValues({ ...formValues, loader: false });
      });
  };

  const typeList = propertyTypeList.map((s) => ({
    value: s.name,
    label: s.name,
  }));

  return (
    <>
      {/* ✅ Desktop Header (Same as before) */}
      <header className="header-nav menu_style_home_one style2 home3 main-menu w-100 sticky-top">
        <div className="container-fluid p0">
          <nav className="d-flex align-items-center justify-content-between">
            <Link to="/" className="navbar_brand float-left dn-smd">
              <img
                className="logo1 img-fluid"
                src="/logos/full_logo.png"
                alt="header-logo.png"
              />
            </Link>
            <ul
              id="respMenu"
              className="ace-responsive-menu text-right"
              data-menu-style="horizontal"
            >
              {/* <li>
                <Link to="/">
                  <span className="title">Home</span>
                </Link>
              </li> */}
              {propertyTypeList.length > 0 &&
                propertyTypeList.map((propertyType, index) => (
                  <li key={propertyType.id}>
                    <Link
                      to={`/property-listing/${propertyType.id}/0`}
                      onClick={() => toggleDropdown(index)}
                    >
                      <span className="title">{propertyType.name}</span>
                    </Link>
                  </li>
                ))}

              <li
                className="list-inline-item add_listing home2"
                onClick={() => setOpenCreateListing(true)}
              >
                <a className="dn-lg p-0 m-0">Create Listing</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* ✅ Mobile Header */}
      <div className="mobile-side-header">
        <div className="mobile-topbar">
          <Link to="/" className="mobile-logo">
            <img src="/logos/full_logo.png" alt="logo" />
          </Link>
          <i
            className="fa fa-bars hamburger"
            onClick={() => setDrawerOpen(true)}
          />
        </div>

        <div
          className={`drawer-overlay ${drawerOpen ? 'open' : ''}`}
          onClick={() => setDrawerOpen(false)}
        />
        <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
          <i
            className="fa fa-times close-drawer"
            onClick={() => setDrawerOpen(false)}
          ></i>
          <nav className="drawer-nav">
            <ul>
              {/* <li>
                <Link to="/">Home</Link>
              </li> */}
              {propertyTypeList.length > 0 &&
                propertyTypeList.map((propertyType, index) => (
                  <li key={propertyType.id}>
                    <Link to={`/property-listing/${propertyType.id}/0`}>
                      {propertyType.name}
                    </Link>
                  </li>
                ))}
              <li onClick={() => setOpenCreateListing(true)}>
                <a className="btn-create m-0">Create Listing</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <Modal
        open={openCreateListing}
        onClose={() => setOpenCreateListing(false)}
        size="md"
      >
        <Modal.Header>
          <Modal.Title>
            <div className="text-center">
              <h3 className="mb-2">Want to list your property?</h3>
              <p className="text-muted mb-0">
                Get in touch with us and start listing your property today.
              </p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container-fluid">
            <Form fluid>
              <div className="row g-3">
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="name">
                    <Form.ControlLabel className="fw-semibold">
                      Full Name
                      <span className="text-danger ms-1">*</span>
                    </Form.ControlLabel>
                    <Form.Control
                      name="name"
                      placeholder="Enter your full name"
                      value={formValues.name}
                      onChange={(e) => {
                        setFormValues({ ...formValues, name: e });
                      }}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="email">
                    <Form.ControlLabel className="fw-semibold">
                      Email Address
                      <span className="text-danger ms-1">*</span>
                    </Form.ControlLabel>
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formValues.email}
                      onChange={(e) => {
                        setFormValues({ ...formValues, email: e });
                      }}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="phone">
                    <Form.ControlLabel className="fw-semibold">
                      Phone Number
                      <span className="text-danger ms-1">*</span>
                    </Form.ControlLabel>
                    <Form.Control
                      name="phone"
                      placeholder="Enter 10-digit phone number"
                      value={formValues.phone}
                      onChange={(e) => {
                        setFormValues({ ...formValues, phone: e });
                      }}
                      maxLength={10}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="type">
                    <Form.ControlLabel className="fw-semibold">
                      Property Type
                      <span className="text-danger ms-1">*</span>
                    </Form.ControlLabel>
                    <SelectPicker
                      name="type"
                      data={typeList}
                      value={formValues.property_type}
                      onChange={(e) => {
                        setFormValues({ ...formValues, property_type: e });
                      }}
                      placeholder="Select property type"
                      searchable={false}
                      style={{ width: '100%' }}
                      cleanable={false}
                    />
                  </Form.Group>
                </div>
                <div className="col-12 mb-3">
                  <Form.Group controlId="message">
                    <Form.ControlLabel className="fw-semibold">
                      Additional Information
                    </Form.ControlLabel>
                    <Input
                      name="message"
                      as="textarea"
                      rows={4}
                      value={formValues.message}
                      onChange={(e) => {
                        setFormValues({ ...formValues, message: e });
                      }}
                      placeholder="Tell us about your property, location, amenities, expected rent, etc."
                      style={{ resize: 'vertical' }}
                    />
                  </Form.Group>
                </div>
                <div className="col-12 d-flex justify-content-center align-items-center flex-column">
                  <button
                    type="submit"
                    className="btn btn-thm btn-sm fw-semibold"
                    disabled={formValues.loader}
                    onClick={(e) => {
                      e.preventDefault();
                      addUserCreateListing();
                    }}
                    style={{
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {formValues.loader ? (
                      <Loader content="Submitting your request..." />
                    ) : (
                      'Submit Listing Request'
                    )}
                  </button>
                  <div className="text-center">
                    <small className="text-muted">
                      We'll contact you within 24 hours to discuss your property
                      listing
                    </small>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Header;
