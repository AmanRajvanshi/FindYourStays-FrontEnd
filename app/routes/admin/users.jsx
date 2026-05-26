import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Loader, Modal, SelectPicker, Table, TagPicker } from 'rsuite';
import { apiUrl } from '../../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';

const { Column, HeaderCell, Cell } = Table;

const roles = ['Manager', 'Support', 'Editor'].map((r) => ({
  label: r,
  value: r.toLowerCase(),
}));

const permissions = [
  'Everything',
  'Dashboard',
  'States',
  'Cities',
  'Areas',
  'Amenities',
  'Nearby Facilities',
  'Property Types',
  'Properties',
  'Property Enquiries',
  'Contact Enqueries',
  'User Listings Enquiries',
  'Blogs / Articles',
  'Testimonials',
  'Custom Pages',
  'Counters',
  'Users',
  'Company Profile',
].map((p) => ({
  label: p,
  value: p.toLowerCase().replace(/ \/ | /g, '-'),
}));

export default function UsersPage() {
  const { authData } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formValue, setFormValue] = useState({
    username: '',
    email: '',
    password: '',
    role: null,
    tags: [],
    id: null,
    loader: false,
  });
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);

  useEffect(() => {
    get_all_users();
  }, []);

  const get_all_users = () => {
    fetch(apiUrl + 'admin/get-all-users', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setUsers(json.data);
          setShowNoData(false);
        } else {
          setShowNoData(true);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSave = () => {
    const { username, email, password, role, tags, id } = formValue;

    const payload = {
      name: username,
      email,
      ...(password && { password }),
      type: role,
      routes: tags ?? [],
    };

    const url =
      editIndex !== null
        ? `${apiUrl}admin/update-users/${id}`
        : `${apiUrl}admin/add-new-user`;
    const method = editIndex !== null ? 'PUT' : 'POST';

    setFormValue((prev) => ({ ...prev, loader: true }));

    fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          toast.success(
            `User ${editIndex !== null ? 'updated' : 'added'} successfully`
          );
          get_all_users();
          setOpenModal(false);
        } else {
          toast.error(json.message || 'Something went wrong');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to save user');
      })
      .finally(() => {
        setFormValue((prev) => ({ ...prev, loader: false }));
      });
  };

  const handleOpen = (user = null, index = null) => {
    setFormValue(
      user
        ? {
            username: user.name,
            email: user.email,
            password: '',
            role: user.type,
            tags: user.routes || [],
            id: user.id,
          }
        : {
            username: '',
            email: '',
            password: '',
            role: null,
            tags: [],
            id: null,
          }
    );
    setEditIndex(index);
    setOpenModal(true);
  };

  const handleDelete = (index) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    fetch(`${apiUrl}admin/delete-users/${index}`, {
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
          toast.success('User deleted successfully');
          get_all_users();
        } else {
          toast.error(json.message || 'Failed to delete user');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Something went wrong');
      });
  };

  if (loading) return <DataLoader />;

  return (
    <>
      {showNoData ? (
        <NoDataFound
          name="Users"
          message="No users found, kindly add a new user!"
          showButton={true}
          handleClick={() => handleOpen(null)}
        />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0 text-lg font-semibold">Users</h2>
            <button
              className="btn btn-thm"
              type="button"
              onClick={() => handleOpen(null)}
            >
              + Add User
            </button>
          </div>
          <Table
            data={users}
            hover
            showHeader
            bordered
            cellBordered
            autoHeight
            rowHeight={45}
            headerHeight={40}
          >
            <Column width={80} align="center" fixed>
              <HeaderCell>S. No.</HeaderCell>
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
            <Column width={170} fixed="right">
              <HeaderCell>Actions</HeaderCell>
              <Cell>
                {(rowData, index) => (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-link"
                      onClick={() => handleOpen(rowData, index)}
                    >
                      <span className="flaticon-edit text-thm" />
                    </button>
                    <button
                      className="btn btn-link"
                      onClick={() => handleDelete(rowData.id)}
                      disabled={rowData.type === 'admin'}
                    >
                      <span className="flaticon-garbage text-danger" />
                    </button>
                  </div>
                )}
              </Cell>
            </Column>
          </Table>
        </>
      )}

      {/* Edit/Add User Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} size="sm">
        <Modal.Header>
          <Modal.Title>
            {editIndex !== null ? 'Edit User' : 'Add User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container-fluid">
            <Form
              fluid
              formValue={formValue}
              onChange={setFormValue}
              className="row"
            >
              <div className="col-lg-6 mb-3">
                <Form.Group controlId="username">
                  <Form.ControlLabel>User Name</Form.ControlLabel>
                  <Form.Control name="username" />
                </Form.Group>
              </div>
              <div className="col-lg-6 mb-3">
                <Form.Group controlId="email">
                  <Form.ControlLabel>Email</Form.ControlLabel>
                  <Form.Control name="email" type="email" />
                </Form.Group>
              </div>
              <div className="col-lg-12 mb-3">
                <Form.Group controlId="password">
                  <Form.ControlLabel>Password</Form.ControlLabel>
                  <div className="position-relative">
                    <Form.Control
                      name="password"
                      type={viewPassword ? 'text' : 'password'}
                    />
                    {viewPassword ? (
                      <i
                        className="fa fa-eye-slash custom-eye"
                        onClick={() => setViewPassword(false)}
                      ></i>
                    ) : (
                      <i
                        className="fa fa-eye custom-eye"
                        onClick={() => setViewPassword(true)}
                      ></i>
                    )}
                  </div>
                </Form.Group>
              </div>
              <div className="col-lg-12 mb-3">
                <Form.Group controlId="role">
                  <Form.ControlLabel>Role</Form.ControlLabel>
                  <SelectPicker
                    name="role"
                    value={formValue.role}
                    onChange={(value) =>
                      setFormValue((prev) => ({ ...prev, role: value }))
                    }
                    data={roles}
                    style={{ width: '100%' }}
                    placeholder="Select role"
                    placement="auto"
                  />
                </Form.Group>
              </div>
              <div className="col-lg-12">
                <Form.Group controlId="tags">
                  <Form.ControlLabel>Permissions</Form.ControlLabel>
                  <TagPicker
                    name="tags"
                    value={formValue.tags}
                    onChange={(value) =>
                      setFormValue((prev) => ({ ...prev, tags: value }))
                    }
                    data={permissions}
                    style={{ width: '100%' }}
                    placeholder="Select permissions"
                    placement="auto"
                  />
                </Form.Group>
              </div>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex align-items-center justify-content-end">
            <button
              className="btn btn-thm mr-2"
              onClick={handleSave}
              disabled={formValue.loader}
            >
              {formValue.loader ? (
                <Loader size="xs" content="Saving" />
              ) : (
                'Save'
              )}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
