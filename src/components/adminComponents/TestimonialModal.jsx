
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, Modal } from 'rsuite';
import { apiUrl, imageUrl } from '../../envConfig';
import Button from '../ui/Button';

function TestimonialModal({
  open,
  setOpen,
  edit = false,
  initialData = {},
  authToken,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    rating: '',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (edit && initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        rating: initialData.rating || '',
        image: null,
      });
      setPreviewImage(initialData.image ? imageUrl + initialData.image : null);
    } else {
      setFormData({ name: '', description: '', rating: '', image: null });
      setPreviewImage(null);
    }
  }, [initialData, edit]);

  const handleInputChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('rating', formData.rating);
    if (formData.image && formData.image instanceof File) {
      data.append('image', formData.image);
    }

    const url = edit
      ? `${apiUrl}admin/update-testimonial/${initialData.id}`
      : `${apiUrl}admin/add-testimonial`;

    if (edit) {
      data.append('_method', 'PUT'); // Laravel method spoofing
    }

    fetch(url, {
      method: 'POST', // always POST
      headers: { Authorization: authToken },
      body: data,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          toast.success(edit ? 'Testimonial updated!' : 'Testimonial added!');
          onSuccess();
          setOpen(false);
        } else {
          toast.error(json.message || 'Failed to save.');
        }
      })
      .catch(() => toast.error('An error occurred.'))
      .finally(() => setLoading(false));
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Modal.Header>
        <Modal.Title>{edit ? 'Edit' : 'Add'} Testimonial</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form fluid>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Input
              value={formData.name}
              onChange={(value) => handleInputChange(value, 'name')}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Input
              as="textarea"
              rows={4}
              value={formData.description}
              onChange={(value) => handleInputChange(value, 'description')}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Rating (1‑5)</Form.Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={formData.rating}
              onChange={(value) => handleInputChange(value, 'rating')}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Image</Form.Label>
            <label htmlFor="testimonialImage" className="customUploader">
              {previewImage ? (
                <div className="previewImage">
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <button
                    type="button"
                    className="cancelButton"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFormData((prev) => ({ ...prev, image: null }));
                      setPreviewImage(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span>Click to upload</span>
              )}
            </label>
            <input
              id="testimonialImage"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          appearance="primary" size="sm"
          onClick={handleSubmit}
          disabled={loading} loading={loading}
        >
          {loading ? 'Saving...' : edit ? 'Update' : 'Add'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TestimonialModal;
