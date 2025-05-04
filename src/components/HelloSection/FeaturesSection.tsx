"use client"

import { motion } from "framer-motion"
import { FaUsers, FaClock, FaChartBar, FaShieldAlt, FaMobile, FaCloud } from "react-icons/fa"
import * as React from "react"

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <FaUsers />,
      title: "Team Management",
      description: "Efficiently organize and manage your entire workforce from one central dashboard",
      delay: 0.1,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50/30 to-cyan-50/20",
    },
    {
      icon: <FaClock />,
      title: "Time Tracking",
      description: "Accurate time tracking with automated reports and productivity insights",
      delay: 0.2,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50/30 to-pink-50/20",
    },
    {
      icon: <FaChartBar />,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics and reporting tools for data-driven decisions",
      delay: 0.3,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50/30 to-teal-50/20",
    },
    {
      icon: <FaShieldAlt />,
      title: "Security & Privacy",
      description: "Enterprise-grade security with full compliance and data protection",
      delay: 0.4,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50/30 to-red-50/20",
    },
    {
      icon: <FaMobile />,
      title: "Mobile App",
      description: "Native mobile apps for iOS and Android with offline capabilities",
      delay: 0.5,
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-50/30 to-purple-50/20",
    },
    {
      icon: <FaCloud />,
      title: "Cloud Integration",
      description: "Seamless integration with popular cloud services and existing tools",
      delay: 0.6,
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-50/30 to-blue-50/20",
    },
  ]

  return (
    <section className="relative py-16 px-4 lg:px-8 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-gray-50 opacity-200">
      {/* Enhanced watercolor-like animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-emerald-200/40 via-cyan-200/30 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-purple-200/40 via-pink-200/30 to-orange-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-indigo-200/30 via-purple-200/20 to-cyan-200/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-gradient-to-r from-teal-200/35 via-emerald-200/25 to-green-200/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Additional modern overlay patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(147,51,234,0.06),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.h2 
            className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-emerald-600 to-purple-900 bg-clip-text text-transparent mb-4 tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Powerful Features
          </motion.h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-purple-500 mx-auto mb-6 rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          />
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Everything you need to manage your workforce effectively and efficiently
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.7, 
                delay: feature.delay,
                ease: "easeOut"
              }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              {/* Enhanced glassmorphism card with watercolor background */}
              <div className={`relative h-80 bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 hover:border-white/30 group-hover:scale-105 overflow-hidden`}>
                
                {/* Watercolor-like background overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500`}></div>
                
                {/* Subtle inner glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient.replace('500', '400/10')} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                
                {/* Modern floating icon design */}
                <motion.div 
                  className={`relative w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-8 mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 ring-4 ring-white/30 group-hover:ring-white/50`}
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-3xl font-bold filter drop-shadow-sm">{feature.icon}</span>
                  
                  {/* Animated ring around icon */}
                  <div className={`absolute inset-0 rounded-2xl border-2 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-30 animate-pulse`} />
                  
                  {/* Floating particles effect */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/80 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/60 rounded-full animate-ping delay-300 opacity-0 group-hover:opacity-100"></div>
                </motion.div>

                <div className="relative z-10 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-gray-900 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-700 leading-relaxed font-medium group-hover:text-gray-800 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Enhanced bottom accent line */}
                <div className={`absolute bottom-0 left-0 h-2 bg-gradient-to-r ${feature.gradient} w-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full opacity-80`}></div>
                
                {/* Modern corner accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${feature.gradient} opacity-5 rounded-bl-3xl rounded-tr-3xl group-hover:opacity-15 transition-opacity duration-500`}></div>

                {/* Modern highlight effect */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection