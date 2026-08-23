import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Input } from 'rsuite';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import DataLoader from '../../components/sharedComponents/DataLoader';
import PageLayout from '../../components/sharedComponents/PageLayout';
import DataTable, { Column, HeaderCell, Cell } from '../../components/sharedComponents/DataTable';
import Button from '../../components/ui/Button';

export default function Counters() {
  const { authData } = useContext(AuthContext);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [newCounter, setNewCounter] = useState({ counter_title: '', count: '' });
  const rowCount = 6;

  useEffect(() => { getAllCounters(); }, []);

  const getAllCounters = () => {
    setLoading(true);
    fetch(apiUrl + 'admin/get-all-counters', {
      headers: { Accept: 'application/json', Authorization: authData.token },
    })
      .then((r) => r.json())
      .then((json) => { if (json.status) setCounters(json.data); else setCounters([]); })
      .catch(() => toast.error('Failed to fetch counters.'))
      .finally(() => setLoading(false));
  };

  const saveEdit = (id) => {
    const found = counters.find((c) => c.id === id);
    fetch(`${apiUrl}admin/update-counter/${id}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
      body: JSON.stringify({ counter_title: found.counter_title, count: Number(found.count) }),
    })
      .then((r) => r.json())
      .then((json) => { if (json.status) { toast.success('Counter updated'); setEditing((prev) => ({ ...prev, [id]: false })); getAllCounters(); } else toast.error('Failed to update'); })
      .catch(() => toast.error('Failed to update'));
  };

  const handleEditCell = (id, field, value) => {
    setCounters((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleAddCounter = () => {
    if (!newCounter.counter_title || newCounter.count === '') { toast.error('Please fill all fields'); return; }
    fetch(apiUrl + 'admin/add-counter', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
      body: JSON.stringify({ counter_title: newCounter.counter_title, count: Number(newCounter.count) }),
    })
      .then((r) => r.json())
      .then((json) => { if (json.status) { toast.success('Added successfully'); setNewCounter({ counter_title: '', count: '' }); getAllCounters(); } else toast.error('Failed to add'); })
      .catch(() => toast.error('Failed to add'));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure to delete this counter?')) return;
    fetch(`${apiUrl}admin/delete-counter/${id}`, {
      method: 'DELETE', headers: { Accept: 'application/json', Authorization: authData.token },
    })
      .then((r) => r.json())
      .then((json) => { if (json.status) { toast.success('Deleted'); getAllCounters(); } else toast.error('Delete failed'); })
      .catch(() => toast.error('Failed to delete'));
  };

  if (loading) return <DataLoader />;

  let displayCounters = [...counters];
  while (displayCounters.length < rowCount) {
    displayCounters.push({ id: `empty${displayCounters.length}`, counter_title: '', count: '' });
  }

  return (
    <PageLayout title="Counters" subtitle="Manage display counters for your website.">
      <DataTable data={displayCounters} rowHeight={56} headerHeight={44}>
        <Column width={60} align="center">
          <HeaderCell>#</HeaderCell>
          <Cell>{(_, idx) => idx + 1}</Cell>
        </Column>
        <Column flexGrow={1}>
          <HeaderCell>Counter Name</HeaderCell>
          <Cell>
            {(rowData) =>
              rowData.id?.toString().startsWith('empty') ? '' :
              editing[rowData.id] ? (
                <Input value={rowData.counter_title} onChange={(val) => handleEditCell(rowData.id, 'counter_title', val)} style={{ minWidth: 130 }} />
              ) : rowData.counter_title
            }
          </Cell>
        </Column>
        <Column flexGrow={1}>
          <HeaderCell>Counter</HeaderCell>
          <Cell>
            {(rowData) =>
              rowData.id?.toString().startsWith('empty') ? '' :
              editing[rowData.id] ? (
                <Input type="number" value={rowData.count} onChange={(val) => handleEditCell(rowData.id, 'count', val.replace(/\D/gi, ''))} style={{ minWidth: 80 }} />
              ) : rowData.count
            }
          </Cell>
        </Column>
        <Column width={160} align="center">
          <HeaderCell>Actions</HeaderCell>
          <Cell>
            {(rowData) =>
              rowData.id?.toString().startsWith('empty') ? '' : (
                <div className="flex gap-1.5 justify-center">
                  {!editing[rowData.id] ? (
                    <>
                      <Button appearance="subtle" size="xs" onClick={() => setEditing({ [rowData.id]: true })}>Edit</Button>
                      <Button appearance="subtle" color="red" size="xs" onClick={() => handleDelete(rowData.id)}>Delete</Button>
                    </>
                  ) : (
                    <Button appearance="primary" size="xs" onClick={() => saveEdit(rowData.id)}>Save</Button>
                  )}
                </div>
              )
            }
          </Cell>
        </Column>
      </DataTable>

      <div className="mt-4 flex gap-3 items-center">
        <Input placeholder="Counter Name" style={{ width: 220 }} value={newCounter.counter_title}
          onChange={(val) => setNewCounter((c) => ({ ...c, counter_title: val }))} />
        <Input placeholder="Counter" type="number" style={{ width: 100 }} value={newCounter.count}
          onChange={(val) => setNewCounter((c) => ({ ...c, count: val.replace(/\D/gi, '') }))} />
        <Button appearance="primary" onClick={handleAddCounter} disabled={counters.length === 6}>Add Counter</Button>
      </div>
    </PageLayout>
  );
}
