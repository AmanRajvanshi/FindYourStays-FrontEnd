
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, Modal, SelectPicker } from 'rsuite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import { ICON_MAP, ICON_OPTIONS, ICON_FALLBACK } from '../../consonants/iconMap';
import Button from '../ui/Button';

function AmenitiesModal({
  openAmenitiesModal,
  setOpenAmenitiesModal,
  edit,
  get_all_amenities,
  amenity,
  onComplete,
}) {
  const { authData } = useContext(AuthContext);
  const [amenityName, setAmenityName] = useState('');
  const [amenityIcon, setAmenityIcon] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (edit && amenity) {
      setAmenityName(amenity.name || '');
      setAmenityIcon(amenity.icon || '');
    } else {
      setAmenityName('');
      setAmenityIcon('');
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
      icon: amenityIcon || '',
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
          if (get_all_amenities) get_all_amenities();
          setAmenityName('');
          setAmenityIcon('');
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
          if (onComplete) onComplete();
          else setOpenAmenitiesModal(false);
          if (get_all_amenities) get_all_amenities();
          setAmenityName('');
          setAmenityIcon('');
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
            <Form.Label>Amenity Name</Form.Label>
            <Input
              placeholder="Enter Amenity name"
              value={amenityName}
              onChange={(e) => setAmenityName(e)}
            />
          </Form.Group>
          <Form.Group controlId="icon">
            <Form.Label>Icon</Form.Label>
            <SelectPicker
              data={ICON_OPTIONS}
              searchable
              cleanable
              placeholder="Select an icon (optional)"
              block
              value={amenityIcon}
              onChange={(val) => setAmenityIcon(val || '')}
              renderMenuItem={(label, item) => {
                const icon = ICON_MAP[item.value] || ICON_FALLBACK;
                return (
                  <span className="flex items-center gap-3 py-1">
                    <span className="w-6 h-6 rounded-md bg-coral/10 flex items-center justify-center text-coral text-sm shrink-0">
                      <FontAwesomeIcon icon={icon} />
                    </span>
                    <span className="font-semibold text-ink text-sm">{label}</span>
                    <span className="ml-auto text-xs text-gray-400 font-mono">{item.value}</span>
                  </span>
                );
              }}
              renderValue={(value, item) => {
                const icon = ICON_MAP[value] || ICON_FALLBACK;
                return (
                  <span className="flex items-center gap-2">
                    <span className="text-coral shrink-0">
                      <FontAwesomeIcon icon={icon} />
                    </span>
                    <span>{item?.label || value}</span>
                  </span>
                );
              }}
            />
            {amenityIcon && (
              <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center text-coral text-base">
                  <FontAwesomeIcon icon={ICON_MAP[amenityIcon] || ICON_FALLBACK} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">{ICON_MAP[amenityIcon] ? amenityIcon : 'Custom Icon'}</p>
                  <p className="text-[10px] text-muted">This icon will appear on the website</p>
                </div>
              </div>
            )}
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

export default AmenitiesModal;
