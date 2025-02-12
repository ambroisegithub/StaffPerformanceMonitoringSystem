// @ts-nocheck

"use client"

import React from "react"
import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { motion } from "framer-motion"
import {
  fetchHoldingCompanies,
  fetchSupervisoryLevels,
  registerUser,
  clearError,
  fetchPositions,
  resetSuccess,
} from "../../../../Redux/Slices/RegisterSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { ChevronDown, ChevronUp, Check, Briefcase, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"

const validationSchema = Yup.object().shape({
  lastName: Yup.string().required("Last Name is required"),
  firstName: Yup.string().required("First Name is required"),
  telephone: Yup.string().required("Telephone Number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  group_id: Yup.number().required("Holding Company is required"),
  department_id: Yup.number().required("Department is required"),
  supervisoryLevelId: Yup.number().required("Supervisory Level is required"),
  position_id: Yup.number().required("Employee Position is required"),
})

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { holdingCompanies, supervisoryLevels, positions, loading, error, success } = useSelector(
    (state: RootState) => state.register,
  )
  const [selectedHoldingCompany, setSelectedHoldingCompany] = useState<any>(null)
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<any>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalInfo: true,
    companyInfo: true,
  })
  const [formCompletion, setFormCompletion] = useState(0)
  const [formValues, setFormValues] = useState<any>({})
  const [formikValues, setFormikValues] = useState<any>({})

  const calculateFormCompletion = useCallback(
    (values: any) => {
      const requiredFields = [
        "lastName",
        "firstName",
        "telephone",
        "email",
        "group_id",
        "department_id",
        "supervisoryLevelId",
        "position_id",
      ]

      let filledFields = 0
      requiredFields.forEach((field) => {
        if (values[field]) filledFields++
      })

      const totalFields = requiredFields.length
      let totalRequired = totalFields

      if (selectedHoldingCompany?.subsidiaries?.length > 0) {
        totalRequired += 1
        if (values.company_id) filledFields += 1
      }

      return Math.floor((filledFields / totalRequired) * 100)
    },
    [selectedHoldingCompany],
  )

  useEffect(() => {
    dispatch(fetchHoldingCompanies())
    dispatch(fetchSupervisoryLevels())
    dispatch(fetchPositions())
  }, [dispatch])

  useEffect(() => {
    if (success) {
      toast.success("User registered successfully")
    }
  }, [success])

  useEffect(() => {
    if (error) {
      dispatch(clearError())
    }
  }, [error, dispatch])

  useEffect(() => {
    const completion = calculateFormCompletion(formikValues)
    setFormCompletion(completion)
  }, [formikValues, calculateFormCompletion])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleReset = useCallback(
    (resetForm: () => void) => {
      resetForm()
      setSelectedHoldingCompany(null)
      setSelectedSubsidiary(null)
      dispatch(resetSuccess()) // Reset the success state in Redux
    },
    [dispatch],
  )

  const renderSuccessMessage = (resetForm: () => void) => {
    return (
      <div className="text-center py-10">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full border border-green">
          <Check className="h-6 w-6 text-green" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-green">User Created Successfully!</h3>
        <p className="mt-2 text-sm text-gray-500">User has been created and members have been added.</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => handleReset(resetForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
          >
            Create Another User
          </button>
        </div>
      </div>
    )
  }

  const renderErrorMessage = () => {
    return (
      <div className="text-center py-10">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full border border-red">
          <AlertCircle className="h-6 w-6 text-red" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-red">Error Occurred</h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => dispatch(clearError())}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red hover:bg-red focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100vh] mt-10 from-purple-100 via-white to-purple-50 flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-8 p-4 rounded-xl shadow-md"
      >
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Register New User</h2>

        <Formik
          initialValues={{
            lastName: "",
            firstName: "",
            telephone: "",
            email: "",
            group_id: "",
            company_id: "",
            department_id: "",
            supervisoryLevelId: "",
            position_id: "",
          }}
          validationSchema={validationSchema}
          validate={(values) => {
            const errors: Record<string, string> = {}

            if (
              selectedHoldingCompany?.subsidiaries?.length > 0 &&
              !values.company_id &&
              !selectedHoldingCompany.departments.find((d: any) => d.id === Number(values.department_id))
            ) {
              errors.company_id = "Subsidiary is required"
            }

            return errors
          }}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            setSubmitting(true)
            const userData = {
              ...values,
              group_id: Number(values.group_id),
              department_id: Number(values.department_id),
              supervisoryLevelId: Number(values.supervisoryLevelId),
              ...(values.company_id && { company_id: Number(values.company_id) }),
              ...(values.position_id && { position_id: Number(values.position_id) }),
            }

            dispatch(registerUser(userData))
              .unwrap()
              .then(() => {
                // Don't reset the form here, let the success message handle it
              })
              .catch(() => {})
              .finally(() => {
                setSubmitting(false)
              })
          }}
        >
          {({ values, setFieldValue, isSubmitting, resetForm }) => {
            useEffect(() => {
              setFormValues(values)
              setFormikValues(values)
            }, [values])

            if (success) {
              return renderSuccessMessage(resetForm)
            }

            if (error) {
              return renderErrorMessage()
            }

            return (
              <Form className="mt-8 space-y-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green h-2.5 rounded-full" style={{ width: `${formCompletion}%` }}></div>
                </div>
                <div className="text-sm text-gray-500 text-right">Completion: {formCompletion}%</div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("personalInfo")}
                  >
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    {expandedSections.personalInfo ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>

                  {expandedSections.personalInfo && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <Field
                          name="lastName"
                          type="text"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        />
                        <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red" />
                      </div>

                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <Field
                          name="firstName"
                          type="text"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        />
                        <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red" />
                      </div>

                      <div>
                        <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                          Telephone
                        </label>
                        <Field
                          name="telephone"
                          type="tel"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        />
                        <ErrorMessage name="telephone" component="div" className="mt-1 text-sm text-red" />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <Field
                          name="email"
                          type="email"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        />
                        <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red" />
                      </div>

                      <div>
                        <label htmlFor="position_id" className="block text-sm font-medium text-gray-700">
                          Position
                        </label>
                        <div className="relative mt-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Briefcase className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            as="select"
                            name="position_id"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                          >
                            <option value="">Select Position</option>
                            {positions.map((pos) => (
                              <option key={pos.id} value={pos.id}>
                                {pos.title}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          The position determines the user's role and responsibilities within the organization.
                        </p>
                        <ErrorMessage name="position_id" component="div" className="mt-1 text-sm text-red" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("companyInfo")}
                  >
                    <h3 className="text-lg font-medium">Company Information</h3>
                    {expandedSections.companyInfo ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>

                  {expandedSections.companyInfo && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="group_id" className="block text-sm font-medium text-gray-700">
                          Holding Company
                        </label>
                        <Field
                          as="select"
                          name="group_id"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const groupId = Number(e.target.value)
                            setFieldValue("group_id", groupId)
                            setFieldValue("company_id", "")
                            setFieldValue("department_id", "")
                            const selected = holdingCompanies.find((hc) => hc.id === groupId)
                            setSelectedHoldingCompany(selected)
                            setSelectedSubsidiary(null)
                          }}
                        >
                          <option value="">Select Holding Company</option>
                          {holdingCompanies?.map((hc) => (
                            <option key={hc.id} value={hc.id}>
                              {hc.groupName}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="group_id" component="div" className="mt-1 text-sm text-red" />
                      </div>

                      {selectedHoldingCompany && selectedHoldingCompany.subsidiaries?.length > 0 && (
                        <div>
                          <label htmlFor="company_id" className="block text-sm font-medium text-gray-700">
                            Subsidiary (Optional if using holding company departments)
                          </label>
                          <Field
                            as="select"
                            name="company_id"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                              const companyId = Number(e.target.value)
                              setFieldValue("company_id", companyId || "")
                              setFieldValue("department_id", "")
                              if (companyId) {
                                const selectedSub = selectedHoldingCompany.subsidiaries.find(
                                  (sub: any) => sub.id === companyId,
                                )
                                setSelectedSubsidiary(selectedSub)
                              } else {
                                setSelectedSubsidiary(null)
                              }
                            }}
                          >
                            <option value="">Select Subsidiary</option>
                            {selectedHoldingCompany.subsidiaries.map((sub: any) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name="company_id" component="div" className="mt-1 text-sm text-red" />
                        </div>
                      )}

                      <div>
                        <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <Field
                          as="select"
                          name="department_id"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const departmentId = Number(e.target.value)
                            setFieldValue("department_id", departmentId)
                          }}
                        >
                          <option value="">Select Department</option>
                          {selectedHoldingCompany &&
                            !values.company_id &&
                            selectedHoldingCompany.departments?.map((dept: any) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}

                          {selectedSubsidiary &&
                            selectedSubsidiary.departments?.map((dept: any) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                        </Field>
                        <ErrorMessage name="department_id" component="div" className="mt-1 text-sm text-red" />
                      </div>

                      <div>
                        <label htmlFor="supervisoryLevelId" className="block text-sm font-medium text-gray-700">
                          Supervisory Level
                        </label>
                        <Field
                          as="select"
                          name="supervisoryLevelId"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        >
                          <option value="">Select Supervisory Level</option>
                          {supervisoryLevels?.map((level) => (
                            <option key={level.id} value={level.id}>
                              {level.level}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="supervisoryLevelId" component="div" className="mt-1 text-sm text-red" />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || formCompletion < 100}
                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white 
                              ${formCompletion < 100 ? "bg-gray-400 cursor-not-allowed" : "bg-green hover:bg-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"}`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Registering...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Check className="h-5 w-5 mr-2" />
                        Register
                      </span>
                    )}
                  </button>
                </div>
              </Form>
            )
          }}
        </Formik>
      </motion.div>
    </div>
  )
}

export default RegisterPage

