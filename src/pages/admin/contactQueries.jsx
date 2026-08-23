import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import PageLayout from '../../components/sharedComponents/PageLayout';

const statusLabels = { pending: 'Pending', responded: 'Responded', resolved: 'Resolved', reopened: 'Reopened', closed: 'Closed' };

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  responded: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  reopened: 'bg-red-50 text-red-700 border-red-200',
  closed: 'bg-line/60 text-muted border-line',
};

export default function ContactQueries() {
  const { authData } = useContext(AuthContext);
  const [contactEnquiries, setContactEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => { get_all_contact_enquiries(); }, []);

  const get_all_contact_enquiries = () => {
    fetch(apiUrl + 'admin/get-all-contact-enquiries', {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
    })
      .then((response) => response.json())
      .then((json) => { if (json.status) { setContactEnquiries(json.data); setShowNoData(false); } else { setShowNoData(true); } })
      .catch((error) => console.error('Error:', error))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = (id, currentStatus) => {
    Swal.fire({ input: 'select', inputOptions: statusLabels, title: 'Update Enquiry Status', text: 'Change the status of this enquiry.', inputValue: currentStatus, showCancelButton: true, confirmButtonText: 'Update', cancelButtonText: 'Cancel' })
      .then((result) => {
        if (result.isConfirmed) {
          fetch(`${apiUrl}admin/edit-contact-enquiries/${id}`, {
            method: 'PUT',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData.token },
            body: JSON.stringify({ status: result.value }),
          })
            .then((res) => res.json())
            .then((json) => { if (json.status) { toast.success('Enquiry status updated successfully!'); setContactEnquiries((prev) => prev.map((e) => e.id === id ? { ...e, status: json.data.status } : e)); } else { toast.error('Failed to update.'); } })
            .catch(() => toast.error('Update failed.'));
        }
      });
  };

  if (loading) return <DataLoader />;
  if (showNoData) return <NoDataFound message="No contact enquiries found." showButton={false} />;

  return (
    <PageLayout title="Contact Enquiries" subtitle="View and manage contact form submissions." flush>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {contactEnquiries.map((enquiry, index) => (
          <div className="bg-white rounded-xl shadow-sm border border-line/50 overflow-hidden hover:shadow-md transition-shadow" key={enquiry.id}>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">#{index + 1}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer ${statusStyles[enquiry.status] || 'bg-line/60 text-muted border-line'}`}
                      onClick={() => handleUpdateStatus(enquiry.id, enquiry.status)}
                    >
                      {statusLabels[enquiry.status] || enquiry.status}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-ink m-0 leading-tight">{enquiry.subject || 'General Enquiry'}</h4>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted m-0">{moment(enquiry.created_at).format('DD MMM YYYY')}</p>
                  <p className="text-xs text-muted m-0">{moment(enquiry.created_at).format('hh:mm A')}</p>
                </div>
              </div>

              <div className="bg-section rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <p className="text-xs text-muted mb-0.5">Name</p>
                  <p className="text-sm font-medium text-ink m-0">{enquiry.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-ink m-0">{enquiry.phone || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-muted mb-0.5">Email</p>
                  <p className="text-sm font-medium text-ink m-0">{enquiry.email}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted mb-1">Message</p>
                <p className="text-sm text-ink m-0 leading-relaxed bg-white border border-line rounded-lg p-3">
                  {enquiry.message || <span className="text-muted italic">No message provided</span>}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
