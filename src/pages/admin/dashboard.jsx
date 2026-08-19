import React, { useContext, useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DataLoader from '../../components/sharedComponents/DataLoader';
import { AuthContext } from '../../AuthContextProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faEye, faComments, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { apiUrl } from '../../envConfig';

// Handle ESM/CJS interop for HighchartsReact
const HighchartsComponent = HighchartsReact.default || HighchartsReact.HighchartsReact || HighchartsReact;

function Dashboard() {
  const { authData } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    properties: 0,
    enquiries: 0,
    views: 0,
    contactEnquiries: 0,
  });
  const [graph, setGraph] = useState({
    categories: [],
    series: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = () => {
    fetch(apiUrl + 'admin/get-dashboard-details', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authData?.token || '',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          setStats({
            properties: json.data.properties,
            enquiries: json.data.enquiries,
            views: json.data.views,
            contactEnquiries: json.data.contactEnquiries,
          });
          setGraph(json.data.propertyGraph);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const options = {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Properties Overview by Type',
    },
    xAxis: {
      categories: graph.categories,
      title: {
        text: 'Month',
      },
    },
    yAxis: {
      title: {
        text: 'Number of Properties',
      },
    },
    tooltip: {
      shared: true,
    },
    series: graph.series,
  };

  if (loading) {
    return <DataLoader />;
  }

  return (
    <>
      <div className="mb-4">
        <div className="breadcrumb_content style2">
          <h2 className="breadcrumb_title mb-0">Welcome Back...</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-6 rounded-lg shadow border border-line flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-ink">{stats.properties}</div>
            <p className="text-muted mt-1">All Properties</p>
          </div>
          <div className="text-coral! text-4xl">
            <FontAwesomeIcon icon={faHouse} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-line flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-ink">{stats.views}</div>
            <p className="text-muted mt-1">Total Views</p>
          </div>
          <div className="text-blue-500 text-4xl">
            <FontAwesomeIcon icon={faEye} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-line flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-ink">{stats.enquiries}</div>
            <p className="text-muted mt-1">New Enquiries</p>
          </div>
          <div className="text-green-500 text-4xl">
            <FontAwesomeIcon icon={faComments} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-line flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-ink">{stats.contactEnquiries}</div>
            <p className="text-muted mt-1">Contact Enquiries</p>
          </div>
          <div className="text-orange-500 text-4xl">
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="bg-white p-6 rounded-lg shadow border border-line">
          <h4 className="text-xl font-semibold mb-4 text-ink">View Statistics</h4>
          <HighchartsComponent highcharts={Highcharts} options={options} />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
