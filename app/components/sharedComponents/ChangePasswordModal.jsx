import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Loader, Modal } from 'rsuite';
import { apiUrl } from '../../../envConfig';
import { AuthContext } from '../../AuthContextProvider';

function ChangePasswordModal({ userId, open, onClose, onSuccess }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const { authData } = useContext(AuthContext);

  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaveLoading(true);

    fetch(`${apiUrl}admin/change-password/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
      body: JSON.stringify({
        password: newPassword,
        password_confirmation: confirmPassword,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          toast.success('Password updated successfully');
          onSuccess?.();
          onClose();
        } else {
          toast.error(json.message || 'Failed to update password');
        }
      })
      .catch((err) => {
        toast.error('Something went wrong');
      })
      .finally(() => {
        setSaveLoading(false);
      });
  };

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <Modal.Header>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container-fluid">
          <Form fluid className="row">
            <div className="col-lg-12 mb-2">
              <Form.ControlLabel>New Password</Form.ControlLabel>
              <Form.Control
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(v) => setNewPassword(v)}
              />
            </div>
            <div className="col-lg-12 mb-2">
              <Form.ControlLabel>Confirm New Password</Form.ControlLabel>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(v) => setConfirmPassword(v)}
              />
            </div>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-thm"
          onClick={handleSave}
          disabled={saveLoading}
        >
          {saveLoading ? <Loader size="xs" content="Saving" /> : 'Save'}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ChangePasswordModal;
