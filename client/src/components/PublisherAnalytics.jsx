// src/components/PublisherAnalytics.jsx (Final Corrected Version)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PublisherAnalytics = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/api/articles/publisher/analytics', {
          headers: {
            'x-auth-token': token,
          },
        });
        setArticles(res.data.data);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch analytics data.');
        console.error(err);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Article Performance Analytics</h2>
      {articles.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Title</th>
                <th className="py-2 px-4 border-b">Views</th>
                <th className="py-2 px-4 border-b">Likes</th>
                <th className="py-2 px-4 border-b">Shares</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{article.title}</td>
                  <td className="py-2 px-4 border-b text-center">{article.views}</td>
                  <td className="py-2 px-4 border-b text-center">{article.likes}</td>
                  <td className="py-2 px-4 border-b text-center">{article.shares}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No articles found for analytics.</p>
      )}
    </div>
  );
};

export default PublisherAnalytics;