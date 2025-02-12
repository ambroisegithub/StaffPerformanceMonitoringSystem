"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { motion } from "framer-motion"
import axios from "axios"
import { createPosition, clearPositionError } from "../../../../Redux/Slices/PositionSlices"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { ArrowLeft, Save } from 'lucide-react'

// Interfaces for API responses
interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface IDepartment {
  id: number
  name: string
  company: {
    id: number
    name: string
  } | null
  organization_id?: number
}

interface ICompany {
  id: number
  name: string
  departments: {
    id: number
    name: string
  }[]
  organization_id?: number
}

// Form values interface
interface FormValues {
  title: string
  description: string
  company_id: string
  department_id: string
}

// Validation schema
const validationSchema = Yup.object().shape({
  title: Yup.string().required("Position title is required"),
  description: Yup.string().required("Position description is required"),
})

const CreatePositionPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: RootState) => state.positions)
  const { user } = useSelector((state: RootState) => state.login)
  const [formCompletion, setFormCompletion] = useState(0)
  const [companies, setCompanies] = useState<ICompany[]>([])
  const [departments, setDepartments] = useState<IDepartment[]>([])
  const [formValues, setFormValues] = useState<FormValues>({
    title: "",
    description: "",
    company_id: "",
    department_id: "",
  })

  // Calculate form completion percentage
  const calculateFormCompletion = (values: FormValues) => {
    const requiredFields = ["title", "description"]
    let filledFields = 0

    requiredFields.forEach((field) => {
      if (values[field as keyof FormValues]) filledFields++
    })

    return Math.floor((filledFields / requiredFields.length) * 100)
  }

  useEffect(() => {
    const completion = calculateFormCompletion(formValues)
    setFormCompletion(completion)
  }, [formValues])

  useEffect(() => {
    if (error) {
      dispatch(clearPositionError())
    }
  }, [error, dispatch])

  // Fetch companies and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const organizationId = user?.organization?.id

        if (!organizationId) {
          return
        }

        // Fetch companies from the user's organization
        const companiesResponse = await axios.get<APIResponse<{ companies: ICompany[] }>>(
          `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/companies`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        
        if (companiesResponse.data.success && companiesResponse.data.data.companies) {
          setCompanies(companiesResponse.data.data.companies)
        }

        // Fetch departments from the user's organization
        const departmentsResponse = await axios.get<APIResponse<{ departments: IDepartment[] }>>(
          `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/departments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        
        if (departmentsResponse.data.success && departmentsResponse.data.data.departments) {
          setDepartments(departmentsResponse.data.data.departments)
        }
      } catch (error) {
      }
    }

    if (user?.organization?.id) {
      fetchData()
    }
  }, [user?.organization?.id])

  // Filter departments based on selected company
  const filteredDepartments = formValues.company_id
    ? departments.filter(
        (dept) => dept.company && dept.company.id === parseInt(formValues.company_id)
      )
    : departments

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Position</h1>
            <button
              onClick={() => navigate("/admin/manage-position")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Positions
            </button>
          </div>

          {!user?.organization?.id ? (
            <div className="border border-red text-red px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">Organization ID is missing. Please ensure your account is properly set up.</span>
            </div>
          ) : (
            <Formik
              initialValues={formValues}
              validationSchema={validationSchema}
              onSubmit={async (values, { resetForm }) => {
                const positionData = {
                  title: values.title,
                  description: values.description,
                  ...(values.company_id && { company_id: Number(values.company_id) }),
                  ...(values.department_id && { department_id: Number(values.department_id) }),
                }

                try {
                  await dispatch(createPosition(positionData)).unwrap()
                  resetForm()
                  navigate("/admin/manage-position")
                } catch (err) {
                  // Error is handled in the slice
                }
              }}
            >
              {({ values, handleChange, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Form completion progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${formCompletion}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500 text-right">Completion: {formCompletion}%</div>

                  {/* Position Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Position Title <span className="text-red">*</span>
                    </label>
                    <Field
                      name="title"
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g. Senior Software Engineer"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e)
                        setFormValues({ ...formValues, title: e.target.value })
                      }}
                    />
                    <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red" />
                  </div>

                  {/* Position Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red">*</span>
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Describe the responsibilities and requirements for this position"
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        handleChange(e)
                        setFormValues({ ...formValues, description: e.target.value })
                      }}
                    />
                    <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red" />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || formCompletion < 100}
                      className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
                        ${
                          formCompletion < 100
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
                        }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Position
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 border border-red text-red px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default CreatePositionPage