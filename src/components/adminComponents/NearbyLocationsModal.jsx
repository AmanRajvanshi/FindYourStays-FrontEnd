
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, Modal } from 'rsuite';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import Swal from 'sweetalert2';
import Button from '../ui/Button';

function NearbyLocationsModal({
  openAmenitiesModal,
  setOpenAmenitiesModal,
  edit,
  get_all_nearby_locations,
  selectedNearbyLocations, // receive selectedNearbyLocations instead of 'amenity'
  onComplete,
}) {
  const { authData } = useContext(AuthContext);
  const [nearbyLocationName, setNearbyLocationName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (edit && selectedNearbyLocations) {
      setNearbyLocationName(selectedNearbyLocations.nearby_location_name || '');
    } else {
      setNearbyLocationName('');
    }
  }, [edit, selectedNearbyLocations, openAmenitiesModal]);

  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading) return;
    const trimmed = (nearbyLocationName || '').trim();
    if (!trimmed) {
      toast.error('Facility name is required');
      return;
    }
    setLoading(true);
    const url = edit
      ? `${apiUrl}admin/edit-nearby-locations/${selectedNearbyLocations.id}`
      : `${apiUrl}admin/add-nearby-locations`; // Set your API endpoints accordingly!
    const method = edit ? 'PUT' : 'POST';
    const body = {
      name: trimmed,
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
          if (onComplete) onComplete();
          else setOpenAmenitiesModal(false);
          if (get_all_nearby_locations) get_all_nearby_locations();
          setNearbyLocationName('');
          toast.success(json.message || 'Success!');
        } else {
          toast.error(json.message || 'Failed to save!');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.error('Something went wrong!');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (!result.isConfirmed) return;
      setLoading(true);
      fetch(
        `${apiUrl}admin/delete-nearby-locations/${selectedNearbyLocations.id}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authData.token,
          },
        }
      )
        .then((response) => response.json())
        .then((json) => {
          if (json.status) {
            if (onComplete) onComplete();
            else setOpenAmenitiesModal(false);
            if (get_all_nearby_locations) get_all_nearby_locations();
            setNearbyLocationName('');
            toast.success(json.message || 'Deleted!');
          } else {
            toast.error(json.message || 'Failed to delete!');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          toast.error('Something went wrong!');
        })
        .finally(() => {
          setLoading(false);
        });
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
          <strong>
            {edit ? 'Edit Nearby Facility' : 'Add Nearby Facility'}
          </strong>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pb-4">
        <Form fluid onSubmit={(e) => { e?.preventDefault(); handleSave(e); }}>
          <Form.Group controlId="name">
            <Form.Label>Nearby Facility Name</Form.Label>
            <Input
              placeholder="Enter Nearby Facility name"
              value={nearbyLocationName}
              onChange={setNearbyLocationName}
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

export default NearbyLocationsModal;
