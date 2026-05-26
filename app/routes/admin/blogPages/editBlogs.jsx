import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router';
import { Form, Input, TagInput } from 'rsuite';
import { apiUrl, imageUrl } from '../../../../envConfig';
import { AuthContext } from '../../../AuthContextProvider';
import QuillEditorWrapper from '../../../components/adminComponents/QuillEditor';
import DataLoader from '../../../components/sharedComponents/DataLoader';

function editBlogs() {
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
    <div className="row">
      <div className="col-lg-12 mb10">
        <div className="breadcrumb_content style2">
          <h2 className="breadcrumb_title">Add New Blog</h2>
        </div>
      </div>

      <div className="col-lg-4 mb-2">
        <Form.Group>
          <Form.ControlLabel>Blog Image</Form.ControlLabel>
          <label htmlFor="blogImage" className="customUploader">
            {image ? (
              <div className="previewImage">
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
              <span>Click to upload</span>
            )}
          </label>

          <input
            id="blogImage"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </Form.Group>
      </div>
      <div className="col-lg-8">
        <div className="row">
          <div className="col-lg-12 mb-2">
            <Form.Group>
              <Form.ControlLabel>Blog Title</Form.ControlLabel>
              <Input
                value={title}
                onChange={setTitle}
                placeholder="Blog Title"
              />
            </Form.Group>
          </div>

          <div className="col-lg-12 mb-2">
            <Form.Group>
              <Form.ControlLabel>Blog Description</Form.ControlLabel>
              <QuillEditorWrapper
                value={description}
                onChange={setDescription}
              />
            </Form.Group>
          </div>
        </div>
      </div>

      <div className="col-lg-6 mb-2">
        <Form.Group>
          <Form.ControlLabel>Meta Title</Form.ControlLabel>
          <Input
            value={metaTitle}
            onChange={setMetaTitle}
            placeholder="Meta Title"
          />
        </Form.Group>
      </div>

      <div className="col-lg-6 mb-2">
        <Form.Group>
          <Form.ControlLabel>Meta Keywords</Form.ControlLabel>
          <br />
          <TagInput
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e)}
            placeholder="Meta Keywords"
            style={{ width: '100%' }}
            trigger={['Enter', 'Space', 'Comma']}
          />
        </Form.Group>
      </div>

      <div className="col-lg-12 mb-4">
        <Form.Group>
          <Form.ControlLabel>Meta Description</Form.ControlLabel>
          <Input
            as="textarea"
            rows={3}
            value={metaDescription}
            onChange={setMetaDescription}
            placeholder="Meta Description"
          />
        </Form.Group>
      </div>

      <div className="col-lg-12 d-flex justify-content-end">
        <button
          className="btn btn-thm"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Blog'}
        </button>
      </div>
    </div>
  );
}

export default editBlogs;
