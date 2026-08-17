import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Input, Table, IconButton } from 'rsuite';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import DataLoader from '../../components/sharedComponents/DataLoader';
import Button from '../../components/ui/Button';

const { Column, HeaderCell, Cell } = Table;

export default function Counters() {
  const { authData } = useContext(AuthContext);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [newCounter, setNewCounter] = useState({
    counter_title: '',
    count: '',
  });
  const rowCount = 6;

  useEffect(() => {
    getAllCounters();
  }, []);

  /** Fetch all counters */
  const getAllCounters = () => {
    setLoading(true);
    fetch(apiUrl + 'admin/get-all-counters', {
      headers: {
        Accept: 'application/json',
        Authorization: authData.token,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status) setCounters(json.data);
        else setCounters([]);
      })
      .catch(() => toast.error('Failed to fetch counters.'))
      .finally(() => setLoading(false));
  };

  /** Save (update) edited flex flex-wrap */
  const saveEdit = (id) => {
    const found = counters.find((c) => c.id === id);
    fetch(`${apiUrl}admin/update-counter/${id}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
      body: JSON.stringify({
        counter_title: found.counter_title,
        count: Number(found.count),
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status) {
          toast.success('Counter updated');
          setEditing((prev) => ({ ...prev, [id]: false }));
          getAllCounters();
        } else toast.error('Failed to update');
      })
      .catch(() => toast.error('Failed to update'));
  };

  /** Handle inline edit */
  const handleEditCell = (id, field, value) => {
    setCounters((counters) =>
      counters.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  /** Add new counter */
  const handleAddCounter = () => {
    if (!newCounter.counter_title || newCounter.count === '') {
      toast.error('Please fill all fields');
      return;
    }
    fetch(apiUrl + 'admin/add-counter', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
      body: JSON.stringify({
        counter_title: newCounter.counter_title,
        count: Number(newCounter.count),
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status) {
          toast.success('Added successfully');
          setNewCounter({ counter_title: '', count: '' });
          getAllCounters();
        } else toast.error('Failed to add');
      })
      .catch(() => toast.error('Failed to add'));
  };

  /** Delete counter */
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure to delete this counter?')) return;
    fetch(`${apiUrl}admin/delete-counter/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: authData.token,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status) {
          toast.success('Deleted');
          getAllCounters();
        } else toast.error('Delete failed');
      })
      .catch(() => toast.error('Failed to delete'));
  };

  if (loading) return <DataLoader />;

  // At least 6 rows: fill with blanks
  let displayCounters = [...counters];
  while (displayCounters.length < rowCount) {
    displayCounters.push({
      id: `empty${displayCounters.length}`,
      counter_title: '',
      count: '',
    });
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="mb-0 text-lg font-semibold">Counters</h2>
      </div>
      <Table
        data={displayCounters}
        hover
        bordered
        cellBordered
        autoHeight
        rowHeight={60}
        headerHeight={45}
      >
        <Column width={70} align="center">
          <HeaderCell>#</HeaderCell>
          <Cell>{(_, idx) => idx + 1}</Cell>
        </Column>
        <Column flexGrow={1}>
          <HeaderCell>Counter Name</HeaderCell>
          <Cell>
            {(rowData) =>
              rowData.id?.toString().startsWith('empty') ? (
                ''
              ) : editing[rowData.id] ? (
                <Input
                  value={rowData.counter_title}
                  onChange={(val) =>
                    handleEditCell(rowData.id, 'counter_title', val)
                  }
                  style={{ minWidth: 130 }}
                />
              ) : (
                rowData.counter_title
              )
            }
          </Cell>
        </Column>
        <Column flexGrow={1}>
          <HeaderCell>Counter</HeaderCell>
          <Cell>
            {(rowData) =>
              rowData.id?.toString().startsWith('empty') ? (
                ''
              ) : editing[rowData.id] ? (
                <Input
                  type="number"
                  value={rowData.count}
                  onChange={(val) =>
                    handleEditCell(rowData.id, 'count', val.replace(/\D/gi, ''))
                  }
                  style={{ minWidth: 80 }}
                />
              ) : (
                rowData.count
              )
            }
          </Cell>
        </Column>
        <Column width={170}>
          <HeaderCell>Action</HeaderCell>
          <Cell>
            {(rowData) =>
              rowData.id?.toString().startsWith('empty') ? (
                ''
              ) : (
                <div>
                  {!editing[rowData.id] ? (
                    <>
                      <Button
                        appearance="primary" color="blue" className="mr-2" size="sm"
                        onClick={() => setEditing({ [rowData.id]: true })}
                      >
                        Edit
                      </Button>
                      <Button
                        appearance="primary" color="red" size="sm"
                        onClick={() => handleDelete(rowData.id)}
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Button
                      appearance="primary" color="green" size="sm"
                      onClick={() => saveEdit(rowData.id)}
                    >
                      Save
                    </Button>
                  )}
                </div>
              )
            }
          </Cell>
        </Column>
      </Table>
      {/* Add New Counter form */}
      <div className="mt-4 flex gap-3 items-center">
        <Input
          placeholder="Counter Name"
          style={{ width: 220 }}
          value={newCounter.counter_title}
          onChange={(val) =>
            setNewCounter((c) => ({ ...c, counter_title: val }))
          }
        />
        <Input
          placeholder="Counter"
          type="number"
          style={{ width: 100 }}
          value={newCounter.count}
          onChange={(val) =>
            setNewCounter((c) => ({ ...c, count: val.replace(/\D/gi, '') }))
          }
        />
        <Button
          appearance="primary"
          onClick={handleAddCounter}
          disabled={counters.length === 6}
        >
          Add Counter
        </Button>
      </div>
    </>
  );
}
