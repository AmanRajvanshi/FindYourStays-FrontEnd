import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiUrl, domainUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';

const statusColors = {
  pending: 'warning',
  responded: 'info',
  resolved: 'success',
  reopened: 'danger',
  closed: 'secondary',
};

const statusLabels = {
  pending: 'Pending',
  responded: 'Responded',
  resolved: 'Resolved',
  reopened: 'Reopened',
  closed: 'Closed',
};

export default function Enquiries() {
  const { authData } = useContext(AuthContext);
  const [propertyEnquiries, setPropertyEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    get_property_enquiries();
  }, []);

  const get_property_enquiries = () => {
    fetch(apiUrl + 'admin/get-property-enquiries', {
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
          setPropertyEnquiries(json.data);
          setShowNoData(false);
        } else {
          setShowNoData(true);
        }
      })
      .catch((error) => console.error('Error:', error))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = (id, currentStatus) => {
    Swal.fire({
      input: 'select',
      inputOptions: statusLabels,
      title: 'Update Enquiry Status',
      text: 'Change the status of this enquiry.',
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${apiUrl}admin/update-property-enquiries/${id}`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authData.token,
          },
          body: JSON.stringify({ status: result.value }),
        })
          .then((res) => res.json())
          .then((json) => {
            if (json.status) {
              toast.success('Enquiry status updated!');
              setPropertyEnquiries((prev) =>
                prev.map((e) =>
                  e.id === id ? { ...e, status: json.data.status } : e
                )
              );
            } else {
              toast.error('Failed to update.');
            }
          })
          .catch(() => toast.error('Update failed.'));
      }
    });
  };

  if (loading) return <DataLoader />;

  if (showNoData)
    return (
      <NoDataFound message="No property enquiries found." showButton={false} />
    );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-ink">Property Enquiries</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {propertyEnquiries.map((enquiry, index) => (
          <div className="bg-white rounded-xl shadow-sm border border-line overflow-hidden hover:shadow-md transition-shadow" key={enquiry.id}>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">#{index + 1}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        enquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        enquiry.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        enquiry.status === 'responded' ? 'bg-blue-100 text-blue-800' :
                        'bg-section text-ink'
                      }`}
                      onClick={() => handleUpdateStatus(enquiry.id, enquiry.status)}
                    >
                      {statusLabels[enquiry.status] || enquiry.status}
                    </span>
                  </div>
                  <a
                    href={`${domainUrl}single-property/${enquiry.property?.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink hover:text-coral transition-colors"
                  >
                    <h4 className="text-lg font-bold m-0 leading-tight">
                      {enquiry.property?.property_title || 'N/A'}
                    </h4>
                  </a>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted m-0">
                    {moment(enquiry.created_at).format('DD MMM YYYY')}
                  </p>
                  <p className="text-xs text-muted m-0">
                    {moment(enquiry.created_at).format('hh:mm A')}
                  </p>
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
    </div>
  );
}
