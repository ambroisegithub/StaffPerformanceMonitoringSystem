"use client"

import { motion } from "framer-motion"
import { FaSignInAlt, FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import * as React from "react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginUser, clearErrors, closeFirstLoginModal } from "../Redux/Slices/LoginSlices"
import type { AppDispatch, RootState } from "../Redux/store"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { FirstLoginModal } from "../components/Modals/FirstLoginModal"

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
})

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error, isFirstLogin, showFirstLoginModal, firstLoginEmail } = useSelector(
    (state: RootState) => state.login,
  )
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (values: {
    username: string
    password: string
  }) => {
    try {
      await dispatch(loginUser({ ...values, navigate })).unwrap()
    } catch (error: any) {
      // If it's a first login error, we'll show the modal first
      // The modal will be shown automatically through the reducer
      if (error === "First login detected. Please reset your password.") {
        // Don't navigate here - let the modal handle it
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleCloseModal = () => {
    dispatch(closeFirstLoginModal())
    navigate("/forgot-password")
  }

  const handleResetPassword = () => {
    dispatch(closeFirstLoginModal())
    navigate("/forgot-password")
  }

  React.useEffect(() => {
    return () => {
      dispatch(clearErrors())
    }
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl"
      >
        <div className="grid lg:grid-cols-2 gap-12 p-8 lg:p-12 items-center">
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green/100 to-purple-600 bg-clip-text text-transparent mb-6">
              Welcome Back
            </h2>
            <p className="text-gray-700 mb-8">Log in to access your dashboard and manage your workforce efficiently.</p>
            <Formik
              initialValues={{ username: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Field
                        type="text"
                        name="username"
                        placeholder="Username"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.username && touched.username ? "border-red" : "border-gray-200"
                        } focus:outline-none focus:ring-2 focus:ring-green`}
                      />
                      <ErrorMessage name="username" component="div" className="text-red text-sm mt-1" />
                    </div>
                    <div className="relative mb-6">
                      <div className="relative">
                        <Field
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green ${
                            touched.password && errors.password ? "border-red" : "border-gray-200"
                          } pr-12`}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                          tabIndex={-1}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <ErrorMessage name="password" component="div" className="text-red text-sm mt-1 absolute m" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green/100 text-white px-6 py-3 rounded-lg hover:bg-blue/100 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaSignInAlt className="text-xl" />
                        <span>Login</span>
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>
            {error && <div className="text-red mt-4">{error}</div>}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green/100 to-purple-600 rounded-2xl transform rotate-6"></div>
              <div className="bg-white p-6 rounded-2xl shadow-lg relative">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <FaUser className="w-8 h-8 text-green-500" />
                    <p className="text-gray-700">Securely log in to access your personalized dashboard.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <FaLock className="w-8 h-8 text-purple-600" />
                    <p className="text-gray-700">Your data is protected with advanced encryption.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <div>
            <p>
              <a href="/forgot-password" className="text-green hover:text-green-700">
                Forgot Password?
              </a>
            </p>
          </div>
        </div>
      </motion.div>
      <FirstLoginModal
        isOpen={showFirstLoginModal}
        email={firstLoginEmail || ""}
        onClose={handleCloseModal}
        onResetPassword={handleResetPassword}
      />
    </div>
  )
}

export default Login
