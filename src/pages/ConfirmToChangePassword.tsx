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
    <div className="min-h-screen bg-gradient-to-br bg-white via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-green to-purple-600 bg-clip-text text-transparent">
          Change Password
        </h1>

        {error && <div className="text-red text-center mb-4">{error}</div>}

        <Formik
          initialValues={{
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div className="relative">
                <Field
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green focus:border-green pl-10"
                />
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <ErrorMessage name="newPassword" component="div" className="text-red text-sm mt-1" />
              </div>

              <div className="relative">
                <Field
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green focus:border-transparent pl-10"
                />
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <ErrorMessage name="confirmPassword" component="div" className="text-red text-sm mt-1" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-green text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors duration-300 flex items-center justify-center"
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                {loading ? "Changing Password..." : "Change Password"}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <SuccessConfirmChangedPassword isOpen={showSuccessModal} onClose={handleCloseSuccessModal} />
    </div>
  )
}

export default ConfirmToChangePassword
