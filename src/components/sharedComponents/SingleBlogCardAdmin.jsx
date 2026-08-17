import moment from 'moment';
import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { apiUrl, imageUrl } from '../../envConfig';
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full relative group">
      <div className="relative w-full h-56 shrink-0 bg-gray-100 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={
            blog.image ? `${imageUrl + blog.image}` : '/images/property/fp1.jpg'
          }
          alt={blog.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/600x400/f3f4f6/9ca3af?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            to={`/admin/edit-blogs/${blog.id}`}
            className="w-10 h-10 rounded-full bg-white text-gray-800 hover:text-coral flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            title="Edit Blog"
          >
            <FontAwesomeIcon icon={faPencil} />
          </Link>
          <button
            onClick={(e) => { e.preventDefault(); handleDelete(); }}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-white text-gray-800 hover:text-red-500 flex items-center justify-center transition-all hover:scale-110 shadow-lg disabled:opacity-50"
            title="Delete Blog"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faTrash} />
            )}
          </button>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-start">
        <p className="text-xs font-semibold text-coral uppercase tracking-wider mb-2">
          {moment(blog.created_at).format('MMM DD, YYYY')} <span className="text-gray-300 mx-1">•</span> <span className="text-gray-500">{blog.views} Views</span>
        </p>
        <h4 className="text-lg font-bold text-gray-900 leading-snug mb-3">
          {blog.title}
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed m-0 line-clamp-3">
          {getTruncatedDescription(blog.description)}
        </p>
      </div>
    </div>
  );
}

export default SingleBlogCardAdmin;
