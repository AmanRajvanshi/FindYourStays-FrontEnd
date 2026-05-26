import moment from 'moment';
import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router';
import { apiUrl, imageUrl } from '../../../envConfig';
import { AuthContext } from '../../AuthContextProvider';

function SingleBlogCardAdmin({ blog, get_all_blogs }) {
  const { authData } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    fetch(apiUrl + 'admin/delete-blog/' + blog.id, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          toast.success('Blog deleted successfully');
          get_all_blogs();
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getTruncatedDescription = (description) => {
    if (!description) return '';

    // Strip HTML tags if present
    const cleanText = description.replace(/<[^>]+>/g, '');

    return cleanText.length > 100
      ? cleanText.substring(0, 100) + '...'
      : cleanText;
  };

  return (
    <div className="feat_property list">
      <div className="thumb">
        <img
          className="img-whp"
          src={
            blog.image ? `${imageUrl + blog.image}` : '/images/property/fp1.jpg'
          }
          alt={blog.title}
        />
        <div className="thmb_cntnt">
          <ul className="icon mb0">
            <li className="list-inline-item">
              <Link to={`/admin/edit-blogs/${blog.id}`}>
                <i className="fa fa-pencil" />
              </Link>
            </li>
            <li className="list-inline-item">
              <a
                onClick={handleDelete}
                style={{ cursor: 'pointer' }}
                disabled={loading}
              >
                {loading ? (
                  <i className="fa fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa fa-trash-o" />
                )}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="details">
        <div className="tc_content">
          <p className="text-thm">
            {moment(blog.created_at).format('MMMM Do YYYY')} | {blog.views}{' '}
            Views
          </p>
          <h4>{blog.title}</h4>
          <p>{getTruncatedDescription(blog.description)}</p>
        </div>
      </div>
    </div>
  );
}

export default SingleBlogCardAdmin;
