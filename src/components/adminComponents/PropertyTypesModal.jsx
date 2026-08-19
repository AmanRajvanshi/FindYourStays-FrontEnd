import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, Modal } from 'rsuite';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import Button from '../ui/Button';

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
        <Form fluid>
          <Form.Group controlId="name">
            <Form.Label>Property Type Name</Form.Label>
            <Input
              placeholder="Enter Property Type name"
              value={propertyTypeName}
              onChange={(value) => setPropertyTypeName(value)}
            />
          </Form.Group>
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
              disabled={loading}
              type="button"
            >
              Delete
            </Button>
          )}
          <Button
            appearance="primary"
            onClick={handleSave}
            disabled={loading}
            type="button"
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default PropertyTypesModal;
