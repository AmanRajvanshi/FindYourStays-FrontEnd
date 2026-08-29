
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, Modal } from 'rsuite';
import Swal from 'sweetalert2';
import { apiUrl, imageUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import Button from '../ui/Button';

function BrandModal({
  openBrandModal,
  setOpenBrandModal,
  edit,
  get_all_brands,
  brand,
}) {
  const { authData } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    operator_company_name: '',
    contact_no: '',
    address: '',
    operator_brand_name: '',
    email: '',
    alternate_number: '',
    logo: null,
    remove_logo: false,
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (edit && brand) {
      setFormData({
        operator_company_name: brand.operator_company_name || '',
        contact_no: brand.contact_no || '',
        address: brand.address || '',
        operator_brand_name: brand.operator_brand_name || '',
        email: brand.email || '',
        alternate_number: brand.alternate_number || '',
        logo: null,
        remove_logo: false,
      });
      if (brand.logo) {
        setPreviewImage(`${imageUrl}${brand.logo}`);
      } else {
        setPreviewImage(null);
      }
    } else {
      setFormData({
        operator_company_name: '',
        contact_no: '',
        address: '',
        operator_brand_name: '',
        email: '',
        alternate_number: '',
        logo: null,
        remove_logo: false,
      });
      setPreviewImage(null);
    }
  }, [edit, brand, openBrandModal]);

  const handleChange = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file, remove_logo: false }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, logo: null, remove_logo: true }));
    setPreviewImage(null);
  };

  const handleSave = () => {
    if (!formData.operator_company_name.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!formData.operator_brand_name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    setLoading(true);
    const url = edit
      ? apiUrl + 'admin/update-brand/' + brand.id
      : apiUrl + 'admin/add-brand';
    const method = 'POST'; // We use POST for multipart upload in Laravel

    const postData = new FormData();
    postData.append('operator_company_name', formData.operator_company_name);
    postData.append('operator_brand_name', formData.operator_brand_name);
    if (formData.contact_no) postData.append('contact_no', formData.contact_no);
    if (formData.email) postData.append('email', formData.email);
    if (formData.address) postData.append('address', formData.address);
    if (formData.alternate_number) postData.append('alternate_number', formData.alternate_number);
    
    if (formData.logo) {
      postData.append('logo', formData.logo);
    }
    if (formData.remove_logo) {
      postData.append('remove_logo', '1');
    }

    fetch(url, {
      method,
      headers: {
        Authorization: authData.token,
      },
      body: postData,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          setOpenBrandModal(false);
          get_all_brands();
          toast.success(json.message);
        } else {
          toast.error(json.message || "Something went wrong.");
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.error("Request failed.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = () => {
    if (!brand?.id) return;
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        fetch(apiUrl + 'admin/delete-brand/' + brand.id, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authData.token,
          },
        })
          .then((response) => response.json())
          .then((json) => {
            if (json.success) {
              setOpenBrandModal(false);
              get_all_brands();
              toast.success(json.message);
            } else {
              toast.error(json.message || "Failed to delete.");
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            toast.error("Request failed.");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  return (
    <Modal
      open={openBrandModal}
      onClose={() => {
        setOpenBrandModal(false);
      }}
      size="md"
    >
      <Modal.Header>
        <Modal.Title>
          <strong>{edit ? 'Edit Brand' : 'Add Brand'}</strong>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pb-4">
        <Form fluid>
          <div className="flex flex-col gap-4 w-full">
            {/* Logo Upload Section */}
            <div className="w-full">
              <Form.Group>
                <Form.Label>Brand Logo</Form.Label>
                <label htmlFor="brandLogo" className="customUploader">
                  {previewImage ? (
                    <div
                      className="previewImage"
                      style={{ position: 'relative' }}
                    >
                      <img
                        src={previewImage}
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          padding: '10px'
                        }}
                      />
                      <button
                        type="button"
                        className="cancelButton"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeImage();
                        }}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: 'rgba(255,255,255,0.8)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '25px',
                          height: '25px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[150px] border-2 border-dashed border-line rounded-xl bg-section hover:bg-coral/5 transition-colors cursor-pointer text-muted">
                      <svg className="w-8 h-8 mb-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span className="text-sm font-medium text-muted">Click to upload brand logo</span>
                    </div>
                  )}
                </label>
                <input
                  id="brandLogo"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </Form.Group>
            </div>

            {/* Form Fields Section */}
            <div className="w-full">
              <Form.Group controlId="operator_company_name">
                <Form.Label>Operator Company Name *</Form.Label>
                <Input
                  name="operator_company_name"
                  placeholder="Enter Operator Company Name"
                  value={formData.operator_company_name}
                  onChange={(value) => handleChange(value, 'operator_company_name')}
                />
              </Form.Group>
              <Form.Group controlId="operator_brand_name">
                <Form.Label>Operator Brand Name *</Form.Label>
                <Input
                  name="operator_brand_name"
                  placeholder="Enter Operator Brand Name"
                  value={formData.operator_brand_name}
                  onChange={(value) => handleChange(value, 'operator_brand_name')}
                />
              </Form.Group>
              <Form.Group controlId="contact_no">
                <Form.Label>Contact No</Form.Label>
                <Input
                  name="contact_no"
                  placeholder="Enter Contact No"
                  value={formData.contact_no}
                  onChange={(value) => handleChange(value, 'contact_no')}
                />
              </Form.Group>
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={(value) => handleChange(value, 'email')}
                />
              </Form.Group>
              <Form.Group controlId="address">
                <Form.Label>Address</Form.Label>
                <Input
                  name="address"
                  as="textarea"
                  rows={3}
                  placeholder="Enter Address"
                  value={formData.address}
                  onChange={(value) => handleChange(value, 'address')}
                />
              </Form.Group>
              <Form.Group controlId="alternate_number">
                <Form.Label>Alternate Number</Form.Label>
                <Input
                  name="alternate_number"
                  placeholder="Enter Alternate Number"
                  value={formData.alternate_number}
                  onChange={(value) => handleChange(value, 'alternate_number')}
                />
              </Form.Group>
            </div>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <div
          className={`flex items-center w-full ${edit ? 'justify-between' : 'justify-end'
            }`}
        >
          {edit && (
            <Button
              appearance="primary" color="red"
              onClick={handleDelete}
              disabled={loading} loading={loading}
            >
              Delete
            </Button>
          )}
          <Button
            appearance="primary"
            onClick={handleSave}
            disabled={loading} loading={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default BrandModal;
