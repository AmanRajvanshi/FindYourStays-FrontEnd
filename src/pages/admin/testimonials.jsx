import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Image, Table } from 'rsuite';
import Swal from 'sweetalert2';
import { apiUrl, imageUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import TestimonialModal from '../../components/adminComponents/TestimonialModal';
import DataLoader from '../../components/sharedComponents/DataLoader';
import NoDataFound from '../../components/sharedComponents/NoDataFound';
import Button from '../../components/ui/Button';

const { Column, HeaderCell, Cell } = Table;

function Testimonials() {
  const { authData } = useContext(AuthContext);
  const [openTestimonialModal, setOpenTestimonialModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [testimonialsData, setTestimonialsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    get_all_testimonials();
  }, []);

  const get_all_testimonials = () => {
    fetch(apiUrl + 'admin/get-all-testimonials', {
      headers: {
        Authorization: authData.token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          setTestimonialsData(json.data);
          setShowNoData(false);
        } else {
          setShowNoData(true);
        }
      })
      .catch(() => setShowNoData(true))
      .finally(() => setLoading(false));
  };

  const handleEdit = (data) => {
    setEditData(data);
    setOpenTestimonialModal(true);
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: `Delete testimonial from ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${apiUrl}admin/delete-testimonial/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: authData.token,
          },
        })
          .then((res) => res.json())
          .then((json) => {
            if (json.success) {
              toast.success('Deleted successfully!');
              get_all_testimonials();
            } else {
              toast.error('Failed to delete.');
            }
          })
          .catch(() => toast.error('Delete failed.'));
      }
    });
  };

  if (loading) return <DataLoader />;

  const testimonials = testimonialsData.map((item, index) => ({
    ...item,
    key: index,
  }));

  return (
    <>
      {showNoData ? (
        <NoDataFound
          name="Testimonials"
          message="No testimonials found, kindly add a new testimonial!"
          showButton={true}
          handleClick={() => {
            setEditData(null);
            setOpenTestimonialModal(true);
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="mb-0">Testimonials</h2>
            <Button
               appearance="primary"
              onClick={() => {
                setEditData(null);
                setOpenTestimonialModal(true);
              }}
            >
              + Add Testimonial
            </Button>
          </div>

          <Table
            data={testimonials}
            hover
            showHeader
            bordered
            cellBordered
            autoHeight
            rowHeight={45}
            headerHeight={40}
          >
            <Column width={80} align="center">
              <HeaderCell>S. No.</HeaderCell>
              <Cell>{(_, index) => index + 1}</Cell>
            </Column>

            <Column flexGrow={1}>
              <HeaderCell>Feedbacker Name</HeaderCell>
              <Cell>
                {(rowData) => (
                  <div className="flex items-center gap-2">
                    <Image
                      circle
                      src={`${imageUrl}${rowData.image}`}
                      width={30}
                      height={30}
                      alt={rowData.name}
                    />
                    <span>{rowData.name}</span>
                  </div>
                )}
              </Cell>
            </Column>

            <Column flexGrow={2}>
              <HeaderCell>Testimonial</HeaderCell>
              <Cell dataKey="description" />
            </Column>

            <Column width={150}>
              <HeaderCell>Action</HeaderCell>
              <Cell>
                {(rowData) => (
                  <div className="flex gap-2">
                    <Button
                       appearance="primary" size="sm"
                      onClick={() => handleEdit(rowData)}
                    >
                      Edit
                    </Button>
                    <Button
                       appearance="primary" color="red" size="sm"
                      onClick={() => handleDelete(rowData.id, rowData.name)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </Cell>
            </Column>
          </Table>
        </>
      )}
      <TestimonialModal
        open={openTestimonialModal}
        setOpen={setOpenTestimonialModal}
        edit={!!editData}
        initialData={editData}
        authToken={authData.token} // ✅ Pass token
        onSuccess={() => get_all_testimonials()} // ✅ Refetch after save
        onDelete={(id) => handleDelete(id, editData?.name)}
      />
    </>
  );
}

export default Testimonials;
