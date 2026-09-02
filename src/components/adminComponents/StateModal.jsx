
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Modal } from 'rsuite';
import Swal from 'sweetalert2';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import Button from '../ui/Button';

function StateModal({ openStateModal, setOpenStateModal, edit, onComplete }) {
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

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading) return;

    const trimmedStateName = (formValue.state_name || '').trim();
    if (!trimmedStateName) {
      toast.error('State name is required');
      return;
    }

    setLoading(true);

    const method = edit.editing ? 'PUT' : 'POST';
    const url = edit.editing
      ? `${apiUrl}admin/update-state/${edit.data.id}`
      : `${apiUrl}admin/add-state`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authData.token,
        },
        body: JSON.stringify({ state_name: trimmedStateName }),
      });
      const json = await res.json();

      if (res.ok && json.status) {
        if (onComplete) onComplete();
        else setOpenStateModal(false);
        toast.success(json.message || 'State saved successfully');
      } else {
        let errorMsg = json.message || 'Something went wrong. Please try again.';
        if (json.errors) {
          const firstErrKey = Object.keys(json.errors)[0];
          if (firstErrKey && Array.isArray(json.errors[firstErrKey])) {
            errorMsg = json.errors[firstErrKey][0];
          }
        }
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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
            if (onComplete) onComplete();
            else setOpenStateModal(false);
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
        <Form fluid formValue={formValue} onChange={setFormValue} onSubmit={(e) => { e?.preventDefault(); handleSubmit(e); }}>
          <Form.Group controlId="state_name">
            <Form.Label className="mb-2">State Name</Form.Label>
            <Form.Control name="state_name" placeholder="Enter State name" />
          </Form.Group>
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
              appearance="primary" color="red" className="ml-auto" size="sm"
              onClick={handleDelete}
              disabled={loading} loading={loading}
            >
              Delete
            </Button>
          )}
          <Button
            type="button"
            appearance="primary" size="sm"
            onClick={handleSubmit}
            disabled={loading} loading={loading}
          >
            Save
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default StateModal;
