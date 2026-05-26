import { useLoaderData, useParams } from 'react-router';
import { apiUrl, domainUrl } from '../../../envConfig';
import Breadcrumb from '../../components/sharedComponents/Breadcrumb';

// Server-side data loading
export async function loader({ params }) {
  const { slug } = params;
  const pageSlug = slug || 'privacy-policy';

  try {
    const response = await fetch(
      `${apiUrl}website/get-single-pages/${pageSlug}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const json = await response.json();

    if (json.status) {
      const pageData = json.data;
      return {
        pageData, // Ensure this is passed to meta function
        pageSlug,
        pageTitle: pageData.title || 'Privacy Policy',
        pageContent: pageData.content || '',
        pageDescription: pageData.description || '',
        metaTitle:
          pageData.meta_title ||
          `${pageData.title || 'Privacy Policy'} | Find Your Stays`,
        metaDescription:
          pageData.meta_description ||
          'Read our privacy policy to understand how we collect, use, and protect your personal information.',
        metaKeywords:
          pageData.meta_keywords ||
          `${pageSlug}, privacy, policy, data protection, Find Your Stays, real estate, security`,
      };
    }
  } catch (error) {
    console.error('Privacy page loader error:', error);
  }

  return {
    pageData: null,
    pageSlug,
    pageTitle: 'Privacy Policy',
    pageContent: '',
    pageDescription: '',
    metaTitle: 'Privacy Policy | Find Your Stays',
    metaDescription:
      'Read our privacy policy to understand how we collect, use, and protect your personal information.',
    metaKeywords:
      'privacy, policy, data protection, Find Your Stays, real estate, security',
  };
}

// Dynamic meta tags
export function meta({ data }) {
  const {
    pageData,
    pageSlug = 'privacy-policy',
    metaTitle = 'Privacy Policy | Find Your Stays',
    metaDescription = 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
    metaKeywords = 'privacy, policy, data protection, Find Your Stays, real estate, security',
  } = data || {};

  // Use meta fields from API response if available
  const apiMetaTitle = pageData?.meta_title || metaTitle;
  const apiMetaDescription = pageData?.meta_description || metaDescription;
  const apiMetaKeywords = pageData?.meta_keywords || [];

  // Ensure title includes brand name if not already present
  const finalTitle = apiMetaTitle.includes('Find Your Stays')
    ? apiMetaTitle
    : `${apiMetaTitle} | Find Your Stays`;

  // Create comprehensive keywords combining API keywords with privacy-specific ones
  const dynamicKeywords = [
    'privacy',
    'policy',
    'data protection',
    'Find Your Stays',
    'real estate',
    'security',
    'personal information',
    'data privacy',
    'user privacy',
    'GDPR compliance',
    'data collection',
    'information security',
    pageSlug,
    pageData?.title || 'privacy policy',
  ];

  // Combine API keywords with dynamic keywords and remove duplicates
  const allKeywords = Array.isArray(apiMetaKeywords)
    ? [...apiMetaKeywords, ...dynamicKeywords]
    : [metaKeywords, ...dynamicKeywords];

  const uniqueKeywords = [...new Set(allKeywords.filter(Boolean))];

  const pageUrl = `${domainUrl}/${pageSlug}`;

  return [
    { title: finalTitle },
    { name: 'description', content: apiMetaDescription },

    // SEO keywords using API data + privacy-specific keywords
    {
      name: 'keywords',
      content: uniqueKeywords.join(', '),
    },

    // Open Graph tags
    { property: 'og:title', content: finalTitle },
    { property: 'og:description', content: apiMetaDescription },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: pageUrl },
    { property: 'og:site_name', content: 'Find Your Stays' },
    { property: 'og:locale', content: 'en_IN' },

    // Twitter Card tags
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: finalTitle },
    { name: 'twitter:description', content: apiMetaDescription },

    // Additional SEO tags
    { name: 'author', content: 'Find Your Stays' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'en' },
    { name: 'revisit-after', content: '30 days' }, // Less frequent for legal pages
    { property: 'article:section', content: 'Legal' },

    // Legal/Privacy-specific meta tags
    { name: 'classification', content: 'legal document, privacy policy' },
    { name: 'coverage', content: 'worldwide' },
    { name: 'document-type', content: 'Privacy Policy' },
    { name: 'document-rating', content: 'general' },
    { name: 'content-language', content: 'en' },

    // Canonical URL
    { tagName: 'link', rel: 'canonical', href: pageUrl },

    // Schema.org structured data for Legal Document
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: apiMetaTitle,
        description: apiMetaDescription,
        url: pageUrl,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Find Your Stays',
          url: domainUrl,
        },
        about: {
          '@type': 'Thing',
          name: 'Privacy Policy',
          description:
            'Legal document outlining data collection and privacy practices',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Find Your Stays',
          url: domainUrl,
        },
        dateModified: pageData?.updated_at || new Date().toISOString(),
        inLanguage: 'en-IN',
        audience: {
          '@type': 'Audience',
          audienceType: 'General Public',
        },
      }),
    },

    // Article schema for legal content
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: apiMetaTitle,
        description: apiMetaDescription,
        url: pageUrl,
        datePublished: pageData?.created_at || new Date().toISOString(),
        dateModified: pageData?.updated_at || new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: 'Find Your Stays',
          url: domainUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Find Your Stays',
          url: domainUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${domainUrl}/logo.png`,
          },
        },
        articleSection: 'Legal',
        genre: 'Legal Document',
        keywords: uniqueKeywords.join(', '),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageUrl,
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
            name: pageData?.title || 'Privacy Policy',
            item: pageUrl,
          },
        ],
      }),
    },
  ];
}

function PrivacyPolicy() {
  const params = useParams();
  const loaderData = useLoaderData();

  // Use API data if available, otherwise fallback to static content
  const pageTitle = loaderData?.pageTitle || 'Privacy Policy';
  const pageContent = loaderData?.pageContent;
  const pageSlug = loaderData?.pageSlug || params.slug || 'privacy-policy';

  // Check if we have dynamic content from API
  const hasApiContent = pageContent && pageContent.trim().length > 0;

  return (
    <>
      <Breadcrumb title={pageTitle} />
      <section className="our-terms bgc-f7">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-xl-12">
              <div className="terms_condition_grid">
                <div className="grids mb30">
                  <div dangerouslySetInnerHTML={{ __html: pageContent }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default PrivacyPolicy;
