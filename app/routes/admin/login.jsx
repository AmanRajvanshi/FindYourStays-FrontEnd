import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { apiUrl } from '../../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import toast from 'react-hot-toast';
import { Loader } from 'rsuite';

function login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [viewPassword, setViewPassword] = useState(false);
  const [loader, setLoader] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoader(true);
    fetch(apiUrl + 'admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          const data = {
            user: json.user,
            token: 'Bearer ' + json.token,
          };
          localStorage.setItem('@authLoginData', JSON.stringify(data));
          toast.success('Login successful');
          navigate('/admin/dashboard');
          login(json.user, 'Bearer ' + json.token);
        } else {
          toast.error(json.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoader(false);
      });
  };
  return (
    <section className="our-log bgc-fa">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-lg-6 offset-lg-3">
            <div className="login_form inner_page">
              <form onSubmit={handleSubmit}>
                <div className="heading">
                  <h2 className="text-center">Login to your account</h2>
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    className="form-control"
                    id="exampleInputEmail3"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group exampleInputPassword4">
                  <input
                    type={viewPassword ? 'text' : 'password'}
                    className="form-control"
                    id="exampleInputPassword4"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {viewPassword ? (
                    <i
                      className="fa fa-eye-slash custom-eye"
                      onClick={() => setViewPassword(false)}
                    ></i>
                  ) : (
                    <i
                      className="fa fa-eye custom-eye"
                      onClick={() => setViewPassword(true)}
                    ></i>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-block btn-thm"
                  disabled={loader}
                  style={{ cursor: loader ? 'wait' : 'pointer' }}
                >
                  {loader ? (
                    <Loader size="sm" content="Please Wait" />
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
            </div>
            <p className="text-sm text-center mt20">
              Don't have an account? Contact Admin.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default login;
