import { useLoaderData, useParams } from 'react-router';
import { apiUrl, domainUrl } from '../../../envConfig';
import Breadcrumb from '../../components/sharedComponents/Breadcrumb';

// Server-side data loading
export async function loader({ params }) {
  const { slug } = params;
  const pageSlug = slug || 'terms-and-conditions';

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
        pageTitle: pageData.title || 'Terms And Conditions',
        pageContent: pageData.content || '',
        pageDescription: pageData.description || '',
        metaTitle:
          pageData.meta_title ||
          `${pageData.title || 'Terms And Conditions'} | Find Your Stays`,
        metaDescription:
          pageData.meta_description ||
          'Read our terms and conditions to understand our policies and guidelines. Your trusted real estate partner.',
        metaKeywords:
          pageData.meta_keywords ||
          `${pageSlug}, terms, conditions, policy, Find Your Stays, real estate, legal`,
      };
    }
  } catch (error) {
    console.error('Terms page loader error:', error);
  }

  return {
    pageData: null,
    pageSlug,
    pageTitle: 'Terms And Conditions',
    pageContent: '',
    pageDescription: '',
    metaTitle: 'Terms And Conditions | Find Your Stays',
    metaDescription:
      'Read our terms and conditions to understand our policies and guidelines.',
    metaKeywords:
      'terms, conditions, policy, Find Your Stays, real estate, legal',
  };
}

// Dynamic meta tags
export function meta({ data }) {
  const {
    pageData,
    pageSlug = 'terms-and-conditions',
    metaTitle = 'Terms And Conditions | Find Your Stays',
    metaDescription = 'Read our terms and conditions to understand our policies and guidelines.',
    metaKeywords = 'terms, conditions, policy, Find Your Stays, real estate, legal',
  } = data || {};

  // Use meta fields from API response if available
  const apiMetaTitle = pageData?.meta_title || metaTitle;
  const apiMetaDescription = pageData?.meta_description || metaDescription;
  const apiMetaKeywords = pageData?.meta_keywords || [];

  // Ensure title includes brand name if not already present
  const finalTitle = apiMetaTitle.includes('Find Your Stays')
    ? apiMetaTitle
    : `${apiMetaTitle} | Find Your Stays`;

  // Create comprehensive keywords combining API keywords with terms-specific ones
  const dynamicKeywords = [
    'terms',
    'conditions',
    'policy',
    'Find Your Stays',
    'real estate',
    'legal',
    'terms of service',
    'user agreement',
    'platform rules',
    'service terms',
    'legal agreement',
    'user terms',
    'accommodation terms',
    'booking terms',
    'rental agreement',
    pageSlug,
    pageData?.title || 'terms and conditions',
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

    // SEO keywords using API data + terms-specific keywords
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

    // Legal/Terms-specific meta tags
    { name: 'classification', content: 'legal document, terms of service' },
    { name: 'coverage', content: 'worldwide' },
    { name: 'document-type', content: 'Terms and Conditions' },
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
          name: 'Terms and Conditions',
          description:
            'Legal document outlining terms of service and user agreements',
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

    // Terms of Service specific schema
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'DigitalDocument',
        name: 'Terms and Conditions',
        description:
          'Legal terms governing the use of Find Your Stays platform',
        url: pageUrl,
        author: {
          '@type': 'Organization',
          name: 'Find Your Stays',
          url: domainUrl,
        },
        dateCreated: pageData?.created_at || new Date().toISOString(),
        dateModified: pageData?.updated_at || new Date().toISOString(),
        inLanguage: 'en',
        genre: 'Legal Agreement',
        about: {
          '@type': 'Service',
          name: 'Accommodation Booking Platform',
          provider: {
            '@type': 'Organization',
            name: 'Find Your Stays',
          },
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
            name: pageData?.title || 'Terms and Conditions',
            item: pageUrl,
          },
        ],
      }),
    },
  ];
}

function TermsAndConditions() {
  const params = useParams();
  const loaderData = useLoaderData();

  // Use API data if available, otherwise fallback to static content
  const pageTitle = loaderData?.pageTitle || 'Terms And Conditions';
  const pageContent = loaderData?.pageContent;
  const pageSlug =
    loaderData?.pageSlug || params.slug || 'terms-and-conditions';

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

export default TermsAndConditions;
