import { motion } from 'framer-motion';
import { FaUserPlus, FaRoute, FaChartLine } from 'react-icons/fa';
import * as React from 'react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: <FaUserPlus />,
      title: "Employee Registration",
      description: "Set up employee profiles with roles and permissions",
      delay: 0.2
    },
    {
      icon: <FaRoute />,
      title: "Track & Monitor",
      description: "Real-time tracking of tasks and location",
      delay: 0.4
    },
    {
      icon: <FaChartLine />,
      title: "Analyze Performance",
      description: "Generate insights from collected data",
      delay: 0.6
    }
  ];

  return (
    <section className="bg-gradient-to-tr from-green-50 via-white to-purple-50 py-20 px-4 lg:px-8 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="absolute inset-0 bg-[linear-gradient(30deg,#00800022_12%,#80008022_88%)] pointer-events-none"
      />
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green to-purple-600 bg-clip-text text-transparent mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Simple steps to transform your workforce management
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: step.delay }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-green/10 rounded-full flex items-center justify-center text-green mb-6 mx-auto">
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-1/3 border-t-2 border-dashed border-green/30" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;