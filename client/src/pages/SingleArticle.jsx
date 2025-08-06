// src/pages/SingleArticle.jsx (Final Corrected Version)

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom'; // MODIFIED: Added useNavigate

const SingleArticle = () => { // MODIFIED: Removed onBack prop
  const { articleId } = useParams();
  const navigate = useNavigate(); // NEW: Initialize navigate hook
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const isViewIncremented = useRef(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {},
        };
        if (token) {
          config.headers['x-auth-token'] = token;
        }

        const res = await axios.get(`http://localhost:5001/api/articles/${articleId}`, config);
        setArticle(res.data);
      } catch (err) {
        toast.error('Failed to fetch article');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const incrementViews = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.patch(`http://localhost:5001/api/articles/${articleId}/view`, {}, {
            headers: {
              'x-auth-token': token,
            },
          });
        }
      } catch (err) {
        console.error('Failed to increment views:', err);
      }
    };

    if (articleId) {
      fetchArticle();
      if (!isViewIncremented.current) {
          incrementViews();
          isViewIncremented.current = true;
      }
    }
  }, [articleId]);

  if (loading) {
    return <div className="text-center mt-8">Loading article...</div>;
  }

  if (!article) {
    return <div className="text-center mt-8 text-red-500">Article not found.</div>;
  }
  
  return (
    <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg">
      <button onClick={() => navigate(-1)} className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
        &larr; Back to Articles
      </button>

      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <p className="text-gray-600 text-sm mb-6">
        By: <span className="font-semibold">{article.author?.username}</span> | Published on: {new Date(article.createdAt).toLocaleDateString()}
      </p>
      
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }}></div>
      
      <div className="mt-8 flex items-center space-x-6 text-gray-600 text-lg">
        <span><span className="font-bold">{article.views || 0}</span> Views</span>
        <span><span className="font-bold">{article.likes || 0}</span> Likes</span>
        <span><span className="font-bold">{article.shares || 0}</span> Shares</span>
      </div>

    </div>
  );
};

export default SingleArticle;