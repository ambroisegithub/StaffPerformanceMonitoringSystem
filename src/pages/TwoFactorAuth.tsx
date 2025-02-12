"use client"

import React from "react"
import { useRef, useEffect } from "react"
import { Formik, Field, Form, type FormikHelpers } from "formik"
import * as Yup from "yup"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { verifyOTP, clearState } from "../Redux/Slices/twoFactorAuthSlice"
import type { RootState, AppDispatch } from "../Redux/store"
import { FaSpinner } from "react-icons/fa"

interface MyFormValues {
  otp: string[]
}

const validationSchema = Yup.object({
  otp: Yup.array()
    .of(
      Yup.string()
        .required("Required")
        .matches(/^[0-9]$/, "Must be a digit"),
    )
    .min(6, "Must be exactly 6 digits")
    .max(6, "Must be exactly 6 digits"),
})

const TwoFactorAuth: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const { loading, error } = useSelector((state: RootState) => state.twoFactorAuth)

  const handleSubmit = async (values: MyFormValues, actions: FormikHelpers<MyFormValues>) => {
    const otpCode = values.otp.join("")
    try {
      await dispatch(verifyOTP(otpCode)).unwrap()
      navigate("/change-password")
    } catch (error) {
      // Error is handled by the slice and displayed via toast
    } finally {
      actions.setSubmitting(false)
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    idx: number,
    setFieldValue: FormikHelpers<MyFormValues>["setFieldValue"],
  ) => {
    const { value } = event.target
    if (value === "") {
      setFieldValue(`otp[${idx}]`, "")
      if (idx > 0 && inputRefs.current[idx - 1]) {
        inputRefs.current[idx - 1]?.focus()
      }
    } else if (/^[0-9]$/.test(value)) {
      setFieldValue(`otp[${idx}]`, value)
      if (idx < 5 && inputRefs.current[idx + 1]) {
        inputRefs.current[idx + 1]?.focus()
      }
    }
  }

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<MyFormValues>["setFieldValue"]
  ) => {
    const pastedData = event.clipboardData.getData("Text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      pastedData.split("").forEach((char, idx) => {
        setFieldValue(`otp[${idx}]`, char);
      });
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearState())
    }
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-green to-purple-600 bg-clip-text text-transparent">
          Two-Factor Authentication
        </h1>

        {error && <div className="text-red text-center mb-4">{error}</div>}

        <Formik
          initialValues={{ otp: ["", "", "", "", "", ""] }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, errors, touched }) => (
            <Form className="space-y-6">
              <div className="flex justify-center gap-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Field
                    key={idx}
                    name={`otp[${idx}]`}
                    type="text"
                    maxLength={1}
                    innerRef={(el: HTMLInputElement) => (inputRefs.current[idx] = el)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, idx, setFieldValue)}
                    onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => handlePaste(e, setFieldValue)}
                    className={`w-12 h-12 text-center text-2xl border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      touched.otp && errors.otp ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-green text-white px-6 py-3 rounded-lg hover:bg-blue transition-colors duration-300 flex items-center justify-center"
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                {loading ? "Verifying..." : "Verify"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="mt-4 text-center text-gray-600">
          Didn't receive a code?{" "}
          <a href="/forgot-password" className="text-green hover:underline font-semibold">
            Resend Code
          </a>
        </p>

        <p
          className="mt-4 text-center text-green cursor-pointer hover:underline"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </div>
    </div>
  )
}

export default TwoFactorAuth

