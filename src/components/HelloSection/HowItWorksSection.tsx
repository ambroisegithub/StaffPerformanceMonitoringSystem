"use client"

import { motion } from "framer-motion"
import { FaUserPlus, FaRoute, FaChartLine } from "react-icons/fa"
import * as React from "react"
import VideoBackground from "../VideoBackground/VideoBackground"

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: <FaUserPlus />,
      title: "Employee Registration",
      description: "Set up employee profiles with roles and permissions",
      delay: 0.2,
    },
    {
      icon: <FaRoute />,
      title: "Track & Monitor",
      description: "Real-time tracking of tasks and location",
      delay: 0.4,
    },
    {
      icon: <FaChartLine />,
      title: "Analyze Performance",
      description: "Generate insights from collected data",
      delay: 0.6,
    },
  ]

  return (
    <VideoBackground
      videoSrc={"./gradient-liquid-background.mp4"}
      overlay={false}
      className="relative overflow-hidden"
      preserveAspectRatio={false}
    >
      <section className="relative py-16 px-4 lg:px-8 overflow-hidden">
        {/* Enhanced animated background with modern gradients */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.15 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-purple-600/10 pointer-events-none"
          style={{ zIndex: 2 }}
        />
        
        {/* Additional modern overlay patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" style={{ zIndex: 2 }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)] pointer-events-none" style={{ zIndex: 2 }} />

        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2 
              className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4 tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              How It Works
            </motion.h2>
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-purple-500 mx-auto mb-6 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            />
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
              Simple steps to transform your workforce management
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.7, 
                  delay: step.delay,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Modern glassmorphism card with consistent height */}
                <div className="relative h-80 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 hover:border-white/30 group-hover:from-white/25 group-hover:to-white/10 group-hover:scale-105 overflow-hidden">
                  
                  {/* Subtle inner glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Modern floating icon design */}
                  <motion.div 
                    className="relative w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mb-8 mx-auto border border-white/20 shadow-lg group-hover:shadow-xl group-hover:from-emerald-400/30 group-hover:to-purple-500/30 transition-all duration-500"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-3xl filter drop-shadow-sm">{step.icon}</span>
                    
                    {/* Animated ring around icon */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-gradient-to-br from-emerald-400/30 to-purple-500/30 opacity-0 group-hover:opacity-100 animate-pulse" />
                  </motion.div>
                  
                  <div className="relative z-10 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-50 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed font-medium group-hover:text-white/90 transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>

                  {/* Modern highlight effect */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Enhanced connection line with modern styling */}
                {index < steps.length - 1 && (
                  <motion.div 
                    className="hidden md:block absolute top-1/2 -right-3 lg:-right-4 transform -translate-y-1/2 z-20"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: step.delay + 0.3 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center">
                      <div className="w-6 lg:w-8 h-px bg-gradient-to-r from-emerald-400/60 to-purple-500/60 relative">
                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-emerald-400 to-purple-500 rounded-full shadow-lg animate-pulse" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </VideoBackground>
  )
}

export default HowItWorksSection