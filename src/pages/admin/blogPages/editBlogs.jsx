import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router';
import { Form, Input, TagInput } from 'rsuite';
import { apiUrl, imageUrl } from '../../../envConfig';
import { AuthContext } from '../../../AuthContextProvider';
import QuillEditorWrapper from '../../../components/adminComponents/QuillEditor';
import DataLoader from '../../../components/sharedComponents/DataLoader';
import Button from '../../../components/ui/Button';

function EditBlogs() {
  const { authData } = useContext(AuthContext);
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaKeywords, setMetaKeywords] = useState([]);
  const [metaDescription, setMetaDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`${apiUrl}admin/get-single-blog/${id}`, {
      headers: {
        Accept: 'application/json',
        Authorization: authData.token,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status && json.data) {
          const blog = json.data;
          setTitle(blog.title);
          setDescription(blog.description);
          setMetaTitle(blog.meta_title);
          setMetaKeywords(blog.meta_keywords);
          setMetaDescription(blog.meta_description);
          setImage(blog.image); // ✅ Fix: show preview from server
        } else {
          toast.error('Failed to load blog');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('An error occurred');
      })
      .finally(() => {
        setLoader(false);
      });
  }, [id]);

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('meta_title', metaTitle);
    formData.append('meta_description', metaDescription);
    // Loop for array meta_keywords
    metaKeywords.forEach((keyword) => {
      formData.append('meta_keywords[]', keyword);
    });

    // Only append image if it's a File object (i.e., newly uploaded)
    if (image instanceof File) {
      formData.append('image', image);
    }

    // Laravel expects _method=PUT for an update route via POST
    formData.append('_method', 'PUT');

    fetch(`${apiUrl}admin/edit-blog/${id}`, {
      method: 'POST', // Laravel route expects POST for _method=PUT
      headers: {
        Accept: 'application/json',
        Authorization: authData.token,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          toast.success('Blog updated successfully');
          // Optionally: Don’t clear if you want to allow further editing
          // setTitle('');
          // setImage(null);
          // setDescription('');
          // setMetaTitle('');
          // setMetaKeywords([]);
          // setMetaDescription('');
        } else {
          toast.error(json.message || 'Something went wrong');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.error('An error occurred');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loader) {
    return <DataLoader />;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-ink m-0">Edit Blog</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-line">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="col-span-1 lg:col-span-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-ink">Blog Image</label>
              <label htmlFor="blogImage" className="customUploader m-0">
                {image ? (
                  <div className="previewImage w-full h-full">
                    <img
                      src={
                        typeof image === 'string'
                          ? imageUrl + image
                          : URL.createObjectURL(image)
                      }
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
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl text-muted">+</span>
                    <span className="text-sm font-medium">Click to upload image</span>
                  </div>
                )}
              </label>

              <input
                id="blogImage"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => setImage(e.target.files?.[0] || null)}
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
                onChange={(e) => setMetaKeywords(e)}
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

export default EditBlogs;
