import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiUrl } from '../../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import DataLoader from '../../components/sharedComponents/DataLoader';
import SingleBlogCardAdmin from '../../components/sharedComponents/SingleBlogCardAdmin';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import { Pagination } from 'rsuite';

function contactQueries() {
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 8,
    total: 0,
    last_page: 1,
  });

  useEffect(() => {
    get_all_blogs();
  }, []);

  const get_all_blogs = (page = 1) => {
    fetch(apiUrl + 'admin/get-all-blogs?page=' + page, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setBlogs(json.data.data);
          setShowNoData(false);
          setPagination({
            current_page: json.data.current_page,
            per_page: json.data.per_page,
            total: json.data.total,
            last_page: json.data.last_page,
          });
        } else {
          setShowNoData(true); // <-- update this line
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    get_all_blogs(page);
  };

  if (loading) {
    return <DataLoader />;
  }

  return showNoData ? (
    <NoDataFound
      name="Blog"
      message="No blogs found, kindly add a new blog!"
      showButton={true}
      handleClick={() => {
        navigate('/admin/add-blogs');
      }}
    />
  ) : (
    <>
      <div className="row">
        <div className="col-lg-6 col-xl-6 mb10">
          <div className="breadcrumb_content style2 mb30-991">
            <h2 className="breadcrumb_title mb0">Blogs And Articles</h2>
          </div>
        </div>
        <div className="col-lg-6 col-xl-6 mb10">
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-thm"
              type="button"
              onClick={() => navigate('/admin/add-blogs')}
            >
              Add New Blog / Article
            </button>
          </div>
        </div>
        {blogs.map((blog) => (
          <div className="col-lg-12 col-xl-6" key={blog._id}>
            <SingleBlogCardAdmin blog={blog} get_all_blogs={get_all_blogs} />
          </div>
        ))}
      </div>
      {/* Pagination */}
      {pagination.total > pagination.per_page && (
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center mt-4">
              <Pagination
                prev
                last
                next
                first
                size="sm"
                ellipsis={true}
                total={pagination.total}
                limit={pagination.per_page}
                activePage={pagination.current_page}
                onChangePage={handlePageChange}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default contactQueries;
