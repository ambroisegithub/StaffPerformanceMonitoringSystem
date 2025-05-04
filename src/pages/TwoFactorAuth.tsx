"use client"

import React, { useRef, useEffect } from "react"
import { Formik, Field, Form, type FormikHelpers } from "formik"
import * as Yup from "yup"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { verifyOTP, clearState } from "../Redux/Slices/twoFactorAuthSlice"
import type { RootState, AppDispatch } from "../Redux/store"
import { FaSpinner } from "react-icons/fa"
import VideoBackground from "../components/VideoBackground/VideoBackground"

interface MyFormValues {
  otp: string[]
}

const validationSchema = Yup.object({
  otp: Yup.array()
    .of(Yup.string().required("Required").matches(/^[0-9]$/, "Must be a digit"))
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
      if (idx > 0) inputRefs.current[idx - 1]?.focus()
    } else if (/^[0-9]$/.test(value)) {
      setFieldValue(`otp[${idx}]`, value)
      if (idx < 5) inputRefs.current[idx + 1]?.focus()
    }
  }

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<MyFormValues>["setFieldValue"]
  ) => {
    const pastedData = event.clipboardData.getData("Text").trim()
    if (/^\d{6}$/.test(pastedData)) {
      pastedData.split("").forEach((char, idx) => {
        setFieldValue(`otp[${idx}]`, char)
      })
    }
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
    >
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden w-full max-w-md p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-emerald-300 via-white to-purple-300 bg-clip-text text-transparent">
            Two-Factor Authentication
          </h1>

          {error && <div className="text-red-300 text-center mb-4 font-medium">{error}</div>}

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
                      className={`w-12 h-12 text-center text-xl rounded-lg bg-white/30 text-white placeholder-white/70 font-bold border-2 backdrop-blur-sm ${
                        touched.otp && errors.otp ? "border-red-400" : "border-white/40"
                      } focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-purple-500 hover:from-emerald-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading && <FaSpinner className="animate-spin" />}
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-6 text-center text-white/80">
            Didn't receive a code?{" "}
            <a href="/forgot-password" className="text-emerald-300 hover:underline font-semibold">
              Resend Code
            </a>
          </p>

          <p
            className="mt-4 text-center text-purple-300 hover:underline cursor-pointer font-medium"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </p>
        </div>
      </div>
    </VideoBackground>
  )
}

export default TwoFactorAuth
