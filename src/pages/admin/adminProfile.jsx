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
    <div className="flex flex-wrap">
      <div className="col-lg-12 mb10">
        <div className="breadcrumb_content style2">
          <h2 className="breadcrumb_title">My Profile</h2>
        </div>
      </div>
      <div className="col-lg-12 mb10">
        <Form fluid>
          <div className="flex flex-wrap">
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="name">
                <Form.ControlLabel>
                  Company Name
                  <span className="text-red-500">*</span>
                </Form.ControlLabel>
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
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="email">
                <Form.ControlLabel>
                  Company Email
                  <span className="text-red-500">*</span>
                </Form.ControlLabel>
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
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="phone1">
                <Form.ControlLabel>
                  Company Phone 1<span className="text-red-500">*</span>
                </Form.ControlLabel>
                <Form.Control
                  name="phone1"
                  value={companyDetails.company_phone1}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_phone1: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="phone2">
                <Form.ControlLabel>Company Phone 2</Form.ControlLabel>
                <Form.Control
                  name="phone2"
                  value={companyDetails.company_phone2}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_phone2: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="address">
                <Form.ControlLabel>
                  Company Address
                  <span className="text-red-500">*</span>
                </Form.ControlLabel>
                <Form.Control
                  name="address"
                  value={companyDetails.company_address}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_address: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-6 mb-3"></div>
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="facebook">
                <Form.ControlLabel>Company Facebook</Form.ControlLabel>
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
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="twitter">
                <Form.ControlLabel>Company Twitter</Form.ControlLabel>
                <Form.Control
                  name="twitter"
                  value={companyDetails.company_twitter}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_twitter: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="instagram">
                <Form.ControlLabel>Company Instagram</Form.ControlLabel>
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
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="linkedin">
                <Form.ControlLabel>Company Linkedin</Form.ControlLabel>
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
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="youtube">
                <Form.ControlLabel>Company Youtube</Form.ControlLabel>
                <Form.Control
                  name="youtube"
                  value={companyDetails.company_youtube}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_youtube: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-6 mb-3">
              <Form.Group controlId="google">
                <Form.ControlLabel>Company Google</Form.ControlLabel>
                <Form.Control
                  name="google"
                  value={companyDetails.company_google}
                  onChange={(e) =>
                    setCompanyDetails({ ...companyDetails, company_google: e })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-lg-12 mt-3 flex justify-end">
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
