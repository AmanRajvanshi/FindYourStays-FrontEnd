import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, SelectPicker, TagInput, Toggle } from 'rsuite';
import { apiUrl } from '../../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import QuillEditorWrapper from '../../components/adminComponents/QuillEditor';
import DataLoader from '../../components/sharedComponents/DataLoader';

function CustomPages() {
  const { authData } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    status: 'active',
    meta_title: '',
    meta_keywords: [],
    meta_description: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pageOptions = [
    { label: 'Select Page', value: '' },
    { label: 'About Us', value: 'about-us' },
    { label: 'Terms & Conditions', value: 'terms-and-conditions' },
    { label: 'Privacy Policy', value: 'privacy-policy' },
    { label: 'Contact Us', value: 'contact-us' },
  ];

  const handlePageChange = async (slug) => {
    const selected = pageOptions.find((item) => item.value === slug);
    const defaultData = {
      slug,
      title: selected?.label || '',
      content: '',
      status: 'active',
      meta_title: '',
      meta_keywords: [],
      meta_description: '',
    };

    setFormData(defaultData);
    if (!slug) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}admin/get-single-page/${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authData.token,
          Accept: 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && data.status) {
        const page = data.data;
        setFormData({
          slug: page.slug,
          title: page.title,
          content: page.content || '',
          status: page.status === 'active' ? 'active' : 'inactive',
          meta_title: page.meta_title || '',
          meta_keywords: page.meta_keywords
            ? page.meta_keywords.split(',')
            : [],
          meta_description: page.meta_description || '',
        });
      } else {
        console.warn('Page not found or error in response');
      }
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}admin/add-or-update-page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authData.token,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: formData.status === 'active' ? 'active' : 'draft',
        }),
      });
      const data = await res.json();
      if (res.ok && data.status) {
        toast.success('Page saved successfully!');
      } else {
        toast.error(data.message || 'Something went wrong while saving.');
      }
    } catch (error) {
      console.log('Failed to save page.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DataLoader />;
  }

  return (
    <div className="row">
      <div className="col-lg-6 col-xl-6 mb10">
        <div className="breadcrumb_content style2 mb30-991">
          <h2 className="breadcrumb_title mb0">Custom Pages</h2>
        </div>
      </div>
      <div className="col-lg-6 col-xl-6 mb10">
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-thm"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="col-lg-12 col-xl-5 mb10">
        <Form.Group>
          <Form.ControlLabel>Custom Page</Form.ControlLabel>
          <SelectPicker
            data={pageOptions}
            searchable={false}
            placeholder="Select Page"
            className="w-100"
            value={formData.slug}
            onChange={handlePageChange}
            disabledItemValues={['']}
          />
        </Form.Group>
      </div>

      <div className="col-lg-12 col-xl-5 mb10">
        <Form.Group>
          <Form.ControlLabel>Page Title</Form.ControlLabel>
          <Input value={formData.slug} disabled placeholder="Page Title" />
        </Form.Group>
      </div>

      <div className="col-lg-12 col-xl-2 mb10">
        <Form.Group>
          <Form.ControlLabel>Page Status</Form.ControlLabel>
          <br />
          <Toggle
            checkedChildren="Enable This Page"
            unCheckedChildren="Disable This Page"
            checked={formData.status === 'active'}
            onChange={(value) =>
              setFormData({
                ...formData,
                status: value ? 'active' : 'inactive',
              })
            }
          />
        </Form.Group>
      </div>

      <div className="col-lg-12 col-xl-12 mb10">
        <Form.Group>
          <Form.ControlLabel>Page Description</Form.ControlLabel>
          <QuillEditorWrapper
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
          />
        </Form.Group>
      </div>

      <div className="col-lg-6 col-xl-6 mb10">
        <Form.Group>
          <Form.ControlLabel>Meta Title</Form.ControlLabel>
          <Input
            value={formData.meta_title}
            onChange={(value) =>
              setFormData({ ...formData, meta_title: value })
            }
            placeholder="Meta Title"
          />
        </Form.Group>
      </div>

      <div className="col-lg-6 col-xl-6 mb10">
        <Form.Group>
          <Form.ControlLabel>Meta Keywords</Form.ControlLabel>
          <TagInput
            value={formData.meta_keywords}
            onChange={(value) =>
              setFormData({ ...formData, meta_keywords: value })
            }
            placeholder="Meta Keywords"
            style={{ width: '100%' }}
            trigger={['Enter', 'Space', 'Comma']}
          />
        </Form.Group>
      </div>

      <div className="col-lg-12 col-xl-12 mb10">
        <Form.Group>
          <Form.ControlLabel>Meta Description</Form.ControlLabel>
          <Input
            as="textarea"
            rows={3}
            value={formData.meta_description}
            onChange={(value) =>
              setFormData({ ...formData, meta_description: value })
            }
            placeholder="Meta Description"
          />
        </Form.Group>
      </div>
    </div>
  );
}

export default CustomPages;
