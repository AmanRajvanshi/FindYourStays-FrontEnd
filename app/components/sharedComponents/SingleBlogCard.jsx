import moment from 'moment';
import { Link } from 'react-router';
import { imageUrl } from '../../../envConfig';

function SingleBlogCard({ blogData }) {
  if (!blogData) {
    return null;
  }

  // Helper function to safely truncate text and handle HTML
  const getTruncatedDescription = (description) => {
    if (!description) return '';

    // Strip HTML tags if present
    const cleanText = description.replace(/<[^>]+>/g, '');

    return cleanText.length > 100
      ? cleanText.substring(0, 100) + '...'
      : cleanText;
  };

  return (
    <div className="for_blog feat_property">
      <Link to={`/single-blog/${blogData.id}`} className="thumb">
        <img
          className="img-whp"
          src={
            blogData.image
              ? imageUrl + blogData.image
              : '/images/default-blog.jpg'
          }
          alt={blogData.title}
          style={{
            width: '100%',
            height: '150px',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      </Link>
      <div className="details">
        <div className="tc_content">
          <Link to={`/single-blog/${blogData.id}`}>
            <h4 className="post_title">{blogData.title || 'Untitled'}</h4>
          </Link>
          <ul className="bpg_meta">
            <li className="list-inline-item">
              <a>
                <i className="flaticon-calendar" />
              </a>
            </li>
            <li className="list-inline-item">
              <a>
                {blogData.created_at
                  ? moment(blogData.created_at).format('LLLL')
                  : 'No date'}
              </a>
            </li>
          </ul>
          <p>{getTruncatedDescription(blogData.description)}</p>
        </div>
      </div>
    </div>
  );
}

export default SingleBlogCard;
