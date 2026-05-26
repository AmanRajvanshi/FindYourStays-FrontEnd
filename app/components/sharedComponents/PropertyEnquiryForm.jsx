import { useState } from 'react';
import toast from 'react-hot-toast';
import { Form, Input, Loader } from 'rsuite';
import { apiUrl } from '../../../envConfig';

function PropertyEnquiryForm({ id, onSuccess }) {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    loader: false,
  });

  const add_property_enquiries = () => {
    if (!formValues.name) {
      toast.error('Please enter your name.');
      return;
    }
    if (!formValues.email) {
      toast.error('Please enter your email.');
      return;
    }
    if (!formValues.phone) {
      toast.error('Please enter your phone.');
      return;
    }
    if (!formValues.message) {
      toast.error('Please enter your message.');
      return;
    }
    setFormValues({ ...formValues, loader: true });
    fetch(apiUrl + 'website/add-property-enquiries', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        message: formValues.message,
        property_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setFormValues({
            name: '',
            email: '',
            phone: '',
            message: '',
            loader: false,
          });
          toast.success(json.message);
          if (onSuccess) {
            onSuccess();
          }
        } else {
          toast.error(json.message);
          setFormValues({ ...formValues, loader: false });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <Form fluid>
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
          placeholder="Enter Your Message"
        />
      </Form.Group>
      <button
        type="submit"
        className="btn btn-block btn-thm mt-4 py-2"
        disabled={formValues.loader}
        onClick={(e) => {
          e.preventDefault();
          add_property_enquiries();
        }}
      >
        {formValues.loader ? (
          <Loader content="Submitting..." />
        ) : (
          'Submit Your Query'
        )}
      </button>
    </Form>
  );
}

export default PropertyEnquiryForm;
