import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Modal } from 'rsuite';
import Swal from 'sweetalert2';
import { apiUrl } from '../../../envConfig';
import { AuthContext } from '../../AuthContextProvider';

function StateModal({ openStateModal, setOpenStateModal, edit }) {
  const { authData } = useContext(AuthContext);
  const [formValue, setFormValue] = useState({ state_name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (edit.editing && edit.data) {
      setFormValue({ state_name: edit.data.state_name });
    } else {
      setFormValue({ state_name: '' });
    }
  }, [edit]);

  const handleSubmit = () => {
    setLoading(true);

    const method = edit.editing ? 'PUT' : 'POST';
    const url = edit.editing
      ? `${apiUrl}admin/update-state/${edit.data.id}`
      : `${apiUrl}admin/add-state`;

    fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
      body: JSON.stringify(formValue),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          setOpenStateModal(false);
          toast.success(json.message);
        } else {
          toast.error(json.message);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      setLoading(true);
      fetch(`${apiUrl}admin/delete-state/${edit.data.id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authData.token,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.status) {
            setOpenStateModal(false);
            toast.success(json.message);
          } else {
            toast.error(json.message);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    });
  };

  return (
    <Modal open={openStateModal} onClose={() => setOpenStateModal(false)}>
      <Modal.Header>
        <Modal.Title>{edit.editing ? 'Edit State' : 'Add State'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="container">
          <Form fluid formValue={formValue} onChange={setFormValue}>
            <Form.Group controlId="state_name">
              <Form.ControlLabel>State Name</Form.ControlLabel>
              <Form.Control name="state_name" placeholder="Enter State name" />
            </Form.Group>
          </Form>
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
              className="btn btn-danger btn-sm me-auto"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </button>
          )}
          <button
            type="button"
            className="btn btn-thm btn-sm"
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

export default StateModal;
