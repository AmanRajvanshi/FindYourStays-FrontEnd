import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, TagInput, Uploader } from 'rsuite';
import { apiUrl } from '../../../envConfig';
import { AuthContext } from '../../../AuthContextProvider';
import QuillEditorWrapper from '../../../components/adminComponents/QuillEditor';
import Button from '../../../components/ui/Button';

function AddBlogs() {
  const { authData } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaKeywords, setMetaKeywords] = useState([]);
  const [metaDescription, setMetaDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('meta_title', metaTitle);
    formData.append('meta_description', metaDescription);

    metaKeywords.forEach((keyword) => {
      formData.append('meta_keywords[]', keyword);
    });

    if (image) {
      formData.append('image', image);
    }

    fetch(apiUrl + 'admin/add-blog', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: authData.token,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          toast.success('Blog added successfully');
          setTitle('');
          setImage(null);
          setDescription('');
          setMetaTitle('');
          setMetaKeywords([]);
          setMetaDescription('');
        } else {
          toast.error(json.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-ink m-0">Add New Blog</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-line">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="col-span-1 lg:col-span-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ink">Blog Image</label>
              <label htmlFor="customFileInput" className="customUploader m-0">
                {image ? (
                  <div className="previewImage">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      className="cancelButton"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setImage(null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <span>Click to upload</span>
                )}
              </label>

              <input
                id="customFileInput"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ink">Blog Title</label>
              <Input
                value={title}
                onChange={setTitle}
                placeholder="Blog Title"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ink">Blog Description</label>
              <QuillEditorWrapper
                value={description}
                onChange={setDescription}
              />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-6">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ink">Meta Title</label>
              <Input
                value={metaTitle}
                onChange={setMetaTitle}
                placeholder="Meta Title"
              />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-6">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ink">Meta Keywords</label>
              <TagInput
                value={metaKeywords}
                onChange={(value) => setMetaKeywords(value)}
                placeholder="Meta Keywords"
                style={{ width: '100%' }}
                trigger={['Enter', 'Space', 'Comma']}
              />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-12">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ink">Meta Description</label>
              <Input
                as="textarea"
                rows={3}
                value={metaDescription}
                onChange={setMetaDescription}
                placeholder="Meta Description"
              />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-12 flex justify-end mt-4">
            <Button
              appearance="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Blog'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBlogs;
