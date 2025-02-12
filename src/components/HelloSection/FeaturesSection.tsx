import { motion } from 'framer-motion';
import { FaUsersCog, FaChartPie, FaMapMarkedAlt, FaClipboardCheck, FaBell, FaLock } from 'react-icons/fa';
import * as React from 'react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <FaUsersCog />,
      title: "Role-Based Access",
      description: "Secure authentication with customized permissions for employees and managers."
    },
    {
      icon: <FaChartPie />,
      title: "Performance Analytics",
      description: "Comprehensive dashboard with real-time metrics and performance insights."
    },
    {
      icon: <FaMapMarkedAlt />,
      title: "Location Tracking",
      description: "Monitor employee location during work hours with precision tracking."
    },
    {
      icon: <FaClipboardCheck />,
      title: "Task Management",
      description: "Efficiently assign, track, and manage employee tasks and progress."
    },
    {
      icon: <FaBell />,
      title: "Real-time Notifications",
      description: "Instant alerts for task updates, location changes, and performance metrics."
    },
    {
      icon: <FaLock />,
      title: "Data Security",
      description: "Enterprise-grade security measures to protect sensitive employee data."
    }
  ];

  return (
    <section className="bg-gradient-to-bl from-green-50 via-white to-purple-50 py-20 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green to-purple-600 bg-clip-text text-transparent mb-6">
            Comprehensive Monitoring Features
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Everything you need to effectively monitor and enhance staff performance
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-green/10 rounded-xl flex items-center justify-center text-green mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;