import { motion } from 'framer-motion';
import { FaClock, FaPiggyBank, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import * as React from 'react';

const benefits = [
  {
    icon: <FaClock className="text-5xl text-blue-600" />,
    title: 'Time Saving',
    description: 'Reduce document retrieval time by 75% with our advanced search and organization system.',
    stat: '75%',
    statText: 'Faster Access'
  },
  {
    icon: <FaPiggyBank className="text-5xl text-blue-600" />,
    title: 'Cost Reduction',
    description: 'Cut storage and administrative costs while improving document accessibility.',
    stat: '60%',
    statText: 'Cost Savings'
  },
  {
    icon: <FaShieldAlt className="text-5xl text-blue-600" />,
    title: 'Enhanced Security',
    description: 'Military-grade encryption and role-based access control for maximum protection.',
    stat: '99.9%',
    statText: 'Security Rate'
  },
  {
    icon: <FaChartLine className="text-5xl text-blue-600" />,
    title: 'Improved Efficiency',
    description: 'Streamline workflows and boost team productivity with automated processes.',
    stat: '85%',
    statText: 'Efficiency Boost'
  }
];

const BenefitsSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Why Choose Our Solution
          </motion.h2>
          <p className="text-xl text-gray-600">
            Experience the advantages of modern document management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 p-6 rounded-xl hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {benefit.description}
                </p>
                <div className="mt-auto">
                  <div className="text-3xl font-bold text-blue-600">
                    {benefit.stat}
                  </div>
                  <div className="text-sm text-gray-500">
                    {benefit.statText}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-300">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;