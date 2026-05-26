import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiUrl } from '../../../envConfig';
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
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="mb-0 text-lg font-weight-bold">Contact Enquiries</h2>
      </div>
      <div className="row">
        {contactEnquiries.map((enquiry, index) => (
          <div className="col-12 col-lg-6 mb-3" key={enquiry.id}>
            <div className="card shadow-sm h-100 border">
              <div className="card-body py-3 px-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div className="mb-1">
                      <span className="text-muted">S.No. </span>
                      <span className="font-weight-bold">{index + 1}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`badge badge-${statusColors[enquiry.status] || 'secondary'} text-capitalize cursor-pointer`}
                      onClick={() =>
                        handleUpdateStatus(enquiry.id, enquiry.status)
                      }
                    >
                      {statusLabels[enquiry.status] || enquiry.status}
                    </span>
                    <p className="mt-1 m-0 text-muted">
                      {moment(enquiry.created_at).format('DD-MM-YYYY hh:mm A')}
                    </p>
                  </div>
                </div>
                <hr className="my-1" />
                <div className="row">
                  <div className="col-lg-6 mb-1">
                    <p className="font-weight-bold">
                      Name:{' '}
                      <span className="ml-1 font-weight-normal">
                        {enquiry.name}
                      </span>
                    </p>
                  </div>
                  <div className="col-lg-6 mb-1 text-right">
                    <p className="font-weight-bold">
                      Phone:{' '}
                      <span className="ml-1 font-weight-normal">
                        {enquiry.phone || 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div className="col-lg-12 mb-1">
                    <p className="font-weight-bold">
                      Email:{' '}
                      <span className="ml-1 font-weight-normal">
                        {enquiry.email}
                      </span>
                    </p>
                  </div>
                  <div className="col-lg-12 mb-1">
                    <p className="font-weight-bold">
                      Subject:{' '}
                      <span className="ml-1 font-weight-normal">
                        {enquiry.subject}
                      </span>
                    </p>
                  </div>
                  <div className="col-12">
                    <p className="card-text">{enquiry.message}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
