import { useEffect, useState } from 'react';
import { Pagination } from 'rsuite';
import { MobileFeaturedProperties } from '../../components/sharedComponents/FeaturedProperties';
import PropertyTypeCount from '../../components/sharedComponents/PropertyTypeCount';
import SingleBlogCard from '../../components/sharedComponents/SingleBlogCard';
import TopViewedProperties from '../../components/sharedComponents/TopViewedProperties';
import MainLoader from '../../components/layoutComponents/MainLoader';
import { apiUrl, domainUrl } from '../../../envConfig';

export function meta() {
  const title =
    'Best PGs, Hostels, Co-living & Rentals for Students & Professionals | Top Metro Cities';
  const description =
    "Discover India's most trusted platform for affordable and community-led urban stays. Find Your Stays lists verified PGs, co-living spaces, hostels, and short-term rentals with zero brokerage, flexible move-in terms, and socially engaging living options.";
  const keywords =
    'PG in Gurgaon for working professionals, Co-living spaces in Gurgaon, Hostels in Gurgaon for students, Affordable PG in Delhi, Co-living in Delhi with meals, Hostel accommodation in Delhi, Short term stays in Noida, Long term PG in Noida, Best PG in Gurgaon near Cyberhub, Co-living rooms in Noida Sector 62, PG for students in Delhi NCR, Hostels for girls in Gurgaon, Shared co-living for digital nomads in Delhi, blog, articles, real estate news, property insights';

  return [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },

    // Open Graph tags
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `${domainUrl}/blogs-listing` },
    { property: 'og:site_name', content: 'Find Your Stays' },
    { property: 'og:locale', content: 'en_IN' },

    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:site', content: '@FindYourStays' }, // Add your Twitter handle

    // Additional SEO tags
    { name: 'author', content: 'Find Your Stays' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'en' },
    { name: 'revisit-after', content: '7 days' },
    { name: 'theme-color', content: '#68418b' }, // Your brand color
    { name: 'msapplication-TileColor', content: '#68418b' },

    // Geographic tags
    { name: 'geo.region', content: 'IN' },
    { name: 'geo.placename', content: 'Delhi NCR, India' },
    { name: 'geo.position', content: '28.7041;77.1025' }, // Delhi coordinates

    // Content classification
    {
      name: 'classification',
      content: 'accommodation, rental, PG, hostel, blog, articles',
    },
    { name: 'coverage', content: 'India' },
    { name: 'distribution', content: 'global' },
    { name: 'rating', content: 'general' },
    { name: 'category', content: 'Real Estate, Blog, Accommodation' },

    // Canonical URL
    { tagName: 'link', rel: 'canonical', href: `${domainUrl}/blog` },

    // RSS feed (if you have one)
    {
      tagName: 'link',
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'Find Your Stays Blog RSS',
      href: `${domainUrl}/blog/rss`,
    },

    // Schema.org structured data for Blog page
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Find Your Stays Blog',
        description:
          'Latest news, insights, and tips about PGs, hostels, co-living spaces, and rental accommodations in India',
        url: `${domainUrl}/blog`,
        publisher: {
          '@type': 'Organization',
          name: 'Find Your Stays',
          url: domainUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${domainUrl}/logo.png`, // Add your logo URL
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${domainUrl}/blog`,
        },
        inLanguage: 'en-IN',
        audience: {
          '@type': 'Audience',
          audienceType: 'Students, Working Professionals, Digital Nomads',
        },
      }),
    },

    // Breadcrumb structured data
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: domainUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${domainUrl}/blog`,
          },
        ],
      }),
    },
  ];
}

function BlogsListing() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 8,
    total: 0,
    last_page: 1,
  });

  // Function to fetch blogs
  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiUrl}website/get-all-blogs?page=${page}`
      );
      const result = await response.json();

      if (result.status) {
        setBlogs(result.data.data);
        setPagination({
          current_page: result.data.current_page,
          per_page: result.data.per_page,
          total: result.data.total,
          last_page: result.data.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    fetchBlogs(page);
  };

  if (loading) {
    return <MainLoader />;
  }

  return (
    <>
      <section className="blog_post_container bgc-f7">
        <div className="container">
          <div className="row">
            <div className="col-xl-6">
              <div className="breadcrumb_content style2">
                <h2 className="breadcrumb_title">Blog</h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8">
              <div className="row">
                {blogs.length > 0 ? (
                  blogs.map((blog) => (
                    <div key={blog.id} className="col-lg-6 col-md-6 mb-4">
                      <SingleBlogCard blogData={blog} />
                    </div>
                  ))
                ) : (
                  <div className="col-lg-12">
                    <div className="text-center py-5">
                      <h4>No blogs found</h4>
                      <p>Check back later for new blog posts.</p>
                    </div>
                  </div>
                )}
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
            </div>

            <div className="col-lg-4">
              <div className="terms_condition_widget">
                <h4 className="title">Featured Properties</h4>
                <MobileFeaturedProperties />
              </div>

              <PropertyTypeCount />

              <TopViewedProperties />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BlogsListing;
