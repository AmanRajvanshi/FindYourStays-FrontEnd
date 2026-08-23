import React, { useContext, useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DataLoader from '../../components/sharedComponents/DataLoader';
import { AuthContext } from '../../AuthContextProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faEye, faComments, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { apiUrl } from '../../envConfig';

const HighchartsComponent = HighchartsReact.default || HighchartsReact.HighchartsReact || HighchartsReact;

const statCards = [
  { key: 'properties', label: 'All Properties', icon: faHouse, color: 'text-coral' },
  { key: 'views', label: 'Total Views', icon: faEye, color: 'text-blue-500' },
  { key: 'enquiries', label: 'New Enquiries', icon: faComments, color: 'text-emerald-500' },
  { key: 'contactEnquiries', label: 'Contact Enquiries', icon: faEnvelope, color: 'text-amber-500' },
];

function Dashboard() {
  const { authData } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ properties: 0, enquiries: 0, views: 0, contactEnquiries: 0 });
  const [graph, setGraph] = useState({ categories: [], series: [] });

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = () => {
    fetch(apiUrl + 'admin/get-dashboard-details', {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authData?.token || '' },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setStats({ properties: json.data.properties, enquiries: json.data.enquiries, views: json.data.views, contactEnquiries: json.data.contactEnquiries });
          setGraph(json.data.propertyGraph);
        }
      })
      .catch((error) => console.error('Error:', error))
      .finally(() => setLoading(false));
  };

  const options = {
    chart: { type: 'line' },
    title: { text: 'Properties Overview by Type' },
    xAxis: { categories: graph.categories, title: { text: 'Month' } },
    yAxis: { title: { text: 'Number of Properties' } },
    tooltip: { shared: true },
    series: graph.series,
  };

  if (loading) return <DataLoader />;

  return (
    <div className="space-y-6">
      <div className="border-b border-line/40 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Welcome Back</h2>
        <p className="text-sm text-muted mt-1">Here's what's happening with your properties today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.key} className="bg-white p-6 rounded-xl border border-line/50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="text-3xl font-bold text-ink">{stats[card.key]}</div>
              <p className="text-muted text-sm mt-1">{card.label}</p>
            </div>
            <div className={`${card.color} text-4xl opacity-80`}>
              <FontAwesomeIcon icon={card.icon} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-line/50 shadow-sm">
        <h4 className="text-lg font-semibold mb-4 text-ink">View Statistics</h4>
        <HighchartsComponent highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
}

export default Dashboard;
