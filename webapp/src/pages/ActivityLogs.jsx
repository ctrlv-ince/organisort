import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Landing.css'; // Import shared styles

/**
 * Activity Logs Page
 * Displays a log of all user detections for admin users.
 * Styled to match the professional design of the landing page.
 */
const ActivityLogs = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchDetections = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/detections/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDetections(data.detections);
      } else {
        console.error('Failed to fetch detections');
      }
    } catch (error) {
      console.error('Error fetching detections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, []);

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <main>
        <section className="features" style={{ background: '#f9fafb', minHeight: 'calc(100vh - 150px)' }}>
          <div className="container-pro">
            <h2 className="section-title">Activity Logs</h2>
            <div className="news-grid">
              {detections.map((detection) => (
                <div key={detection._id} className="news-card">
                  <img src={detection.annotated_image} alt="Annotated" className="news-img" />
                  <div className="news-content">
                    <p className="news-desc" style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: {detection._id}</p>
                    <p className="news-desc" style={{ fontSize: '0.8rem', color: '#6b7280' }}>User ID: {detection.user}</p>
                    <h3 className="news-title">{detection.summary.wasteType}</h3>
                    <p className="news-desc">Category: {detection.summary.category}</p>
                    <p className="product-grade" style={{marginTop: '1rem'}}>
                      Created At: {new Date(detection.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ActivityLogs;
