import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, Modal, SelectPicker } from 'rsuite';
import Swal from 'sweetalert2';
import { apiUrl, imageUrl } from '../../envConfig';
import Button from '../ui/Button';

function CityModal({
  openCityModal,
  setOpenCityModal,
  edit,
  setCityData,
  token,
  stateList,
}) {
  const [formValue, setFormValue] = useState({
    city_name: '',
    state_id: null,
    image: null,
    is_main: false,
    status: 'active', // Add status field
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (edit?.editing && edit.data) {
      setFormValue({
        city_name: edit.data.city_name || '',
        state_id: edit.data.state_id || null,
        image: null,
        is_main: edit.data.is_main === '1' || edit.data.is_main === 1, // Handle string/number conversion
        status: edit.data.status || 'active',
      });

      // Set preview image if editing and image exists
      if (edit.data.image) {
        setPreviewImage(
          `${apiUrl.replace('/api/', '/')}storage/${edit.data.image}`
        );
      } else {
        setPreviewImage(null);
      }
    } else {
      setFormValue({
        city_name: '',
        state_id: null,
        image: null,
        is_main: false,
        status: 'active',
      });
      setPreviewImage(null);
    }
  }, [edit]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormValue((prev) => ({ ...prev, image: file }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormValue((prev) => ({ ...prev, image: null }));
    setPreviewImage(
      edit?.editing && edit.data?.image
        ? `${apiUrl.replace('/api/', '/')}storage/${edit.data.image}`
        : null
    );
  };

  const handleSubmit = async () => {
    console.log('formValue', formValue);
    // Basic validation
    if (!formValue.city_name.trim()) {
      toast.error('City name is required');
      return;
    }
    if (!formValue.state_id) {
      toast.error('State selection is required');
      return;
    }

    setLoading(true);
    const url = edit.editing
      ? `${apiUrl}admin/update-city/${edit.data.id}`
      : `${apiUrl}admin/add-city`;

    const formData = new FormData();
    formData.append('city_name', formValue.city_name);
    formData.append('state_id', formValue.state_id);
    formData.append('is_main', formValue.is_main === true ? '1' : '0');
    formData.append('status', formValue.status); // Add status to form data

    if (formValue.image) {
      formData.append('image', formValue.image);
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: token,
        },
        body: formData,
      });
      const json = await res.json();

      if (json.status) {
        setCityData((prev) => {
          if (edit.editing) {
            return prev.map((c) => (c.id === json.data.id ? json.data : c));
          }
          return [...prev, json.data];
        });

        toast.success(json.message || 'City saved successfully');
        setOpenCityModal(false);
      } else {
        toast.error(json.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Save failed:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}admin/delete-city/${edit.data.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: token,
          },
        });
        const json = await res.json();

        if (json.status) {
          setCityData((prev) => prev.filter((c) => c.id !== edit.data.id));
          toast.success(json.message || 'City deleted successfully');
          setOpenCityModal(false);
        } else {
          toast.error(
            json.message || 'Something went wrong. Please try again.'
          );
        }
      } catch (err) {
        console.error('Delete error:', err);
        toast.error('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      open={openCityModal}
      onClose={() => setOpenCityModal(false)}
      size="md"
    >
      <Modal.Header>
        <Modal.Title>{edit.editing ? 'Edit City' : 'Add City'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form fluid>
          <div className="flex flex-col gap-4 w-full">
            {/* Image Upload Section */}
            <div className="w-full">
              <Form.Group>
                <Form.Label>City Image</Form.Label>
                <label htmlFor="cityImage" className="customUploader">
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
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
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
                    <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed border-line rounded-xl bg-section hover:bg-coral/5 transition-colors cursor-pointer text-muted">
                      <svg className="w-8 h-8 mb-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span className="text-sm font-medium text-muted">Click to upload city image</span>
                    </div>
                  )}
                </label>
                <input
                  id="cityImage"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </Form.Group>
            </div>

            {/* Form Fields Section */}
            <div className="w-full">
              <div className="flex flex-col gap-4">
                <div className="w-full">
                  <Form.Group controlId="cityName">
                    <Form.Label>City Name *</Form.Label>
                    <Input
                      placeholder="Enter city name"
                      value={formValue.city_name}
                      onChange={(value) =>
                        setFormValue((prev) => ({ ...prev, city_name: value }))
                      }
                    />
                  </Form.Group>
                </div>
                <div className="w-full">
                  <Form.Group controlId="selectState">
                    <Form.Label>Select State *</Form.Label>
                    <SelectPicker
                      data={stateList}
                      value={formValue.state_id}
                      onChange={(value) =>
                        setFormValue((prev) => ({ ...prev, state_id: value }))
                      }
                      style={{ width: '100%' }}
                      className="w-full"
                      placeholder="Select a state"
                      cleanable={false}
                      block
                    />
                  </Form.Group>
                </div>

                <div className="w-full">
                  <Form.Group controlId="isMain">
                    <Form.Label>Main City</Form.Label>
                    <SelectPicker
                      data={[{ label: 'No', value: false }, { label: 'Yes', value: true },]}
                      value={formValue.is_main}
                      onChange={(value) =>
                        setFormValue((prev) => ({ ...prev, is_main: value }))
                      }
                      style={{ width: '100%' }}
                      className="w-full"
                      cleanable={false}
                      block
                    />
                  </Form.Group>
                </div>

                <div className="w-full">
                  <Form.Group controlId="status">
                    <Form.Label>Status</Form.Label>
                    <SelectPicker
                      data={[
                        { label: 'Active', value: 'active' },
                        { label: 'Coming Soon', value: 'coming-soon' },
                      ]}
                      value={formValue.status}
                      onChange={(value) =>
                        setFormValue((prev) => ({ ...prev, status: value }))
                      }
                      style={{ width: '100%' }}
                      className="w-full"
                      cleanable={false}
                      block
                    />
                  </Form.Group>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <div
          className={`flex items-center w-full ${edit.editing ? 'justify-between' : 'justify-end'
            }`}
        >
          {edit.editing && (
            <Button
              type="button"
              appearance="primary" color="red" className="ml-auto"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              appearance="ghost"
              onClick={() => setOpenCityModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              appearance="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default CityModal;
