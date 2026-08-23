import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import DataLoader from '../../components/sharedComponents/DataLoader';
import SingleBlogCardAdmin from '../../components/sharedComponents/SingleBlogCardAdmin';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import PageLayout from '../../components/sharedComponents/PageLayout';
import { Pagination } from 'rsuite';

function BlogsAndArticles() {
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 8, total: 0, last_page: 1 });

  useEffect(() => { get_all_blogs(); }, []);

  const get_all_blogs = (page = 1) => {
    fetch(apiUrl + 'admin/get-all-blogs?page=' + page, {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setBlogs(json.data.data); setShowNoData(false);
          setPagination({ current_page: json.data.current_page, per_page: json.data.per_page, total: json.data.total, last_page: json.data.last_page });
        } else { setShowNoData(true); }
      })
      .catch((error) => console.error('Error:', error))
      .finally(() => setLoading(false));
  };

  const handlePageChange = (page) => { setPagination((prev) => ({ ...prev, current_page: page })); get_all_blogs(page); };

  if (loading) return <DataLoader />;

  return showNoData ? (
    <NoDataFound name="Blog" message="No blogs found, kindly add a new blog!" showButton={true}
      handleClick={() => navigate('/admin/add-blogs')} />
  ) : (
    <PageLayout
      title="Blogs & Articles"
      subtitle="Create and manage blog posts and articles."
      actionLabel="Add New Blog / Article"
      actionOnClick={() => navigate('/admin/add-blogs')}
      flush
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <div key={blog._id}>
            <SingleBlogCardAdmin blog={blog} get_all_blogs={get_all_blogs} />
          </div>
        ))}
      </div>
      {pagination.total > pagination.per_page && (
        <div className="w-full flex justify-center mt-8">
          <Pagination prev last next first size="md" ellipsis={true}
            total={pagination.total} limit={pagination.per_page} activePage={pagination.current_page}
            onChangePage={handlePageChange} />
        </div>
      )}
    </PageLayout>
  );
}

export default BlogsAndArticles;
