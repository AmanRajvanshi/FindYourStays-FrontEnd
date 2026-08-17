import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiUrl } from '../../envConfig';
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

export default function ContactQueries() {
  const { authData } = useContext(AuthContext);
  const [contactEnquiries, setContactEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    get_all_contact_enquiries();
  }, []);

  const get_all_contact_enquiries = () => {
    fetch(apiUrl + 'admin/get-all-contact-enquiries', {
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
          setContactEnquiries(json.data);
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
      customClass: {
        input: 'border-0',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${apiUrl}admin/edit-contact-enquiries/${id}`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authData.token,
          },
          body: JSON.stringify({
            status: result.value,
          }),
        })
          .then((res) => res.json())
          .then((json) => {
            if (json.status) {
              toast.success('Enquiry status updated successfully!');
              setContactEnquiries((prev) =>
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
      <NoDataFound message="No contact enquiries found." showButton={false} />
    );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contact Enquiries</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {contactEnquiries.map((enquiry, index) => (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow" key={enquiry.id}>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">#{index + 1}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        enquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        enquiry.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        enquiry.status === 'responded' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                      onClick={() => handleUpdateStatus(enquiry.id, enquiry.status)}
                    >
                      {statusLabels[enquiry.status] || enquiry.status}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 m-0 leading-tight">
                    {enquiry.subject || 'General Enquiry'}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400 m-0">
                    {moment(enquiry.created_at).format('DD MMM YYYY')}
                  </p>
                  <p className="text-xs text-gray-400 m-0">
                    {moment(enquiry.created_at).format('hh:mm A')}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Name</p>
                  <p className="text-sm font-medium text-gray-900 m-0">{enquiry.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-gray-900 m-0">{enquiry.phone || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <p className="text-sm font-medium text-gray-900 m-0">{enquiry.email}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Message</p>
                <p className="text-sm text-gray-700 m-0 leading-relaxed bg-white border border-gray-100 rounded-lg p-3">
                  {enquiry.message || <span className="text-gray-400 italic">No message provided</span>}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
