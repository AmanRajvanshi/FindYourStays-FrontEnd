import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, Modal } from 'rsuite';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import Button from '../ui/Button';

function AmenitiesModal({
  openAmenitiesModal,
  setOpenAmenitiesModal,
  edit,
  get_all_amenities,
  amenity, // Pass the amenity object when editing
}) {
  const { authData } = useContext(AuthContext);
  const [amenityName, setAmenityName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (edit && amenity) {
      setAmenityName(amenity.name || '');
    } else {
      setAmenityName('');
    }
  }, [edit, amenity, openAmenitiesModal]);

  const handleSave = () => {
    setLoading(true);
    const url = edit
      ? apiUrl + 'admin/edit-amenities/' + amenity.id
      : apiUrl + 'admin/add-amenities';
    const method = edit ? 'PUT' : 'POST';
    const body = {
      name: amenityName,
    };

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
          setOpenAmenitiesModal(false);
          get_all_amenities();
          setAmenityName('');
          toast.success(json.message);
        } else {
          toast.error(json.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = () => {
    if (!amenity?.id) return;
    setLoading(true);
    fetch(apiUrl + 'admin/delete-amenities/' + amenity.id, {
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
          setOpenAmenitiesModal(false);
          get_all_amenities();
          setAmenityName('');
          toast.success(json.message);
        } else {
          toast.error(json.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      open={openAmenitiesModal}
      onClose={() => {
        setOpenAmenitiesModal(false);
      }}
    >
      <Modal.Header>
        <Modal.Title>
          <strong>{edit ? 'Edit Amenity' : 'Add Amenity'}</strong>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pb-4">
        <Form fluid>
          <Form.Group controlId="name">
            <Form.ControlLabel>Amenity Name</Form.ControlLabel>
            <Input
              placeholder="Enter Amenity name"
              value={amenityName}
              onChange={(e) => setAmenityName(e)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <div
          className={`flex items-center w-full ${
            edit ? 'justify-between' : 'justify-end'
          }`}
        >
          {edit && (
            <Button
               appearance="primary" color="red"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          )}
          <Button
             appearance="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default AmenitiesModal;
