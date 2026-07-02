import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/analytics/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (!stats) return <div className="loading">No data available</div>;

  return (
    <div className="analytics-page">
      <h1>Analytics & Reports</h1>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h2>Overview</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">${parseFloat(stats.totalRevenue || 0).toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{stats.totalOrders}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Customers</span>
              <span className="stat-value">{stats.totalCustomers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Products</span>
              <span className="stat-value">{stats.totalProducts}</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h2>Orders by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.ordersByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card">
          <h2>Revenue (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card">
          <h2>Top Products</h2>
          <div className="top-products-list">
            {stats.topProducts?.length ? (
              stats.topProducts.map((product, index) => (
                <div key={index} className="top-product-item">
                  <span className="product-rank">#{index + 1}</span>
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <span className="product-stats">
                      {product.total_sold} sold · ${parseFloat(product.revenue).toFixed(2)} revenue
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-msg">Complete some orders to see top products.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
