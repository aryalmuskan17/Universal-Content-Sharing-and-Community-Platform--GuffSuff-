// client/src/components/PublisherAnalytics.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaThumbsUp, FaShareAlt, FaComments } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
//CHART IMPORTS
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';

// IMPORTANT: Register the necessary chart components and scales
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement, // For Doughnut chart
    LineElement, 
    PointElement
);
// This component displays analytics for a publisher's articles
const PublisherAnalytics = () => {
  const { t } = useTranslation();
  // State to store the list of articles and their analytics
  const [articles, setArticles] = useState([]);
  // State to manage the loading status
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useContext(ThemeContext);
  // State to control which type of articles to view (all, pending, published, rejected)
  const [viewType, setViewType] = useState('all');

  // Effect hook to fetch article analytics when the component mounts or viewType changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        // Construct the URL to fetch articles, optionally with a status filter
        let url = 'http://localhost:5001/api/articles/publisher/analytics';
        if (viewType && viewType !== 'all') {
            url += `?status=${viewType}`;
        }
        
        const res = await axios.get(url, {
          headers: {
            'x-auth-token': token,
          },
        });
        setArticles(res.data.data);
        setLoading(false);
      } catch (err) {
        toast.error(t('failedToFetchAnalytics'));
        console.error(err);
        setLoading(false);
      }
    };

    fetchAnalytics();
    
  }, [t, viewType]);

  // Handler for deleting an article
  const handleDeleteArticle = async (articleId, title) => {
    // Confirm with the user before deleting
    if (window.confirm(`Are you sure you want to delete the article "${title}"? This cannot be undone.`)) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5001/api/articles/${articleId}`, {
          headers: {
            'x-auth-token': token,
          },
        });
        toast.success(`"${title}" has been deleted.`);
        // Filter the deleted article out of the local state
        setArticles(articles.filter(article => article._id !== articleId));
      } catch (err) {
        toast.error('Failed to delete the article.');
        console.error(err);
      }
    }
  };

// Function to transform article data into Chart.js format for Category Distribution
const getCategoryDistributionData = () => {
    // 1. Count articles per category
    const categoryCounts = articles.reduce((acc, article) => {
        // Use 'Uncategorized' if the category field is missing or falsy
        const category = article.category || 'Uncategorized'; 
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    const categories = Object.keys(categoryCounts);
    const counts = Object.values(categoryCounts);
    
    // Simple color palette (you can expand this if you have many categories)
    const backgroundColors = [
        'rgba(255, 99, 132, 0.6)', // Red
        'rgba(54, 162, 235, 0.6)', // Blue
        'rgba(255, 206, 86, 0.6)', // Yellow
        'rgba(75, 192, 192, 0.6)', // Green
        'rgba(153, 102, 255, 0.6)', // Purple
        'rgba(255, 159, 64, 0.6)', // Orange
    ];

    return {
        labels: categories,
        datasets: [
            {
                label: t('numberOfArticles'),
                data: counts,
                backgroundColor: counts.map((_, index) => backgroundColors[index % backgroundColors.length]),
                borderColor: counts.map((_, index) => backgroundColors[index % backgroundColors.length].replace('0.6', '1')),
                borderWidth: 1,
            },
        ],
    };
};
// Function to transform article data into Chart.js format for Most Read Articles
const getMostReadArticlesData = () => {
    // 1. Sort articles by views in descending order and take the top 5
    const topArticles = [...articles]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

    const titles = topArticles.map(article => article.title);
    const views = topArticles.map(article => article.views || 0);

    return {
        labels: titles,
        datasets: [
            {
                label: t('views'),
                data: views,
                backgroundColor: 'rgba(79, 70, 229, 0.7)', // Indigo/Blue color
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1,
            },
        ],
    };
};

// Function to simulate a time-series trend using the total view count
const getSimulatedVisitorTrendsData = () => {
    // Calculate the total number of views across ALL articles
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);

    // Trend over the last 7 days
    const days = 7;
    const labels = [];
    
    // Create labels (e.g., Day 7 Ago, ..., Day 1 Ago)
    for (let i = days; i >= 1; i--) {
        labels.push(`Day ${i} Ago`); 
    }
    
    // Distribute views to simulate a trend (e.g., higher traffic mid-week)
    const viewDistribution = [0.10, 0.12, 0.15, 0.18, 0.20, 0.15, 0.10]; 
    viewDistribution.reverse();
    
    const viewsData = viewDistribution.map(ratio => Math.round(totalViews * ratio));

    return {
        labels: labels,
        datasets: [
            {
                label: t('totalViews'),
                data: viewsData,
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                tension: 0.4, 
            },
        ],
    };
};
  
  // Calculate total stats using the Array.prototype.reduce method
  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);
  const totalShares = articles.reduce((sum, article) => sum + (article.shares || 0), 0);
  const totalComments = articles.reduce((sum, article) => sum + (article.commentCount || 0), 0);

  // The component's main JSX structure
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg my-8 dark:bg-gray-900 transition-colors duration-300">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 dark:text-gray-100">{t('yourArticlePerformance')}</h2>

      {/* Buttons to filter articles by status */}
      <div className="flex mb-6 space-x-2 sm:space-x-4">
          <button
              onClick={() => setViewType('all')}
              className={`py-2 px-4 rounded-lg font-bold text-sm transition-colors ${
                  viewType === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
          >
              {t('all')}
          </button>
          <button
              onClick={() => setViewType('pending')}
              className={`py-2 px-4 rounded-lg font-bold text-sm transition-colors ${
                  viewType === 'pending' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
          >
              {t('pending')}
          </button>
          <button
              onClick={() => setViewType('published')}
              className={`py-2 px-4 rounded-lg font-bold text-sm transition-colors ${
                  viewType === 'published' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
          >
              {t('published')}
          </button>
          <button
              onClick={() => setViewType('rejected')}
              className={`py-2 px-4 rounded-lg font-bold text-sm transition-colors ${
                  viewType === 'rejected' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
          >
              {t('rejected')}
          </button>
      </div>

      {/* Conditional rendering based on whether articles exist */}
      {articles.length > 0 ? (
        <>
          {/* Summary stats section */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow flex items-center space-x-4 dark:bg-gray-800 dark:shadow-md">
              <FaEye className="text-4xl text-indigo-500 dark:text-indigo-400" />
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{totalViews}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('totalViews')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow flex items-center space-x-4 dark:bg-gray-800 dark:shadow-md">
              <FaThumbsUp className="text-4xl text-indigo-500 dark:text-indigo-400" />
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{totalLikes}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('totalLikes')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow flex items-center space-x-4 dark:bg-gray-800 dark:shadow-md">
              <FaShareAlt className="text-4xl text-indigo-500 dark:text-indigo-400" />
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{totalShares}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('totalShares')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow flex items-center space-x-4 dark:bg-gray-800 dark:shadow-md">
              <FaComments className="text-4xl text-indigo-500 dark:text-indigo-400" />
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{totalComments}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('totalComments')}</p>
              </div>
            </div>
          </div>

          {/*CHART VISUALIZATIONS SECTION */}
          {/*DOUGHNUT CHART AND BAR CHART*/}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/*Article Category Distribution (Doughnut Chart) */}
            <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg shadow dark:bg-gray-800 dark:shadow-md">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 text-center">{t('categoryDistribution')}</h3>
                <div className="h-64 flex justify-center items-center">
                    {/* Render the Doughnut Chart */}
                    <Doughnut data={getCategoryDistributionData()} />
                </div>
            </div>

            {/*Most Read Articles (Bar Chart)*/}
            <div className="lg:col-span-2 bg-gray-50 p-6 rounded-lg shadow dark:bg-gray-800 dark:shadow-md">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 text-center">{t('mostReadArticles')}</h3>
                <div className="h-64 flex justify-center items-center text-gray-500">
                    <Bar 
                        data={getMostReadArticlesData()} 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                title: {
                                    display: false,
                                },
                                legend: {
                                    display: false,
                                },
                            },
                        }}
                    />
                </div>
            </div>
          </div>
          
          {/*Visitor Trends Over Time (Line Chart)*/}
          <div className="bg-white p-6 rounded-xl shadow-lg dark:bg-gray-900 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('visitorTrends')}</h3>
              <div className="h-96">
                  <Line 
                      data={getSimulatedVisitorTrendsData()} 
                      options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                              legend: {
                                  display: true,
                                  position: 'top',
                              },
                          },
                          scales: {
                              y: {
                                  beginAtZero: true,
                                  title: {
                                      display: true,
                                      text: t('views'),
                                  }
                              }
                          }
                      }}
                  />
              </div>
          </div>
          
          {/* Table to display article details and actions */}
          <div className="overflow-x-auto rounded-lg shadow-md dark:shadow-none">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="text-gray-600 uppercase text-sm font-semibold bg-gray-50 border-b-2 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                  <th className="py-3 px-6 text-left">{t('title')}</th>
                  <th className="py-3 px-6 text-left">{t('author')}</th>
                  <th className="py-3 px-6 text-center">{t('views')}</th>
                  <th className="py-3 px-6 text-center">{t('likes')}</th>
                  <th className="py-3 px-6 text-center">{t('shares')}</th>
                  <th className="py-3 px-6 text-center">{t('comments')}</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Map through the articles and create a table row for each */}
                {articles.map((article) => (
                  <tr key={article._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800">
                    <td className="py-4 px-6 text-left text-gray-700 font-medium whitespace-nowrap dark:text-gray-200">
                       <Link to={`/article/${article._id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors dark:text-indigo-400 dark:hover:text-indigo-300">
                          {article.title}
                       </Link>
                    </td>
                    <td className="py-4 px-6 text-left text-gray-700 whitespace-nowrap dark:text-gray-200">
                       {article.author ? article.author.username : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-200">
                      <Link to={`/article/${article._id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors dark:text-indigo-400 dark:hover:text-indigo-300">
                          {article.views}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-200">
                      <Link to={`/article/${article._id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors dark:text-indigo-400 dark:hover:text-indigo-300">
                          {article.likes}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-200">
                      <Link to={`/article/${article._id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors dark:text-indigo-400 dark:hover:text-indigo-300">
                          {article.shares}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-200">
                      <Link to={`/article/${article._id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors dark:text-indigo-400 dark:hover:text-indigo-300">
                          {article.commentCount}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-center">
                        {/* Container for the action buttons */}
                        <div className="flex justify-center space-x-2">
                            {/* Edit button */}
                            <Link 
                                to={`/edit-article/${article._id}`}
                                className="py-2 px-4 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Edit
                            </Link>

                            {/* Delete button */}
                            <button
                                onClick={() => handleDeleteArticle(article._id, article.title)}
                                className="py-2 px-4 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        // Message displayed when there are no articles for the selected view type
        <div className="text-center p-8 text-xl text-gray-500 dark:text-gray-400">
          {t('noArticlesFoundForAnalytics')}
        </div>
      )}
    </div>
  );
};

export default PublisherAnalytics;