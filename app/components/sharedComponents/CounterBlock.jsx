import { useEffect, useState } from 'react';
import { apiUrl } from '../../../envConfig';

function CounterBlock({ themes }) {
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const get_all_counters = () => {
      fetch(apiUrl + 'website/get-all-counters', {
        headers: {
          Accept: 'application/json',
        },
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.status) setCounters(json.data);
          else setCounters([]);
        })
        .catch(() => toast.error('Failed to fetch counters.'))
        .finally(() => setLoading(false));
    };
    get_all_counters();
  }, []);

  return loading ? (
    <div className="row">
      <div className="col-lg-12">
        <h4
          className={`text-center fw600 mb25 mb0-520 ${
            themes === 'about' ? 'text-thm mt50' : 'text-white'
          }`}
        >
          The easiest and most reliable way to find safe, comfortable shared
          living spaces you can trust.
        </h4>
        <ul className="home4_iconbox mb0">
          <li className="list-inline-item">
            <div className="icon text-center">
              <p>
                <span className="text-thm2 pr-0">...</span>
              </p>
              <p>...</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  ) : (
    counters.length > 0 && (
      <div className="row">
        <div className="col-lg-12">
          <h4
            className={`text-center fw600 mb25 mb0-520 ${
              themes === 'about' ? 'text-thm mt50' : 'text-white'
            }`}
          >
            The easiest and most reliable way to find safe, comfortable shared
            living spaces you can trust.
          </h4>
          <ul className="home4_iconbox mb0">
            {counters.map((counter, index) => (
              <li key={index} className="list-inline-item">
                <div className="icon text-center">
                  <p>
                    <span className="text-thm2 pr-0">{counter.count} +</span>
                  </p>
                  <p>{counter.counter_title}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  );
}

export default CounterBlock;
