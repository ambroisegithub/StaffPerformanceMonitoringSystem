import React from "react"
import { Formik, Field, Form, ErrorMessage } from "formik"
import * as Yup from "yup"
import { FaEnvelope, FaSpinner } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { requestPasswordReset } from "../Redux/Slices/PasswordResetRequestSlice"
import type { RootState, AppDispatch } from "../Redux/store"

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
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-green to-purple-600 bg-clip-text text-transparent">
          Forgot Password
        </h1>

        <Formik
          initialValues={{ email: storedEmail }} // Pre-fill email field
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div className="relative">
                <Field
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green focus:border-transparent pl-10"
                />
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <ErrorMessage name="email" component="div" className="text-red text-sm mt-1" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-green text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                {loading ? "Submitting..." : "Submit"}
              </button>
            </Form>
          )}
        </Formik>

        {error && <div className="text-red text-center mt-4">{error}</div>}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-green hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PasswordResetRequestForm

