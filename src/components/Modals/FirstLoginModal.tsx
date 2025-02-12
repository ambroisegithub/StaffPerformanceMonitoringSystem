import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaKey, FaTimes } from "react-icons/fa";

interface FirstLoginModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onResetPassword: () => void;
}

export const FirstLoginModal: React.FC<FirstLoginModalProps> = ({ 
  isOpen, 
  email,
  onClose, 
  onResetPassword 
}) => {
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
                  <div className="bg-warning p-3 rounded-full flex-shrink-0">
                    <FaExclamationTriangle className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">First Login Required</h3>
                    <p className="text-sm text-gray-500">Security verification needed</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-yellow p-4 rounded">
                    <p className="text-gray-700 font-medium">
                      For your security, please reset your password before accessing the system.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">

                    <p className="text-sm text-gray-600 mt-1">
                      This account requires password reset before first use.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex-1"
                  >
                    I'll do it later
                  </button>
                  
                  <button
                    onClick={onResetPassword}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-green to-blue text-white hover:from-green-700 hover:to-blue transition-all flex items-center justify-center gap-2 flex-1"
                  >
                    <FaKey />
                    Reset Password Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};