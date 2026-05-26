import { useLoaderData, useParams } from 'react-router';
import { apiUrl, domainUrl } from '../../../envConfig';
import Breadcrumb from '../../components/sharedComponents/Breadcrumb';
import CounterBlock from '../../components/sharedComponents/CounterBlock';

// Server-side data loading
export async function loader({ params }) {
  const { slug } = params;
  const pageSlug = slug || 'about-us';

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
        pageTitle: pageData.title || 'Page',
        pageContent: pageData.content || '',
        pageDescription: pageData.description || '',
        metaTitle:
          pageData.meta_title ||
          `${pageData.title || 'Page'} | Find Your Stays`,
        metaDescription:
          pageData.meta_description ||
          `Learn more about ${
            pageData.title || 'our services'
          } - Your trusted real estate partner.`,
        metaKeywords:
          pageData.meta_keywords ||
          `${pageSlug}, Find Your Stays, real estate, property, company`,
      };
    }
  } catch (error) {
    console.error('Page loader error:', error);
  }

  return {
    pageData: null,
    pageSlug,
    pageTitle: 'Page Not Found',
    pageContent: '<p>The page you are looking for could not be found.</p>',
    pageDescription: '',
    metaTitle: 'Page Not Found | Find Your Stays',
    metaDescription: 'The page you are looking for could not be found.',
    metaKeywords: `${pageSlug}, Find Your Stays, real estate, property`,
  };
}

// Dynamic meta tags
export function meta({ data }) {
  const {
    pageData,
    pageSlug = 'about-us',
    metaTitle = 'Page | Find Your Stays',
    metaDescription = 'Learn more about our services - Your trusted real estate partner.',
    metaKeywords = 'Find Your Stays, real estate, property, company',
  } = data || {};

  // Use meta fields from API response if available
  const apiMetaTitle = pageData?.meta_title || metaTitle;
  const apiMetaDescription = pageData?.meta_description || metaDescription;
  const apiMetaKeywords = pageData?.meta_keywords || [];

  // Ensure title includes brand name if not already present
  const finalTitle = apiMetaTitle.includes('Find Your Stays')
    ? apiMetaTitle
    : `${apiMetaTitle} | Find Your Stays`;

  // Create comprehensive keywords combining API keywords with dynamic ones
  const dynamicKeywords = [
    pageSlug,
    'Find Your Stays',
    'real estate',
    'property',
    'company',
    pageData?.title || 'page',
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

    // SEO keywords using API data
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

    // Twitter Card tags
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: finalTitle },
    { name: 'twitter:description', content: apiMetaDescription },

    // Additional SEO tags
    { name: 'author', content: 'Find Your Stays' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'en' },
    { name: 'revisit-after', content: '7 days' },
    { property: 'article:section', content: 'Pages' },
    { name: 'theme-color', content: '#68418b' }, // Your brand color
    { name: 'msapplication-TileColor', content: '#68418b' },

    // Canonical URL
    { tagName: 'link', rel: 'canonical', href: pageUrl },

    // Schema.org structured data for WebPage
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: apiMetaTitle,
        description: apiMetaDescription,
        url: pageUrl,
        publisher: {
          '@type': 'Organization',
          name: 'Find Your Stays',
          url: domainUrl,
        },
        breadcrumb: {
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
              name: pageData?.title || 'Page',
              item: pageUrl,
            },
          ],
        },
        keywords: uniqueKeywords.join(', '),
      }),
    },
  ];
}

function About() {
  const params = useParams();
  const loaderData = useLoaderData();

  // Use API data if available, otherwise fallback to static content
  const pageTitle = loaderData?.pageTitle || 'Page';
  const pageContent = loaderData?.pageContent;
  const pageSlug = loaderData?.pageSlug || params.slug || 'about-us';

  // Check if page was found
  const isPageNotFound = loaderData?.pageTitle === 'Page Not Found';

  return (
    <>
      <Breadcrumb title={pageTitle} />
      <section className="about-section">
        <div className="container">
          {!isPageNotFound && (
            <div className="row">
              <div className="col-lg-6 offset-lg-3">
                <div className="main-title text-center">
                  <h1 className="mt0">
                    {pageSlug === 'about-us'
                      ? 'Our Mission Is To Find Your Stays'
                      : pageTitle}
                  </h1>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic content from API */}
          <div className="row">
            <div className="col-lg-12">
              <div className="about_content">
                {pageContent ? (
                  <div dangerouslySetInnerHTML={{ __html: pageContent }} />
                ) : (
                  <p>No content available for this page.</p>
                )}
              </div>
            </div>
          </div>

          {/* Only show counter block and "Why Choose Us" for about-us page */}
          {pageSlug === 'about-us' && (
            <>
              <CounterBlock themes={'about'} />

              <div className="row mt50">
                <div className="col-lg-6 offset-lg-3">
                  <div className="main-title text-center">
                    <h2>Why Choose Us</h2>
                    <p>We provide full service at every step.</p>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6 col-lg col-xl p0">
                  <div className="why_chose_us home6">
                    <div className="icon">
                      <span className="flaticon-magnifying-glass" />
                    </div>
                    <div className="details">
                      <h4>Explore Every Available Option</h4>
                      <p>
                        Find Your Stays simplifies your search by listing all
                        available properties and recommending the best-fit
                        choices - so you skip the hassle of endless scrolling
                        and focus only on what matters.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg col-xl p0">
                  <div className="why_chose_us home6">
                    <div className="icon">
                      <span className="flaticon-percent" />
                    </div>
                    <div className="details">
                      <h4>Get the Best Deal Terms</h4>
                      <p>
                        We handle the negotiations for you - ensuring the most
                        competitive prices and flexible terms, whether you're a
                        student or working professional looking for smart living
                        options.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg col-xl p0">
                  <div className="why_chose_us home6">
                    <div className="icon">
                      <span className="flaticon-money-bag" />
                    </div>
                    <div className="details">
                      <h4>Enjoy Zero Brokerage Fees</h4>
                      <p>
                        With Find Your Stays, you don't pay any brokerage. Our
                        platform is completely free to use - giving you full
                        transparency and savings while finding your ideal rental
                        without hidden charges.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg col-xl p0">
                  <div className="why_chose_us home6">
                    <div className="icon">
                      <span className="flaticon-smartphone-call" />
                    </div>
                    <div className="details">
                      <h4>Access 24/7 Assistance Anytime</h4>
                      <p>
                        Our dedicated customer support team is available round
                        the clock to resolve queries, offer recommendations, or
                        help you through any issue - any time, any day of the
                        week.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg col-xl p0">
                  <div className="why_chose_us home6">
                    <div className="icon">
                      <span className="flaticon-high-five" />
                    </div>
                    <div className="details">
                      <h4>Book with Trusted Hosts</h4>
                      <p>
                        Every host listed on Find Your Stays is background -
                        verified to ensure your peace of mind. We prioritize
                        your safety by working only with reliable and thoroughly
                        screened property partners.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default About;
