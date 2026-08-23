import { useContext, useEffect, useState } from 'react';
import { Form } from 'rsuite';
import { AuthContext } from '../../AuthContextProvider';
import toast from 'react-hot-toast';
import { apiUrl } from '../../envConfig';
import DataLoader from '../../components/sharedComponents/DataLoader';
import PageLayout from '../../components/sharedComponents/PageLayout';
import Button from '../../components/ui/Button';

function AdminProfile() {
  const { authData } = useContext(AuthContext);
  const [companyDetails, setCompanyDetails] = useState({
    id: '', company_name: '', company_email: '', company_phone1: '', company_phone2: '',
    company_address: '', company_facebook: '', company_twitter: '', company_instagram: '',
    company_linkedin: '', company_youtube: '', company_google: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl + 'admin/get-company-details', {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status && json.data) {
          setCompanyDetails({
            id: json.data.id || '',
            company_name: json.data.company_name || '',
            company_email: json.data.company_email || '',
            company_phone1: json.data.company_phone1 || '',
            company_phone2: json.data.company_phone2 || '',
            company_address: json.data.company_address || '',
            company_facebook: json.data.company_facebook || '',
            company_twitter: json.data.company_twitter || '',
            company_instagram: json.data.company_instagram || '',
            company_linkedin: json.data.company_linkedin || '',
            company_youtube: json.data.company_youtube || '',
            company_google: json.data.company_google || '',
          });
        } else { console.error(json.message); }
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const update_company_details = () => {
    fetch(apiUrl + 'admin/update-company-details', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
      body: JSON.stringify(companyDetails),
    })
      .then((response) => response.json())
      .then((json) => { if (json.status) { toast.success(json.message); } else { toast.error(json.message); } })
      .catch((error) => toast.error(error.message));
  };

  if (loading) return <DataLoader />;

  const fields = [
    { label: 'Company Name', key: 'company_name', required: true },
    { label: 'Company Email', key: 'company_email', type: 'email', required: true },
    { label: 'Company Phone 1', key: 'company_phone1', required: true },
    { label: 'Company Phone 2', key: 'company_phone2' },
    { label: 'Company Address', key: 'company_address', required: true },
  ];

  const socialFields = [
    { label: 'Facebook', key: 'company_facebook' },
    { label: 'Twitter', key: 'company_twitter' },
    { label: 'Instagram', key: 'company_instagram' },
    { label: 'LinkedIn', key: 'company_linkedin' },
    { label: 'YouTube', key: 'company_youtube' },
    { label: 'Google', key: 'company_google' },
  ];

  return (
    <PageLayout title="Company Profile" subtitle="Update your company information and social media links."
      actionLabel="Submit" actionOnClick={update_company_details}>
      <Form fluid formValue={companyDetails} onChange={setCompanyDetails}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.key} className="col-span-1">
              <Form.Group controlId={field.key}>
                <Form.Label className="font-semibold text-muted text-sm mb-1.5 block">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Form.Label>
                <Form.Control name={field.key} type={field.type || 'text'} />
              </Form.Group>
            </div>
          ))}
          <div className="hidden md:block"></div>
          {socialFields.map((field) => (
            <div key={field.key} className="col-span-1">
              <Form.Group controlId={field.key}>
                <Form.Label className="font-semibold text-muted text-sm mb-1.5 block">Company {field.label}</Form.Label>
                <Form.Control name={field.key} />
              </Form.Group>
            </div>
          ))}
        </div>
      </Form>
    </PageLayout>
  );
}

export default AdminProfile;
