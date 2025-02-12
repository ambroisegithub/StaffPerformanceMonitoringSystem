"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaCheckCircle, FaSignInAlt, FaTimes } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

interface SuccessConfirmChangedPasswordProps {
  isOpen: boolean
  onClose: () => void
}

export const SuccessConfirmChangedPassword: React.FC<SuccessConfirmChangedPasswordProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()

  const handleGoToLogin = () => {
    onClose()
    navigate("/login")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="absolute top-4 right-4">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="bg-green p-3 rounded-full flex-shrink-0">
                    <FaCheckCircle className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Password Changed Successfully</h3>
                    <p className="text-sm text-gray-500">Your password has been updated</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-green p-4 rounded">
                    <p className="text-gray-700 font-medium">
                      Your password has been successfully changed. You can now log in with your new password.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      For security reasons, you've been logged out of all devices.
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Please log in again with your new password to continue.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleGoToLogin}
                    className="w-full px-5 py-2.5 rounded-lg bg-gradient-to-r from-green to-blue text-white hover:from-green hover:to-blue transition-all flex items-center justify-center gap-2"
                  >
                    <FaSignInAlt />
                    Go to Login Page
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
