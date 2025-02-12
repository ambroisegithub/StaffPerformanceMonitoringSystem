import { motion } from 'framer-motion';
import { FaRocket, FaArrowRight } from 'react-icons/fa';
import * as React from 'react';

const CTASection: React.FC = () => {
  const getContent = (idx: number) => {
    switch (idx) {
      case 1:
        return "TRACK";
      case 2:
        return "MANAGE";
      case 3:
        return "ANALYZE";
      default:
        return "GROW";
    }
  };

  return (
    <section className="bg-gradient-to-br from-green-50 via-white to-purple-50 py-20 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white/50 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-12">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green to-purple-600 bg-clip-text text-transparent mb-6">
                  Ready to Transform Your Workforce Management?
                </h2>
                <p className="text-xl text-gray-700 mb-8">
                  Join thousands of companies already optimizing their staff performance with our platform.
                </p>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green text-white px-8 py-4 rounded-full hover:bg-opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg"
                  >
                    <FaRocket className="text-xl" />
                    <span>Get Started Now</span>
                    <FaArrowRight className="ml-2" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-green px-8 py-4 rounded-full hover:bg-green hover:text-white transition-all duration-300 flex items-center gap-2 shadow-lg"
                  >
                    <span>Watch Demo</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green/30 to-purple-600/30 rounded-2xl transform rotate-6" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ y: -5 }}
                    className="bg-white p-4 rounded-xl shadow-md"
                  >
                    <div className="w-full h-24 bg-gradient-to-r from-green/50 to-purple-600/50 rounded-lg mb-2 flex items-center
                    justify-center">
                      <p className="text-2xl font-extrabold text-white">
                        {getContent(item)}

                      </p>
                    
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-3/4 bg-gradient-to-r from-green/100 to-purple-600/100 rounded" >
                      
                      </div>

                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;