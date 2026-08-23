import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, SelectPicker } from 'rsuite';
import Swal from 'sweetalert2';
import { AuthContext } from '../../AuthContextProvider';
import DataLoader from '../../components/sharedComponents/DataLoader';
import DataTable, { Cell, Column, HeaderCell } from '../../components/sharedComponents/DataTable';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import PageLayout from '../../components/sharedComponents/PageLayout';
import Button from '../../components/ui/Button';
import { apiUrl } from '../../envConfig';

const FAQ_CATEGORIES = [
  { label: 'Home Page', value: 'Home Page' },
  { label: 'Property Page', value: 'Property Page' },
  { label: 'Property Type Page', value: 'Property Type Page' },
];

function Faqs() {
  const { authData } = useContext(AuthContext);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'Home Page',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadFaqs(); }, []);

  const loadFaqs = () => {
    setLoading(true);
    fetch(`${apiUrl}admin/get-all-faqs`, {
      headers: { Accept: 'application/json', Authorization: authData.token },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setFaqs(json.data || []);
          setShowNoData(false);
        } else {
          setShowNoData(true);
        }
      })
      .catch(() => {
        toast.error('Failed to load FAQs');
        setShowNoData(true);
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSaving(true);
    const url = editingId ? `${apiUrl}admin/update-faq/${editingId}` : `${apiUrl}admin/add-faq`;
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
      body: JSON.stringify(formData),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.status) {
          toast.success(editingId ? 'FAQ updated' : 'FAQ created');
          resetForm();
          loadFaqs();
        } else {
          toast.error(json.message || 'Operation failed');
        }
      })
      .catch(() => toast.error('Request failed'))
      .finally(() => setSaving(false));
  };

  const handleEdit = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'Home Page',
    });
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleDelete = (id, question) => {
    Swal.fire({
      title: 'Delete FAQ?',
      text: `"${question.substring(0, 60)}..."`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${apiUrl}admin/delete-faq/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json', Authorization: authData.token },
        })
          .then((r) => r.json())
          .then((json) => {
            if (json.status) {
              toast.success('FAQ deleted');
              loadFaqs();
            } else {
              toast.error(json.message || 'Delete failed');
            }
          })
          .catch(() => toast.error('Request failed'));
      }
    });
  };

  const resetForm = () => {
    setFormData({ question: '', answer: '', category: 'Home Page' });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      filterCategory === 'All' ||
      (faq.category || '').toLowerCase() === filterCategory.toLowerCase();
    return matchesCategory;
  });

  if (loading) return <DataLoader />;

  if (showNoData && !showForm) {
    return (
      <NoDataFound
        name="FAQ"
        message="No FAQs found, add your first FAQ!"
        showButton={true}
        handleClick={() => { setEditingId(null); setShowForm(true); setShowNoData(false); }}
      />
    );
  }

  return (
    <PageLayout
      title="FAQ Management"
      subtitle="Manage frequently asked questions shown on the website."
      actionLabel={showForm ? undefined : "+ Add FAQ"}
      actionOnClick={showForm ? undefined : () => { setEditingId(null); setFormData({ question: '', answer: '', category: 'Home Page' }); setShowForm(true); }}
      flush={true}
    >
      <div className="space-y-6">
        {showForm && (
          <div className="bg-section rounded-xl border border-line/50 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-ink">
                {editingId ? 'Edit FAQ' : 'New FAQ'}
              </h3>
              <Button appearance="subtle" size="sm" onClick={resetForm}>
                Cancel
              </Button>
            </div>
            <Form fluid onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 w-full">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
                    Category
                  </label>
                  <SelectPicker
                    data={FAQ_CATEGORIES}
                    block
                    cleanable={false}
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
                    Question
                  </label>
                  <Input
                    placeholder="Enter question"
                    value={formData.question}
                    onChange={(val) => setFormData({ ...formData, question: val })}
                  />
                </div>
              </div>
              <div className="mb-6 w-full">
                <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
                  Answer
                </label>
                <Input
                  as="textarea"
                  rows={4}
                  placeholder="Enter answer"
                  className="resize-none"
                  style={{ width: '100%' }}
                  value={formData.answer}
                  onChange={(val) => setFormData({ ...formData, answer: val })}
                />
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-line/40">
                <Button
                  appearance="primary"
                  onClick={handleSubmit}
                  loading={saving}
                  disabled={saving}
                >
                  {editingId ? 'Update FAQ' : 'Create FAQ'}
                </Button>
                <Button appearance="subtle" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-line/50 shadow-sm p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            {['All', 'Home Page', 'Property Page', 'Property Type Page'].map((cat) => (
              <Button
                appearance={filterCategory === cat ? "primary" : "subtle"}
                onClick={() => setFilterCategory(cat)}
                key={cat}
              >
                {cat}
              </Button>
            ))}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">
              No FAQs found for this category.
            </div>
          ) : (
            <DataTable data={filteredFaqs}>
              <Column width={60} align="center">
                <HeaderCell>#</HeaderCell>
                <Cell>{(_, index) => index + 1}</Cell>
              </Column>
              <Column width={140}>
                <HeaderCell>Category</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-violet-100 text-violet-700">
                      {rowData.category}
                    </span>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={2}>
                <HeaderCell>Question</HeaderCell>
                <Cell dataKey="question" />
              </Column>
              <Column flexGrow={3}>
                <HeaderCell>Answer</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <span className="line-clamp-1 text-muted">{rowData.answer}</span>
                  )}
                </Cell>
              </Column>
              <Column width={150} align="center">
                <HeaderCell>Actions</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <div className="flex gap-1.5 justify-center">
                      <Button appearance="subtle" size="xs" onClick={() => handleEdit(rowData)}>
                        Edit
                      </Button>
                      <Button appearance="subtle" color="red" size="xs" onClick={() => handleDelete(rowData.id, rowData.question)}>
                        Delete
                      </Button>
                    </div>
                  )}
                </Cell>
              </Column>
            </DataTable>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default Faqs;
