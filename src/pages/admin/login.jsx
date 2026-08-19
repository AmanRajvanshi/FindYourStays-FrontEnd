import { useContext, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiUrl } from '../../envConfig';
import { AuthContext } from '../../AuthContextProvider';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Login() {
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
    <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-lg border border-line">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-ink">Login to your account</h2>
          <p className="text-sm text-muted mt-1">Enter your credentials to continue</p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email Address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted/60 focus:outline-none focus:ring-coral focus:border-coral sm:text-sm"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={viewPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted/60 focus:outline-none focus:ring-coral focus:border-coral sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="custom-eye"
              onClick={() => setViewPassword(!viewPassword)}
            >
              <FontAwesomeIcon icon={viewPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        <div>
          <Button
            size="lg"
            block
            disabled={loader}
            type="submit"
            loading={loader}
          >
            {loader ? 'Please Wait' : 'Login'}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-center text-sm text-muted">
          Don't have an account? <span className="font-medium text-coral">Contact Admin.</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
