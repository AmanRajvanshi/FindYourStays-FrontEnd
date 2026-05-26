import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLoaderData } from 'react-router';
import { Form, Input, Loader } from 'rsuite';
import { apiUrl, domainUrl } from '../../../envConfig';
import Breadcrumb from '../../components/sharedComponents/Breadcrumb';

export async function loader() {
  const pageReq = fetch(`${apiUrl}website/get-single-pages/contact-us`, {
    headers: { Accept: 'application/json' },
  });
  const compReq = fetch(`${apiUrl}website/get-company-details`, {
    headers: { Accept: 'application/json' },
  });

  let pageData = null;
  let companyDetails = null;

  try {
    const [pageRes, compRes] = await Promise.all([pageReq, compReq]);

    const pageJson = await pageRes.json();
    if (pageJson.status) pageData = pageJson.data;

    const compJson = await compRes.json();
    if (compJson.status) companyDetails = compJson.data;
  } catch (e) {
    console.error('Contact loader error:', e);
  }

  const safePage = pageData ?? {
    title: 'Contact Us',
    content: '',
    meta_title: 'Contact Us | Find Your Stays',
    meta_description:
      'Get in touch with Find Your Stays – wed love to hear from you!',
    meta_keywords: 'contact, Find Your Stays, real estate',
  };

  return {
    page: safePage,
    company: companyDetails,
    slug: 'contact-us',
  };
}

export function meta({ data }) {
  const { page, company } = data ?? {};

  // Use API meta fields with fallbacks
  const apiMetaTitle = page?.meta_title || 'Contact Us | Find Your Stays';
  const apiMetaDescription =
    page?.meta_description ||
    "Get in touch with Find Your Stays – we'd love to hear from you! Contact us for PG, hostel, co-living space inquiries and customer support.";
  const apiMetaKeywords = page?.meta_keywords || [];

  // Create comprehensive keywords combining API keywords with contact-specific ones
  const dynamicKeywords = [
    'contact',
    'Find Your Stays',
    'real estate',
    'customer support',
    'PG inquiries',
    'hostel booking',
    'co-living contact',
    'rental assistance',
    'property help',
    'accommodation support',
  ];

  // Combine API keywords with dynamic keywords and remove duplicates
  const allKeywords = Array.isArray(apiMetaKeywords)
    ? [...apiMetaKeywords, ...dynamicKeywords]
    : [apiMetaKeywords, ...dynamicKeywords].filter(Boolean);

  const uniqueKeywords = [...new Set(allKeywords.filter(Boolean))];

  const contactUrl = `${domainUrl}/${page?.slug}`;
  const companyName = company?.company_name || 'Find Your Stays';
  const companyPhone = company?.company_phone1 || '';
  const companyEmail = company?.company_email || '';
  const companyAddress = company?.company_address || '';

  return [
    { title: apiMetaTitle },
    { name: 'description', content: apiMetaDescription },

    // SEO keywords using API data + dynamic keywords
    {
      name: 'keywords',
      content: uniqueKeywords.join(', '),
    },

    // Open Graph tags
    { property: 'og:title', content: apiMetaTitle },
    { property: 'og:description', content: apiMetaDescription },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: contactUrl },
    { property: 'og:site_name', content: companyName },
    { property: 'og:locale', content: 'en_IN' },

    // Twitter Card tags
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: apiMetaTitle },
    { name: 'twitter:description', content: apiMetaDescription },

    // Additional SEO tags
    { name: 'author', content: companyName },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'en' },
    { name: 'revisit-after', content: '7 days' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'theme-color', content: '#68418b' },

    // Contact-specific meta tags
    { name: 'contact:phone_number', content: companyPhone },
    { name: 'contact:email', content: companyEmail },
    { name: 'contact:region', content: 'India' },

    // Geographic tags
    { name: 'geo.region', content: 'IN' },
    { name: 'geo.placename', content: 'India' },

    // Canonical URL
    { tagName: 'link', rel: 'canonical', href: contactUrl },

    // Schema.org structured data for Contact Page
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Us',
        description: apiMetaDescription,
        url: contactUrl,
        mainEntity: {
          '@type': 'Organization',
          name: companyName,
          url: domainUrl,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: companyPhone ? `+91-${companyPhone}` : '',
            email: companyEmail,
            contactType: 'customer service',
            areaServed: 'IN',
            availableLanguage: 'English',
          },
          address: companyAddress
            ? {
                '@type': 'PostalAddress',
                streetAddress: companyAddress,
                addressCountry: 'India',
              }
            : undefined,
          sameAs: [
            company?.company_facebook,
            company?.company_twitter,
            company?.company_instagram,
            company?.company_linkedin,
            company?.company_youtube,
          ].filter((link) => link && link !== '#'),
        },
      }),
    },

    // Local Business Schema (if you have physical location)
    ...(companyAddress
      ? [
          {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: companyName,
              description:
                'Leading platform for PG, hostel, and co-living accommodations',
              url: domainUrl,
              telephone: companyPhone ? `+91-${companyPhone}` : '',
              email: companyEmail,
              address: {
                '@type': 'PostalAddress',
                streetAddress: companyAddress,
                addressCountry: 'India',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: '28.7041', // You can make this dynamic
                longitude: '77.1025',
              },
              openingHours: 'Mo-Su 00:00-23:59', // 24/7 if applicable
              priceRange: '$$',
              servesCuisine: 'Accommodation Services',
              serviceArea: {
                '@type': 'Country',
                name: 'India',
              },
            }),
          },
        ]
      : []),

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
            name: 'Contact Us',
            item: contactUrl,
          },
        ],
      }),
    },
  ];
}

export default function Contact() {
  const { page, company } = useLoaderData();
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    loader: false,
  });

  const companyName = company?.company_name ?? 'Find Your Stays';
  const address =
    company?.company_address ?? '2301 Ravenswood Rd Madison, WI 53711';
  const phone1 = company?.company_phone1 ?? '(315) 905-2321';
  const phone2 = company?.company_phone2;
  const email = company?.company_email ?? 'info@Find Your Stays.com';
  const facebook = company?.company_facebook ?? '#';
  const twitter = company?.company_twitter ?? '#';
  const instagram = company?.company_instagram ?? '#';
  const linkedin = company?.company_linkedin ?? '#';
  const youtube = company?.company_youtube ?? '#';
  const google = company?.company_google ?? '#';

  const add_contact_enquiries = () => {
    setFormValues({ ...formValues, loader: true });
    fetch(apiUrl + 'website/add-contact-enquiries', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formValues),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          toast.success(json.message);
          setFormValues({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
            loader: false,
          });
        } else {
          toast.error(json.message);
          setFormValues({ ...formValues, loader: false });
        }
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setFormValues({ ...formValues, loader: false });
      });
  };

  return (
    <>
      <Breadcrumb title={page.title || 'Contact Us'} />

      <section className="our-contact pb250 bgc-f7">
        <div className="container">
          <div className="row">
            <div className="col-lg-7 col-xl-8">
              <div className="form_grid">
                <Form fluid>
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <Form.Group controlId="name">
                        <Form.ControlLabel>
                          Your Name
                          <span className="text-danger">*</span>
                        </Form.ControlLabel>
                        <Form.Control
                          name="name"
                          placeholder="Enter Your Name"
                          value={formValues.name}
                          onChange={(e) => {
                            setFormValues({ ...formValues, name: e });
                          }}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Group controlId="email">
                        <Form.ControlLabel>
                          Your Email
                          <span className="text-danger">*</span>
                        </Form.ControlLabel>
                        <Form.Control
                          name="email"
                          placeholder="Enter Your Email"
                          value={formValues.email}
                          onChange={(e) => {
                            setFormValues({ ...formValues, email: e });
                          }}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-3">
                      <Form.Group controlId="phone">
                        <Form.ControlLabel>
                          Your Phone
                          <span className="text-danger">*</span>
                        </Form.ControlLabel>
                        <Form.Control
                          name="phone"
                          placeholder="Enter Your Phone"
                          value={formValues.phone}
                          onChange={(e) => {
                            setFormValues({ ...formValues, phone: e });
                          }}
                          maxLength={10}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-12 mb-3">
                      <Form.Group controlId="subject">
                        <Form.ControlLabel>
                          Your Subject
                          <span className="text-danger">*</span>
                        </Form.ControlLabel>
                        <Form.Control
                          name="subject"
                          placeholder="Enter Your subject"
                          value={formValues.subject}
                          onChange={(e) => {
                            setFormValues({ ...formValues, subject: e });
                          }}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-12">
                      <Form.Group controlId="message">
                        <Form.ControlLabel>
                          Your Message
                          <span className="text-danger">*</span>
                        </Form.ControlLabel>
                        <Input
                          name="message"
                          as="textarea"
                          rows={3}
                          value={formValues.message}
                          onChange={(e) => {
                            setFormValues({ ...formValues, message: e });
                          }}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-12">
                      <button
                        type="submit"
                        className="btn btn-block btn-thm mt-4 py-2"
                        disabled={formValues.loader}
                        onClick={(e) => {
                          e.preventDefault();
                          add_contact_enquiries();
                        }}
                      >
                        {formValues.loader ? (
                          <Loader content="Submitting..." />
                        ) : (
                          'Submit Your Query'
                        )}
                      </button>
                    </div>
                  </div>
                </Form>
              </div>
            </div>

            <div className="col-lg-5 col-xl-4">
              <div className="contact_localtion">
                <div className="content_list mb-4">
                  <h4>Contact Us</h4>
                  <p
                    className="mb-0"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                </div>

                <div className="content_list mb-4">
                  <h5>Address</h5>
                  <p className="mb-0">{address}</p>
                </div>

                <div className="content_list mb-4">
                  <h5>Phone</h5>
                  <a href={`tel:+91${phone1}`}>+91 {phone1}</a>
                  {phone2 && <a href={`tel:+91${phone2}`}>+91 {phone2}</a>}
                </div>

                <div className="content_list mb-4">
                  <h5>Mail</h5>
                  <a href={`mailto:${email}`}>{email}</a>
                </div>

                <h5>Follow Us</h5>
                <ul className="contact_form_social_area">
                  {facebook && facebook !== '#' && (
                    <li className="list-inline-item">
                      <a
                        href={facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fa fa-facebook" />
                      </a>
                    </li>
                  )}
                  {twitter && twitter !== '#' && (
                    <li className="list-inline-item">
                      <a
                        href={twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fa fa-twitter" />
                      </a>
                    </li>
                  )}
                  {instagram && instagram !== '#' && (
                    <li className="list-inline-item">
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fa fa-instagram" />
                      </a>
                    </li>
                  )}
                  {linkedin && linkedin !== '#' && (
                    <li className="list-inline-item">
                      <a
                        href={linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fa fa-linkedin" />
                      </a>
                    </li>
                  )}
                  {youtube && youtube !== '#' && (
                    <li className="list-inline-item">
                      <a
                        href={youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fa fa-youtube" />
                      </a>
                    </li>
                  )}
                  {google && google !== '#' && (
                    <li className="list-inline-item">
                      <a
                        href={google}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fa fa-google" />
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
