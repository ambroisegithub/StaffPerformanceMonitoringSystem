
"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Formik, Field, Form, ErrorMessage } from "formik"
import * as Yup from "yup"
import { FaLock, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { resetPassword, clearState, closeSuccessModal } from "../Redux/Slices/confirmPasswordResetSlice"
import type { RootState, AppDispatch } from "../Redux/store"
import { SuccessConfirmChangedPassword } from "../components/Modals/SuccessConfirmChangedPassword"
import { motion } from "framer-motion"
import VideoBackground from "../components/VideoBackground/VideoBackground"

interface FormValues {
  newPassword: string
  confirmPassword: string
}

const validationSchema = Yup.object().shape({
  newPassword: Yup.string().min(8, "Password must be at least 8 characters").required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
})

const ConfirmToChangePassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, showSuccessModal } = useSelector((state: RootState) => state.confirmPasswordReset)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  const handleSubmit = async (values: FormValues) => {
    try {
      await dispatch(
        resetPassword({
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        }),
      ).unwrap()
      // No longer navigate automatically - the modal will handle this
    } catch (error) {
      // Error is handled by the slice and displayed via toast
    }
  }

  const handleCloseSuccessModal = () => {
    dispatch(closeSuccessModal())
  }

  useEffect(() => {
    return () => {
      dispatch(clearState())
    }
  }, [dispatch])

  return (
    <VideoBackground
      videoSrc="./gradient-liquid-background.mp4"
      overlay={false}
      className="relative overflow-hidden"
      preserveAspectRatio={false}
    >
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Enhanced animated background with modern gradients */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-purple-600/15 pointer-events-none"
          style={{ zIndex: 2 }}
        />
        
        {/* Additional modern overlay patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.12),transparent_50%)] pointer-events-none" style={{ zIndex: 2 }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.12),transparent_50%)] pointer-events-none" style={{ zIndex: 2 }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden w-full max-w-md border border-white/20 relative"
          style={{ zIndex: 3 }}
        >
          {/* Subtle inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-purple-500/5 rounded-3xl" />
          
          {/* Modern highlight effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          <div className="p-8 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-black bg-gradient-to-r from-white via-emerald-100 to-purple-200 bg-clip-text text-transparent mb-6 text-center tracking-tight"
            >
              Change Password
            </motion.h1>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-300 text-center mb-4 font-medium bg-red-500/10 backdrop-blur-sm p-3 rounded-lg border border-red-400/30"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Formik
                initialValues={{
                  newPassword: "",
                  confirmPassword: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    <div className="relative">
                      <Field
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white/15 backdrop-blur-sm text-white placeholder-white/70 ${
                          errors.newPassword && touched.newPassword 
                            ? "border-red-400/60 focus:border-red-400" 
                            : "border-white/30 focus:border-emerald-400/70"
                        } pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all duration-300`}
                      />
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <ErrorMessage name="newPassword" component="div" className="text-red-300 text-sm mt-1 font-medium" />
                    </div>

                    <div className="relative">
                      <Field
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm New Password"
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white/15 backdrop-blur-sm text-white placeholder-white/70 ${
                          errors.confirmPassword && touched.confirmPassword 
                            ? "border-red-400/60 focus:border-red-400" 
                            : "border-white/30 focus:border-emerald-400/70"
                        } pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all duration-300`}
                      />
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <ErrorMessage name="confirmPassword" component="div" className="text-red-300 text-sm mt-1 font-medium" />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="w-full bg-gradient-to-r from-emerald-500/90 to-purple-600/90 hover:from-emerald-500 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 hover:border-white/30"
                    >
                      {loading ? <FaSpinner className="animate-spin" /> : null}
                      {loading ? "Changing Password..." : "Change Password"}
                    </button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </div>
        </motion.div>

        <SuccessConfirmChangedPassword isOpen={showSuccessModal} onClose={handleCloseSuccessModal} />
      </div>
    </VideoBackground>
  )
}

export default ConfirmToChangePassword