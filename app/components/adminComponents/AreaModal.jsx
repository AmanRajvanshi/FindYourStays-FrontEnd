import { useEffect, useState } from 'react';
import { Form, Input, Modal, SelectPicker, Uploader } from 'rsuite';
import { apiUrl } from '../../../envConfig';
import Swal from 'sweetalert2';

function AreaModal({
  openAreaModal,
  setOpenAreaModal,
  edit,
  setAreaData,
  token,
  stateList,
}) {
  const { editing, data } = edit || {};

  const [formValue, setFormValue] = useState({
    area_name: '',
    state_id: null,
    city_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [cityList, setCityList] = useState([]);

  // Fetch state list on mount or edit change
  useEffect(() => {
    if (editing && data) {
      setFormValue({
        area_name: data.area_name,
        state_id: data.state_id,
        city_id: data.city_id,
      });
      if (data.state_id) fetchCities(data.state_id, data.city_id);
    } else {
      setFormValue({
        area_name: '',
        state_id: null,
        city_id: null,
      });
      setCityList([]);
    }
    // eslint-disable-next-line
  }, [edit]);

  // Fetch cities when state changes
  useEffect(() => {
    if (formValue.state_id) {
      fetchCities(formValue.state_id);
      setFormValue((prev) => ({ ...prev, city_id: null }));
    } else {
      setCityList([]);
      setFormValue((prev) => ({ ...prev, city_id: null }));
    }
    // eslint-disable-next-line
  }, [formValue.state_id]);

  const fetchCities = (stateId, currentCityId = null) => {
    fetch(`${apiUrl}admin/get-city-by-state/${stateId}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status && json.data.length) {
          const options = json.data.map((c) => ({
            label: c.city_name,
            value: c.id,
          }));
          setCityList(options);
          // If editing, set city_id so city is pre-selected
          if (currentCityId) {
            setFormValue((prev) => ({ ...prev, city_id: currentCityId }));
          }
        } else {
          setCityList([]);
        }
      });
  };

  // Form submit handler
  const handleSubmit = async () => {
    setLoading(true);
    const method = edit.editing ? 'POST' : 'POST';
    const url = edit.editing
      ? `${apiUrl}admin/update-area/${edit.data.id}`
      : `${apiUrl}admin/add-area`;

    const formData = new FormData();
    formData.append('area_name', formValue.area_name);
    formData.append('state_id', formValue.state_id);
    formData.append('city_id', formValue.city_id);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: token,
        },
        body: formData,
      });
      const json = await res.json();
      if (json.status) {
        setAreaData((prev) => {
          if (edit.editing) {
            return prev.map((a) => (a.id === json.data.id ? json.data : a));
          }
          return [...prev, json.data];
        });
        setOpenAreaModal(false);
      } else {
        alert('Failed to save area');
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete area handler (optional)
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
        const res = await fetch(`${apiUrl}admin/delete-area/${edit.data.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: token,
          },
        });
        const json = await res.json();
        if (json.status) {
          setAreaData((prev) => prev.filter((a) => a.id !== edit.data.id));
          setOpenAreaModal(false);
        } else {
          alert('Delete failed');
        }
      } catch (err) {
        console.error('Delete error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal open={openAreaModal} onClose={() => setOpenAreaModal(false)}>
      <Modal.Header>
        <Modal.Title>{edit.editing ? 'Edit Area' : 'Add Area'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="row gx-3 gy-2">
            <div className="col-md-6">
              <Form.Group controlId="selectState">
                <Form.ControlLabel>Select State</Form.ControlLabel>
                <SelectPicker
                  data={stateList}
                  value={formValue.state_id}
                  onChange={(value) =>
                    setFormValue((prev) => ({ ...prev, state_id: value }))
                  }
                  style={{ width: '100%' }}
                  placeholder="Select a state"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="selectCity">
                <Form.ControlLabel>Select City</Form.ControlLabel>
                <SelectPicker
                  data={cityList}
                  value={formValue.city_id}
                  onChange={(value) =>
                    setFormValue((prev) => ({ ...prev, city_id: value }))
                  }
                  style={{ width: '100%' }}
                  placeholder="Select a city"
                  disabled={!formValue.state_id}
                />
              </Form.Group>
            </div>
            <div className="col-md-12 mt-2">
              <Form.Group controlId="areaName">
                <Form.ControlLabel>Area Name</Form.ControlLabel>
                <Input
                  placeholder="Enter area name"
                  value={formValue.area_name}
                  onChange={(value) =>
                    setFormValue((prev) => ({ ...prev, area_name: value }))
                  }
                />
              </Form.Group>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div
          className={`d-flex align-items-center w-100 ${
            edit.editing ? 'justify-content-between' : 'justify-content-end'
          }`}
        >
          {edit.editing && (
            <button
              type="button"
              className="btn btn-danger me-auto"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </button>
          )}
          <button
            type="button"
            className="btn btn-thm"
            onClick={handleSubmit}
            disabled={loading}
          >
            Save
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default AreaModal;
