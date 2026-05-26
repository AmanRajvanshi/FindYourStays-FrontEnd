import React, { useContext, useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DataLoader from '../../components/sharedComponents/DataLoader';
import { AuthContext } from '../../AuthContextProvider';
import { apiUrl } from '../../../envConfig';

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
        Authorization: authData.token,
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
      <div className="row">
        <div className="col-lg-12">
          <div className="breadcrumb_content style2">
            <h2 className="breadcrumb_title mb0">Welcome Back...</h2>
          </div>
        </div>
        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-3 mb-4">
          <div className="ff_one">
            <div className="detais">
              <div className="timer">{stats.properties}</div>
              <p>All Properties</p>
            </div>
            <div className="icon">
              <span className="flaticon-home" />
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-3 mb-4">
          <div className="ff_one style2">
            <div className="detais">
              <div className="timer">{stats.views}</div>
              <p>Total Views</p>
            </div>
            <div className="icon">
              <span className="flaticon-view" />
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-3 mb-4">
          <div className="ff_one style3">
            <div className="detais">
              <div className="timer">{stats.enquiries}</div>
              <p>New Enquiries</p>
            </div>
            <div className="icon">
              <span className="flaticon-chat" />
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-3 mb-4">
          <div className="ff_one style4">
            <div className="detais">
              <div className="timer">{stats.contactEnquiries}</div>
              <p>Contact Enquiries</p>
            </div>
            <div className="icon">
              <span className="flaticon-envelope" />
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-12">
          <div className="application_statics">
            <h4>View Statistics</h4>
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
