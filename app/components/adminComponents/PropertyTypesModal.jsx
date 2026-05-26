import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, Modal } from 'rsuite';
import { apiUrl } from '../../../envConfig';
import { AuthContext } from '../../AuthContextProvider';

function PropertyTypesModal({
  open,
  onClose,
  edit,
  propertyType,
  get_all_property_types,
}) {
  const { authData } = useContext(AuthContext);
  const [propertyTypeName, setPropertyTypeName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (edit && propertyType) {
      setPropertyTypeName(propertyType.name || '');
    } else {
      setPropertyTypeName('');
    }
  }, [edit, propertyType, open]);

  const handleSave = () => {
    setLoading(true);
    const url = edit
      ? apiUrl + 'admin/edit-property-type/' + propertyType.id
      : apiUrl + 'admin/add-property-type';
    const method = edit ? 'PUT' : 'POST';
    const body = { name: propertyTypeName };

    fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          onClose();
          get_all_property_types();
          setPropertyTypeName('');
          toast.success(json.message);
        } else {
          toast.error(json.message);
        }
      })
      .catch((error) => {
        toast.error('An error occurred.');
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = () => {
    if (!propertyType?.id) return;
    setLoading(true);
    fetch(apiUrl + 'admin/delete-property-type/' + propertyType.id, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          onClose();
          get_all_property_types();
          setPropertyTypeName('');
          toast.success(json.message);
        } else {
          toast.error(json.message);
        }
      })
      .catch((error) => {
        toast.error('An error occurred.');
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>
        <Modal.Title>
          <strong>{edit ? 'Edit Property Type' : 'Add Property Type'}</strong>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pb-4">
        <Form.Group controlId="name">
          <Form.ControlLabel>Property Type Name</Form.ControlLabel>
          <Input
            placeholder="Enter Property Type name"
            value={propertyTypeName}
            onChange={(value) => setPropertyTypeName(value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <div
          className={`d-flex align-items-center w-100 ${
            edit ? 'justify-content-between' : 'justify-content-end'
          }`}
        >
          {edit && (
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={loading}
              type="button"
            >
              Delete
            </button>
          )}
          <button
            className="btn btn-thm"
            onClick={handleSave}
            disabled={loading}
            type="button"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default PropertyTypesModal;
