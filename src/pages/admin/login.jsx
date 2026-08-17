import { useContext, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import toast from 'react-hot-toast';
import { Loader } from 'rsuite';
import Button from '../../components/ui/Button';

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
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Login to your account</h2>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-coral focus:border-coral sm:text-sm"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={viewPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-coral focus:border-coral sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              onClick={() => setViewPassword(!viewPassword)}
            >
              <i className={viewPassword ? 'fa fa-eye-slash' : 'fa fa-eye'} aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div>
          <Button
            label={loader ? "Please Wait" : "Login"}
            size="lg"
            variant='primary'
            disabled={loader}
            block={true}
            type='submit'
            loading={loader}
          />
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-center text-sm text-gray-600">
          Don't have an account? <span className="font-medium text-coral!">Contact Admin.</span>
        </p>
      </div>
    </div>
  );
}

export default login;
