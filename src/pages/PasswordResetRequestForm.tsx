// PasswordResetRequestForm Component
import React from "react"
import { Formik, Field, Form, ErrorMessage } from "formik"
import * as Yup from "yup"
import { FaEnvelope, FaSpinner } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { requestPasswordReset } from "../Redux/Slices/PasswordResetRequestSlice"
import type { RootState, AppDispatch } from "../Redux/store"
import { motion } from "framer-motion"
import VideoBackground from "../components/VideoBackground/VideoBackground"

interface MyFormValues {
  email: string
}

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email format").required("Email is required"),
})

const PasswordResetRequestForm: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.passwordResetRequest)

  const storedEmail = localStorage.getItem("firstLoginEmail") || "" // Retrieve stored email

  const handleSubmit = async (values: MyFormValues) => {
    try {
      await dispatch(requestPasswordReset(values.email)).unwrap()
      navigate("/two-factor-auth")
    } catch (error) {
      // Error is handled by the slice and displayed via toast
    }
  }

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
              Forgot Password
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Formik
                initialValues={{ email: storedEmail }} // Pre-fill email field
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    <div className="relative">
                      <Field
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white/15 backdrop-blur-sm text-white placeholder-white/70 ${
                          errors.email && touched.email 
                            ? "border-red-400/60 focus:border-red-400" 
                            : "border-white/30 focus:border-emerald-400/70"
                        } pl-12 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all duration-300`}
                      />
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
                      <ErrorMessage name="email" component="div" className="text-red-300 text-sm mt-1 font-medium" />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="w-full bg-gradient-to-r from-emerald-500/90 to-purple-600/90 hover:from-emerald-500 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 hover:border-white/30"
                    >
                      {loading ? <FaSpinner className="animate-spin" /> : null}
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </Form>
                )}
              </Formik>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 text-center mt-4 font-medium bg-red-500/10 backdrop-blur-sm p-3 rounded-lg border border-red-400/30"
                >
                  {error}
                </motion.div>
              )}

              <div className="mt-6 text-center">
                <Link 
                  to="/login" 
                  className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200 font-medium hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </VideoBackground>
  )
}

export default PasswordResetRequestForm