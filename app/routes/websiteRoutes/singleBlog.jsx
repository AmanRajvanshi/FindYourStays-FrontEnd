import moment from 'moment';
import { useEffect, useState } from 'react';
import { useParams, useLoaderData } from 'react-router';
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from 'react-share';
import { apiUrl, domainUrl, imageUrl } from '../../../envConfig';
import MainLoader from '../../components/layoutComponents/MainLoader';
import { MobileFeaturedProperties } from '../../components/sharedComponents/FeaturedProperties';
import PropertyTypeCount from '../../components/sharedComponents/PropertyTypeCount';
import TopViewedProperties from '../../components/sharedComponents/TopViewedProperties';

// Server-side data loading
export async function loader({ params }) {
  const { id } = params;

  try {
    const response = await fetch(`${apiUrl}website/get-single-blog/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();

    if (json.status) {
      const blog = json.data;
      return {
        blog, // Pass the full blog object
        blogTitle: blog.title || 'Blog Post',
        blogDescription: blog.description || '',
        blogImage: blog.image || '',
        blogCreatedAt: blog.created_at || '',
        blogSlug: blog.slug || id,
      };
    }
  } catch (error) {
    console.error('Blog loader error:', error);
  }

  return {
    blog: null,
    blogTitle: 'Blog Not Found',
    blogDescription: '',
    blogImage: '',
    blogCreatedAt: '',
    blogSlug: id,
  };
}

// Dynamic meta tags
export function meta({ data }) {
  const {
    blogTitle = 'Blog Not Found',
    blogDescription = '',
    blogImage = '',
    blogCreatedAt = '',
    blog = null,
  } = data || {};

  // Use meta fields from API response if available
  const apiMetaTitle = blog?.meta_title || blogTitle;
  const apiMetaDescription = blog?.meta_description || '';
  const apiMetaKeywords = blog?.meta_keywords || [];

  // Clean HTML from description for meta tags if no API meta description
  const cleanDescription =
    apiMetaDescription ||
    (blogDescription
      ? blogDescription.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
      : `Read our latest blog post: ${blogTitle}. Stay updated with the latest insights and information.`);

  // Use API meta title or fallback to constructed title
  const title = apiMetaTitle.includes('Find Your Stays')
    ? apiMetaTitle
    : `${apiMetaTitle} | Find Your Stays Blog`;

  const blogImageUrl = blogImage ? `${imageUrl}${blogImage}` : '';
  const publishedTime = blogCreatedAt
    ? moment(blogCreatedAt).toISOString()
    : '';

  // Create comprehensive keywords combining API keywords with dynamic ones
  const dynamicKeywords = [
    'blog',
    'real estate',
    'property',
    'Find Your Stays',
    'articles',
    blogTitle,
  ];

  // Combine API keywords with dynamic keywords and remove duplicates
  const allKeywords = [...apiMetaKeywords, ...dynamicKeywords];
  const uniqueKeywords = [...new Set(allKeywords.filter(Boolean))];

  return [
    { title },
    { name: 'description', content: cleanDescription },

    // Open Graph tags
    { property: 'og:title', content: title },
    { property: 'og:description', content: cleanDescription },
    { property: 'og:type', content: 'article' },
    {
      property: 'og:url',
      content: `${domainUrl}/blog/${data?.blogSlug || blog?.slug}`,
    },
    { property: 'og:site_name', content: 'Find Your Stays' },
    ...(blogImageUrl ? [{ property: 'og:image', content: blogImageUrl }] : []),
    ...(blogImageUrl ? [{ property: 'og:image:width', content: '1200' }] : []),
    ...(blogImageUrl ? [{ property: 'og:image:height', content: '630' }] : []),
    ...(publishedTime
      ? [{ property: 'article:published_time', content: publishedTime }]
      : []),
    { property: 'article:section', content: 'Blog' },
    { property: 'article:author', content: 'Find Your Stays' },

    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: cleanDescription },
    ...(blogImageUrl ? [{ name: 'twitter:image', content: blogImageUrl }] : []),

    // SEO tags with API keywords
    {
      name: 'keywords',
      content: uniqueKeywords.join(', '),
    },
    { name: 'author', content: 'Find Your Stays' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'en' },
    { name: 'revisit-after', content: '7 days' },

    // Canonical URL
    {
      tagName: 'link',
      rel: 'canonical',
      href: `${domainUrl}/blog/${blog?.slug || data?.blogSlug}`,
    },

    // Schema.org structured data for Blog Post
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: apiMetaTitle,
        description: cleanDescription,
        image: blogImageUrl,
        author: {
          '@type': 'Organization',
          name: 'Find Your Stays',
          url: domainUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Find Your Stays',
          url: domainUrl,
        },
        datePublished: publishedTime,
        dateModified: blog?.updated_at
          ? moment(blog.updated_at).toISOString()
          : publishedTime,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${domainUrl}/blog/${blog?.slug || data?.blogSlug}`,
        },
        keywords: uniqueKeywords.join(', '),
      }),
    },
  ];
}

function SingleBlog() {
  const params = useParams();
  const loaderData = useLoaderData();
  const [isClient, setIsClient] = useState(false);

  // Initialize state with loader data
  const [blogData, setBlogData] = useState(loaderData?.blog || {});
  const [loading, setLoading] = useState(!loaderData?.blog);

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only fetch if we don't have data from loader (client-side navigation)
    if (!loaderData?.blog) {
      get_single_blog(params.id);
    }
  }, [params.id, loaderData]);

  const get_single_blog = (id) => {
    setLoading(true);
    fetch(apiUrl + 'website/get-single-blog/' + id, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          setBlogData(json.data);
        } else {
          setBlogData({});
        }
      })
      .catch((e) => {
        console.log('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return <MainLoader />;
  }

  // Handle case where blog is not found
  if (!blogData || Object.keys(blogData).length === 0) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-12 text-center">
            <h2>Blog Post Not Found</h2>
            <p>
              The blog post you're looking for doesn't exist or has been
              removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="blog_post_container bgc-f7 pb30">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <div className="main_blog_post_content">
              <div className="mbp_thumb_post">
                <h1 className="blog_sp_title">{blogData.title}</h1>
                <ul className="blog_sp_post_meta">
                  <li className="list-inline-item">
                    <span className="flaticon-calendar" />
                  </li>
                  <li className="list-inline-item">
                    <time dateTime={blogData.created_at}>
                      {moment(blogData.created_at).format('LLLL')}
                    </time>
                  </li>
                </ul>
                {blogData.image && (
                  <div className="thumb">
                    <img
                      className="img-fluid"
                      src={imageUrl + blogData.image}
                      alt={blogData.title || 'Blog post image'}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="details">
                  <div
                    className="mb30"
                    dangerouslySetInnerHTML={{ __html: blogData.description }}
                  />
                </div>

                {/* Social sharing - only render on client side */}
                {isClient && (
                  <>
                    <h3>Share This Blog</h3>
                    <ul className="d-flex list-unstyled">
                      <li className="mr-2">
                        <FacebookShareButton
                          url={domainUrl + 'blog/' + blogData.slug}
                          quote={blogData.title}
                        >
                          <FacebookIcon size={32} round={true} />
                        </FacebookShareButton>
                      </li>
                      <li className="mr-2">
                        <TwitterShareButton
                          url={domainUrl + 'blog/' + blogData.slug}
                          title={blogData.title}
                        >
                          <TwitterIcon size={32} round={true} />
                        </TwitterShareButton>
                      </li>
                      <li className="mr-2">
                        <WhatsappShareButton
                          url={domainUrl + 'blog/' + blogData.slug}
                          title={blogData.title}
                        >
                          <WhatsappIcon size={32} round={true} />
                        </WhatsappShareButton>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>
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
  );
}

export default SingleBlog;
