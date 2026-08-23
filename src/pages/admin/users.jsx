import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Loader, Modal, SelectPicker, TagPicker } from 'rsuite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import PageLayout from '../../components/sharedComponents/PageLayout';
import DataTable, { Column, HeaderCell, Cell } from '../../components/sharedComponents/DataTable';
import Button from '../../components/ui/Button';

const roles = ['Manager', 'Support', 'Editor'].map((r) => ({ label: r, value: r.toLowerCase() }));
const permissions = [
  'Everything', 'Dashboard', 'States', 'Cities', 'Areas', 'Amenities', 'Nearby Facilities',
  'Property Types', 'Properties', 'Property Enquiries', 'Contact Enqueries',
  'User Listings Enquiries', 'Blogs / Articles', 'Testimonials', 'Custom Pages', 'Counters', 'Users', 'Company Profile',
].map((p) => ({ label: p, value: p.toLowerCase().replace(/ \/ | /g, '-') }));

export default function UsersPage() {
  const { authData } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formValue, setFormValue] = useState({ username: '', email: '', password: '', role: null, tags: [], id: null, loader: false });
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);

  useEffect(() => { get_all_users(); }, []);

  const get_all_users = () => {
    fetch(apiUrl + 'admin/get-all-users', {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    })
      .then((response) => response.json())
      .then((json) => { if (json.status) { setUsers(json.data); setShowNoData(false); } else { setShowNoData(true); } })
      .catch((error) => console.error('Error:', error))
      .finally(() => setLoading(false));
  };

  const handleSave = () => {
    const { username, email, password, role, tags, id } = formValue;
    const payload = { name: username, email, ...(password && { password }), type: role, routes: tags ?? [] };
    const url = editIndex !== null ? `${apiUrl}admin/update-users/${id}` : `${apiUrl}admin/add-new-user`;
    const method = editIndex !== null ? 'PUT' : 'POST';
    setFormValue((prev) => ({ ...prev, loader: true }));

    fetch(url, {
      method, headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) { toast.success(`User ${editIndex !== null ? 'updated' : 'added'} successfully`); get_all_users(); setOpenModal(false); }
        else { toast.error(json.message || 'Something went wrong'); }
      })
      .catch((err) => { console.error(err); toast.error('Failed to save user'); })
      .finally(() => setFormValue((prev) => ({ ...prev, loader: false })));
  };

  const handleOpen = (user = null, index = null) => {
    setFormValue(user
      ? { username: user.name, email: user.email, password: '', role: user.type, tags: user.routes || [], id: user.id }
      : { username: '', email: '', password: '', role: null, tags: [], id: null });
    setEditIndex(index);
    setOpenModal(true);
  };

  const handleDelete = (index) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    fetch(`${apiUrl}admin/delete-users/${index}`, {
      method: 'DELETE', headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    })
      .then((res) => res.json())
      .then((json) => { if (json.status) { toast.success('User deleted successfully'); get_all_users(); } else { toast.error(json.message || 'Failed to delete user'); } })
      .catch((err) => { console.error(err); toast.error('Something went wrong'); });
  };

  if (loading) return <DataLoader />;

  return (
    <>
      {showNoData ? (
        <NoDataFound name="Users" message="No users found, kindly add a new user!" showButton={true} handleClick={() => handleOpen(null)} />
      ) : (
        <PageLayout
          title="Users"
          subtitle="Manage system administrators, editors, and support personnel."
          actionLabel="+ Add User"
          actionOnClick={() => handleOpen(null)}
        >
          <DataTable data={users}>
            <Column width={60} align="center">
              <HeaderCell>#</HeaderCell>
              <Cell>{(_, index) => index + 1}</Cell>
            </Column>
            <Column flexGrow={1}>
              <HeaderCell>User Name</HeaderCell>
              <Cell className="text-capitalize" dataKey="name" />
            </Column>
            <Column flexGrow={2}>
              <HeaderCell>Email</HeaderCell>
              <Cell dataKey="email" />
            </Column>
            <Column flexGrow={1}>
              <HeaderCell>Role</HeaderCell>
              <Cell className="text-capitalize" dataKey="type" />
            </Column>
            <Column flexGrow={2}>
              <HeaderCell>Permissions</HeaderCell>
              <Cell>{(rowData) => rowData.routes?.join(', ') || '-'}</Cell>
            </Column>
            <Column width={120} align="center">
              <HeaderCell>Actions</HeaderCell>
              <Cell>
                {(rowData, index) => (
                  <div className="flex gap-1.5 justify-center">
                    <Button appearance="subtle" size="xs" onClick={() => handleOpen(rowData, index)}>
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </Button>
                    <Button appearance="subtle" color="red" size="xs" onClick={() => handleDelete(rowData.id)} disabled={rowData.type === 'admin'}>
                      <FontAwesomeIcon icon={faTrashCan} />
                    </Button>
                  </div>
                )}
              </Cell>
            </Column>
          </DataTable>
        </PageLayout>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)} size="sm">
        <Modal.Header className="border-b border-line pb-3">
          <Modal.Title className="text-xl font-bold text-ink">
            {editIndex !== null ? 'Edit User Profile' : 'Create New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid formValue={formValue} onChange={setFormValue} className="flex flex-col gap-6">
            <div style={{ width: '100%' }}>
              <h6 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">Profile Information</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Group controlId="username" className="mb-0">
                  <Form.Label className="text-xs font-semibold text-muted mb-1.5 block">User Name <span className="text-red-500">*</span></Form.Label>
                  <Form.Control name="username" placeholder="Enter username" />
                </Form.Group>
                <Form.Group controlId="email" className="mb-0">
                  <Form.Label className="text-xs font-semibold text-muted mb-1.5 block">Email Address <span className="text-red-500">*</span></Form.Label>
                  <Form.Control name="email" type="email" placeholder="name@example.com" />
                </Form.Group>
              </div>
            </div>

            <div className="border-t border-line pt-4" style={{ width: '100%' }}>
              <h6 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">Security</h6>
              <Form.Group controlId="password" className="mb-0">
                <Form.Label className="text-xs font-semibold text-muted mb-1.5 block">
                  Password {editIndex === null && <span className="text-red-500">*</span>}
                </Form.Label>
                <div className="relative">
                  <Form.Control name="password" type={viewPassword ? 'text' : 'password'}
                    placeholder={editIndex !== null ? 'Leave blank to keep current' : 'Enter password'} style={{ width: '100%' }} />
                  <FontAwesomeIcon
                    icon={viewPassword ? faEyeSlash : faEye}
                    className="custom-eye text-muted hover:text-coral transition-colors"
                    onClick={() => setViewPassword(!viewPassword)}
                  />
                </div>
              </Form.Group>
            </div>

            <div className="border-t border-line pt-4" style={{ width: '100%' }}>
              <h6 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">Access & Permissions</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Group controlId="role" className="mb-0">
                  <Form.Label className="text-xs font-semibold text-muted mb-1.5 block">Role <span className="text-red-500">*</span></Form.Label>
                  <SelectPicker name="role" value={formValue.role}
                    onChange={(value) => setFormValue((prev) => ({ ...prev, role: value }))}
                    data={roles} placeholder="Select user role" placement="auto" style={{ width: '100%' }} />
                </Form.Group>
                <Form.Group controlId="tags" className="mb-0">
                  <Form.Label className="text-xs font-semibold text-muted mb-1.5 block">Permissions <span className="text-red-500">*</span></Form.Label>
                  <TagPicker name="tags" value={formValue.tags}
                    onChange={(value) => setFormValue((prev) => ({ ...prev, tags: value }))}
                    data={permissions} placeholder="Select permissions" placement="auto" style={{ width: '100%' }} />
                </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-t border-line pt-3">
          <div className="flex items-center justify-end gap-2.5">
            <Button appearance="subtle" onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button appearance="primary" onClick={handleSave} disabled={formValue.loader}>
              {formValue.loader ? <Loader size="xs" content="Saving..." /> : 'Save Changes'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
