import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  FaTwitter, 
  FaLinkedin, 
  FaGithub, 
  FaEnvelope, 
  FaChartLine, 
  FaMapMarkerAlt, 
  FaTasks, 
  FaHeadset 
} from 'react-icons/fa';

const Footer = () => {
  const features = [
    { icon: <FaTasks />, text: "Task Tracking" },
    { icon: <FaMapMarkerAlt />, text: "Location Monitor" },
    { icon: <FaChartLine />, text: "Analytics" },
    { icon: <FaHeadset />, text: "24/7 Support" }
  ];

  return (
    <footer className="bg-gradient-to-br from-green via-white to-purple-800 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-green/50 to-purple-600/50 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green/10 to-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-600/10 to-green/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue to-purple-600 bg-clip-text text-transparent">
              Staff Performance Monitor
            </h3>
            <p className="text-gray-600">
              Empowering organizations with comprehensive staff monitoring and performance analytics solutions.
            </p>
            <div className="flex space-x-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-md text-green hover:text-purple-600 transition-colors"
                >
                  {feature.icon}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Solutions</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-600 hover:text-white transition-colors">Employee Tracking</a></li>
              <li><a href="#" className="text-gray-600 hover:text-white transition-colors">Performance Analytics</a></li>
              <li><a href="#" className="text-gray-600 hover:text-white transition-colors">Location Monitoring</a></li>
              <li><a href="#" className="text-gray-600 hover:text-white transition-colors">Task Management</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Resources</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-600 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="text-gray-600 hover:text-white transition-colors">Privacy & Security</a></li>
              <li><a href="#" className="text-gray-600 hover:text-white transition-colors">Compliance Guide</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Stay Connected</h3>
            <div className="space-y-6">
              <p className="text-gray-600">Get the latest updates on performance monitoring trends.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green"
                />
                <button className="px-4 py-2 bg-green text-white rounded-r-lg hover:bg-purple-600 transition-colors">
                  <FaEnvelope className="w-5 h-5" />
                </button>
              </div>
              {/* <div className="flex space-x-4">
                <FaTwitter className="w-5 h-5 text-white hover:text-white cursor-pointer transition-colors" />
                <FaLinkedin className="w-5 h-5 text-white hover:text-white cursor-pointer transition-colors" />
                <FaGithub className="w-5 h-5 text-white hover:text-white cursor-pointer transition-colors" />
              </div> */}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600">© 2025 Staff Performance Monitoring System. All rights reserved.</p>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green rounded-full animate-pulse" />
              <span className="text-gray-600">System Status: Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;