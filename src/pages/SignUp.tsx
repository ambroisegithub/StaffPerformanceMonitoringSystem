"use client";

import { motion } from "framer-motion";
import {
  FaUserPlus,
  FaBuilding,
  FaMapMarkerAlt,
  FaSpinner,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { registerUser, UserRole } from "../Redux/Slices/SignUp";
import DOMPurify from "dompurify";
import type { RootState, AppDispatch } from "../Redux/store";

interface IDepartment {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
  };
}

interface ICompany {
  id: number;
  name: string;
  departments: {
    id: number;
    name: string;
  }[];
}

interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .matches(
      /^(?![0-9]+$)[a-zA-Z0-9._]+$/,
      "Username can only contain letters, numbers, underscores, and periods"
    ),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .trim()
    .lowercase(),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .matches(/^\S*$/, "Password cannot contain spaces"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  company_id: Yup.number()
    .required("Company selection is required")
    .min(1, "Please select a company"),
  department_id: Yup.number()
    .required("Department selection is required")
    .min(1, "Please select a department"),
});

const SignUp: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<
    IDepartment[]
  >([]);
  const [showPassword, setShowPassword] = useState(false);
  const signUpState = useSelector((state: RootState) => state.signUp);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [submissionAttempts, setSubmissionAttempts] = useState(0);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => {
    // Fetch companies
    axios
      .get<APIResponse<{ companies: ICompany[] }>>(
        `${import.meta.env.VITE_BASE_URL}/v1/companies`
      )
      .then((response) => {
        if (response.data.success && response.data.data.companies) {
          setCompanies(response.data.data.companies);
        } else {
          setCompanies([]);
        }
      })
      .catch((err) => {
        setCompanies([]);
      });

    // Fetch departments
    axios
      .get<APIResponse<{ departments: IDepartment[] }>>(
        `${import.meta.env.VITE_BASE_URL}/v1/departments`
      )
      .then((response) => {
        if (response.data.success && response.data.data.departments) {
          setDepartments(response.data.data.departments);
        } else {
          setDepartments([]);
        }
      })
      .catch((err) => {
        setDepartments([]);
      });
  }, []);

  useEffect(() => {
    if (submissionAttempts >= 5) {
      setIsRateLimited(true);
      const timer = setTimeout(() => {
        setIsRateLimited(false);
        setSubmissionAttempts(0);
      }, 300000); // 5 minutes cooldown
      return () => clearTimeout(timer);
    }
  }, [submissionAttempts]);

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return strength;
  };

  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_id: "",
    department_id: "",
    role: UserRole.EMPLOYEE,
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setErrors }: any
  ) => {
    if (isRateLimited) {
      setErrors({
        submit: "Too many attempts. Please try again in 5 minutes.",
      });
      return;
    }

    setSubmissionAttempts((prev) => prev + 1);

    try {
      // Sanitize and validate input
      const sanitizedValues = {
        ...values,
        username: DOMPurify.sanitize(values.username),
        email: DOMPurify.sanitize(values.email.toLowerCase()),
        company_id: Number(values.company_id),
        department_id: Number(values.department_id),
      };

      await dispatch(registerUser(sanitizedValues)).unwrap();
      navigate("/login");
    } catch (error: any) {
      setErrors({
        submit: error.message || "Registration failed. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl"
      >
        <div className="grid lg:grid-cols-2 gap-12 p-8 lg:p-12 items-center">
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green/100 to-purple-600 bg-clip-text text-transparent mb-6">
              Create Your Account
            </h2>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, isSubmitting, errors, touched }) => {
                // Update available departments when company changes
                useEffect(() => {
                  if (values.company_id) {
                    const selectedCompany = companies.find(
                      (c) => c.id === Number(values.company_id)
                    );
                    if (selectedCompany) {
                      const companyDepartments = departments.filter(
                        (dept) => dept.company.id === selectedCompany.id
                      );
                      setAvailableDepartments(companyDepartments);
                      // Reset department selection when company changes
                      setFieldValue("department_id", "");
                    }
                  } else {
                    setAvailableDepartments([]);
                  }
                }, [values.company_id, setFieldValue, companies, departments]); //Corrected dependencies

                return (
                  <Form className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Field
                          name="username"
                          type="text"
                          placeholder="Username"
                          className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green ${
                            touched.username && errors.username
                              ? "border-red"
                              : "border-gray-200"
                          }`}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const value = e.target.value.trim();
                            setFieldValue("username", value);
                          }}
                        />
                        <ErrorMessage
                          name="username"
                          component="div"
                          className="text-red text-sm mt-1"
                        />
                      </div>

                      <div>
                        <Field
                          name="email"
                          type="email"
                          placeholder="Email"
                          className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green ${
                            touched.email && errors.email
                              ? "border-red"
                              : "border-gray-200"
                          }`}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const value = e.target.value.toLowerCase().trim();
                            setFieldValue("email", value);
                          }}
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-red text-sm mt-1"
                        />
                      </div>

                      <div>
                        <div className="relative">
                          <Field
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green ${
                              touched.password && errors.password
                                ? "border-red"
                                : "border-gray-200"
                            }`}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const value = e.target.value;
                              setFieldValue("password", value);
                              setPasswordStrength(
                                calculatePasswordStrength(value)
                              );
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        {values.password && (
                          <div className="mt-2">
                            <div className="h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  passwordStrength >= 80
                                    ? "bg-green"
                                    : passwordStrength >= 60
                                    ? "bg-yellow"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Password strength:{" "}
                              {passwordStrength >= 80
                                ? "Strong"
                                : passwordStrength >= 60
                                ? "Medium"
                                : "Weak"}
                            </p>
                          </div>
                        )}
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="text-red text-sm mt-1"
                        />
                      </div>
                      <div className="relative mb-6">
                        <div className="relative">
                          <Field
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green ${
                              touched.confirmPassword && errors.confirmPassword
                                ? "border-red"
                                : "border-gray-200"
                            } pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-red text-sm mt-1 absolute m"
                        />
                      </div>

                      <div>
                        <Field
                          as="select"
                          name="company_id"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green mt-5"
                        >
                          <option
                            value=""
                            className="select-none text-gray-500"
                            disabled
                          >
                            Select Company
                          </option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="company_id"
                          component="div"
                          className="text-red text-sm mt-1"
                        />
                      </div>

                      <div>
                        <Field
                          as="select"
                          name="department_id"
                          disabled={!values.company_id}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option
                            value=""
                            className="select-none text-gray-500"
                            disabled
                          >
                            Select Department
                          </option>
                          {availableDepartments.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="department_id"
                          component="div"
                          className="text-red text-sm mt-1"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isRateLimited}
                      className="w-full bg-green/100 text-white px-6 py-3 rounded-lg hover:bg-blue/100 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          <span>Registering...</span>
                        </div>
                      ) : (
                        <>
                          <FaUserPlus className="text-xl" />
                          <span>Register</span>
                        </>
                      )}
                    </button>
                  </Form>
                );
              }}
            </Formik>

            <p className="text-gray-600 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-green hover:underline">
                Login here
              </Link>
            </p>
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
                    <FaBuilding className="w-8 h-8 text-green" />
                    <p className="text-gray-700">
                      Register your company and departments to get started.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <FaMapMarkerAlt className="w-8 h-8 text-purple-600" />
                    <p className="text-gray-700">
                      Track employee locations in real-time for better
                      management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
