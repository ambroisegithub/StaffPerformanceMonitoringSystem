"use client"

import { motion } from "framer-motion"
import * as React from "react"

interface StatisticProps {
  label: string
  value: string
}

const Statistic: React.FC<StatisticProps> = ({ label, value }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="text-center"
    >
      {/* Enhanced glass morphism effect */}
      <div className="bg-gradient-to-br  from-white/20 to-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl 
       transition-all duration-500 border border-white/20  
        overflow-hidden p-6 rounded-xl shadow-lg border border-white/30  transition-all duration-300">
        <div className="text-3xl font-bold bg-gradient-to-r from-green to-purple-600 bg-clip-text text-transparent mb-2">
          {value}
        </div>
        <div className="text-gray-200 font-medium ">{label}</div>
      </div>
    </motion.div>
  )
}

export default Statistic
