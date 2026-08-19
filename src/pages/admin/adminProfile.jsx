import { useContext, useEffect, useState } from 'react';
import { Form } from 'rsuite';
import { AuthContext } from '../../AuthContextProvider';
import toast from 'react-hot-toast';
import { apiUrl } from '../../envConfig';
import DataLoader from '../../components/sharedComponents/DataLoader';
import Button from '../../components/ui/Button';

function adminProfile() {
  const { authData } = useContext(AuthContext);
  const [companyDetails, setCompanyDetails] = useState({
    id: '',
    company_name: '',
    company_email: '',
    company_phone1: '',
    company_phone2: '',
    company_address: '',
    company_facebook: '',
    company_twitter: '',
    company_instagram: '',
    company_linkedin: '',
    company_youtube: '',
    company_google: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl + 'admin/get-company-details', {
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
          setCompanyDetails({
            id: json.data.id,
            company_name: json.data.company_name,
            company_email: json.data.company_email,
            company_phone1: json.data.company_phone1,
            company_phone2: json.data.company_phone2,
            company_address: json.data.company_address,
            company_facebook: json.data.company_facebook,
            company_twitter: json.data.company_twitter,
            company_instagram: json.data.company_instagram,
            company_linkedin: json.data.company_linkedin,
            company_youtube: json.data.company_youtube,
            company_google: json.data.company_google,
          });
        } else {
          console.error(json.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const update_company_details = () => {
    fetch(apiUrl + 'admin/update-company-details', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData.token,
      },
      body: JSON.stringify(companyDetails),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          toast.success(json.message);
        } else {
          toast.error(json.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return <DataLoader />;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-ink m-0">My Profile</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-line">
        <Form fluid>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <Form.Group controlId="name">
                <Form.Label className="font-semibold text-ink mb-2">
                  Company Name
                  <span className="text-red-500">*</span>
                </Form.Label>
                <Form.Control
                  name="name"
                  value={companyDetails.company_name}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      company_name: e,
                    })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1">
              <Form.Group controlId="email">
                <Form.Label className="font-semibold text-ink mb-2">
                  Company Email
                  <span className="text-red-500">*</span>
                </Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={companyDetails.company_email}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_email: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1">
              <Form.Group controlId="phone1">
                <Form.Label className="font-semibold text-ink mb-2">
                  Company Phone 1<span className="text-red-500">*</span>
                </Form.Label>
                <Form.Control
                  name="phone1"
                  value={companyDetails.company_phone1}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_phone1: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1">
              <Form.Group controlId="phone2">
                <Form.Label className="font-semibold text-ink mb-2">Company Phone 2</Form.Label>
                <Form.Control
                  name="phone2"
                  value={companyDetails.company_phone2}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_phone2: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1">
              <Form.Group controlId="address">
                <Form.Label className="font-semibold text-ink mb-2">
                  Company Address
                  <span className="text-red-500">*</span>
                </Form.Label>
                <Form.Control
                  name="address"
                  value={companyDetails.company_address}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_address: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="hidden md:block"></div>
            <div className="col-span-1">
              <Form.Group controlId="facebook">
                <Form.Label className="font-semibold text-ink mb-2">Company Facebook</Form.Label>
                <Form.Control
                  name="facebook"
                  value={companyDetails.company_facebook}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      company_facebook: e,
                    })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1">
              <Form.Group controlId="twitter">
                <Form.Label className="font-semibold text-ink mb-2">Company Twitter</Form.Label>
                <Form.Control
                  name="twitter"
                  value={companyDetails.company_twitter}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_twitter: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1">
              <Form.Group controlId="instagram">
                <Form.Label className="font-semibold text-ink mb-2">Company Instagram</Form.Label>
                <Form.Control
                  name="instagram"
                  value={companyDetails.company_instagram}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      company_instagram: e,
                    })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1">
              <Form.Group controlId="linkedin">
                <Form.Label className="font-semibold text-ink mb-2">Company Linkedin</Form.Label>
                <Form.Control
                  name="linkedin"
                  value={companyDetails.company_linkedin}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      company_linkedin: e,
                    })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1">
              <Form.Group controlId="youtube">
                <Form.Label className="font-semibold text-ink mb-2">Company Youtube</Form.Label>
                <Form.Control
                  name="youtube"
                  value={companyDetails.company_youtube}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_youtube: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1">
              <Form.Group controlId="google">
                <Form.Label className="font-semibold text-ink mb-2">Company Google</Form.Label>
                <Form.Control
                  name="google"
                  value={companyDetails.company_google}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_google: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
              <Button
                appearance="primary"
                type="submit"
                onClick={() => {
                  update_company_details();
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default adminProfile;
