// @ts-nocheck

import * as React from 'react';
import { FaCalendar, FaArrowRight } from 'react-icons/fa';

const NewsCard = ({ date, title, excerpt, category }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="p-6">
      <div className="flex items-center mb-4">
        <FaCalendar className="text-blue-500 w-4 h-4" />
        <span className="ml-2 text-sm text-gray-500">{date}</span>
        <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
          {category}
        </span>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{excerpt}</p>
      <button className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
        Read More <FaArrowRight className="ml-2 w-4 h-4" />
      </button>
    </div>
  </div>
);

const NewsUpdates = () => {
  const news = [
    {
      date: "Feb 10, 2025",
      title: "New Version Release: Enhanced Security Features",
      excerpt: "We've added advanced encryption and improved access controls to better protect your documents.",
      category: "Feature Update"
    },
    {
      date: "Feb 8, 2025",
      title: "Introducing Mobile Document Scanning",
      excerpt: "Now you can scan and upload documents directly from your mobile device.",
      category: "New Feature"
    },
    {
      date: "Feb 5, 2025",
      title: "Document Management Best Practices",
      excerpt: "Learn how to organize your files effectively with our latest guide.",
      category: "Tips & Tricks"
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Updates
            </h2>
            <p className="text-lg text-gray-600">
              Stay informed about our latest features and improvements
            </p>
          </div>
          <button className="hidden md:flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View All Updates
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <NewsCard key={index} {...item} />
          ))}
        </div>
        
        <button className="w-full md:hidden mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          View All Updates
        </button>
      </div>
    </section>
  );
};

export default NewsUpdates;