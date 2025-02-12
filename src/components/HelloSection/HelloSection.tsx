import { motion } from 'framer-motion';
import { FaChartLine, FaMapMarkerAlt, FaTasks } from 'react-icons/fa';
import * as React from 'react';
import Statistic from '../Statistic/Statistic';
import DashboardImage from "../../assets/employee-performance-tracking.webp";

const HelloSection: React.FC = () => {
  const features = [
    { icon: <FaTasks className="w-6 h-6" />, text: "Real-time Task Tracking" },
    { icon: <FaMapMarkerAlt className="w-6 h-6" />, text: "Location Monitoring" },
    { icon: <FaChartLine className="w-6 h-6" />, text: "Performance Analytics" }
  ];

  return (
    <section className="h-auto bg-gradient-to-br from-green-50 via-white to-purple-50 pt-28 pb-16 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green to-purple-600 bg-clip-text text-transparent mb-6">
                Empower Your Workforce Management
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Monitor performance, track progress, and boost productivity with our comprehensive staff management platform.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                    <span className="text-green">{feature.icon}</span>
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <button className="bg-green text-white px-8 py-3 rounded-full hover:bg-blue transform hover:scale-105 transition shadow-lg">
                  Start Monitoring
                </button>
                <button className="bg-white text-green px-8 py-3 rounded-full hover:bg-blue transform hover:scale-105 transition shadow-lg hover:text-white">
                  Schedule Demo
                </button>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6">
              <Statistic label="Active Users" value="10K+" />
              <Statistic label="Tasks Tracked" value="1M+" />
              <Statistic label="Efficiency Gain" value="35%" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green/100 to-purple-600/100 rounded-2xl transform rotate-6"></div>
              <img 
                src={DashboardImage}
                alt="Performance Dashboard"
                className="w-full h-auto rounded-2xl shadow-2xl relative"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HelloSection;