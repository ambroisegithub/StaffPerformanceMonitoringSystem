// @ts-nocheck
"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik"
import * as Yup from "yup"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Check, ChevronLeft, ChevronRight, Plus, Trash2, X, Loader, ChevronDown, ChevronUp } from "lucide-react"
import { createGroup, clearError } from "../../../../Redux/Slices/GroupSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"

interface Department {
  departmentName: string;
}

interface Subsidiary {
  subsidiaryName: string;
  tinNumber: string;
  departments: Department[];
}

interface GroupFormValues {
  groupName: string;
  tinNumber: string;
  departments: Department[];
  subsidiaries: Subsidiary[];
  hasSubsidiaries: boolean;
}

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 min-w-80 max-w-md px-4 py-3 rounded-md shadow-lg 
        ${type === 'success' ? 'bg-green text-white' : 'bg-red text-white'}`}
    >
      <div className="flex items-center">
        {type === 'success' ? (
          <Check className="mr-2" size={20} />
        ) : (
          <AlertCircle className="mr-2" size={20} />
        )}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded">
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const validationSchema = Yup.object().shape({
  groupName: Yup.string().required("Group name is required"),
  tinNumber: Yup.string().required("TIN is required"),
  hasSubsidiaries: Yup.boolean().required("Please select an option"),
  departments: Yup.array().of(
    Yup.object().shape({
      departmentName: Yup.string().required("Department name is required"),
    }),
  ),
  subsidiaries: Yup.array().when('hasSubsidiaries', {
    is: true,
    then: () => Yup.array().of(
      Yup.object().shape({
        subsidiaryName: Yup.string().required("Subsidiary name is required"),
        tinNumber: Yup.string().required("TIN is required"),
        departments: Yup.array().of(
          Yup.object().shape({
            departmentName: Yup.string().required("Department name is required"),
          }),
        ),
      }),
    ),
    otherwise: () => Yup.array(),
  }),
})

const initialValues: GroupFormValues = {
  groupName: "",
  tinNumber: "",
  departments: [],
  subsidiaries: [],
  hasSubsidiaries: false
}

const GroupPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.group)
  const [step, setStep] = useState(1)
  const { user } = useSelector((state: RootState) => state.login);
  const [expandedSections, setExpandedSections] = useState<Record<string, Record<number, boolean> | boolean>>({
    holdingCompany: true,
    subsidiaries: {}
  })
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  })

  useEffect(() => {
    if (error) {
      setNotification({
        show: true,
        type: 'error',
        message: error
      });
    }
  }, [error]);

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
    if (notification.type === 'error') {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (
    values: GroupFormValues,
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    try {
      if (!user?.organization?.id) {
        throw new Error("Organization ID is missing");
      }
  
      // Include organization_id in the payload
      const dataToSubmit = {
        ...values,
        subsidiaries: values.hasSubsidiaries ? values.subsidiaries : [],
        organization_id: user.organization.id, // Add organization_id
      };
  
      await dispatch(createGroup(dataToSubmit)).unwrap();
  
      // Show success notification
      setNotification({
        show: true,
        type: "success",
        message: "Group created successfully!",
      });
      resetForm();
      setStep(1);
    } catch (error) {
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = (values: GroupFormValues) => {
    if (!values.hasSubsidiaries) {
      // If no subsidiaries, skip to the review step
      if (step === 1) {
        setStep(4); // Jump to review step
      } else {
        setStep(step + 1);
      }
    } else {
      setStep(step + 1);
    }
  }
  
  const prevStep = (values: GroupFormValues) => {
    if (!values.hasSubsidiaries) {
      // If no subsidiaries and in review step, go back to step 1
      if (step === 4) {
        setStep(1);
      } else {
        setStep(step - 1);
      }
    } else {
      setStep(step - 1);
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    })
  }

  const toggleSubsidiarySection = (index: number) => {
    setExpandedSections({
      ...expandedSections,
      subsidiaries: {
        ...expandedSections.subsidiaries as Record<number, boolean>,
        [index]: !(expandedSections.subsidiaries as Record<number, boolean>)[index]
      }
    })
  }

  // Function to get step labels based on hasSubsidiaries value
  const getStepLabels = (hasSubsidiaries: boolean) => {
    return hasSubsidiaries 
      ? ["Holding Company", "Add Subsidiaries", "Add Departments", "Review"]
      : ["Holding Company", "Review"];
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto mt-20">
      {/* Notification System */}
      <AnimatePresence>
        {notification.show && (
          <Notification 
            type={notification.type} 
            message={notification.message} 
            onClose={closeNotification} 
          />
        )}
      </AnimatePresence>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, isSubmitting, setFieldValue, handleSubmit }) => (
          <Form className="space-y-6">
            {/* Stepper - Conditionally show based on hasSubsidiaries */}
            <div className="mb-8">
              <ol className="flex items-center w-full">
                {getStepLabels(values.hasSubsidiaries).map((label, index) => {
                  const stepNumber = index + 1;
                  const isActive = values.hasSubsidiaries 
                    ? step === stepNumber
                    : (stepNumber === 1 && step === 1) || (stepNumber === 2 && step === 4);
                  
                  const isPassed = values.hasSubsidiaries
                    ? step > stepNumber
                    : (stepNumber === 1 && step > 1);
                  
                  return (
                    <li key={index} className={`flex items-center ${index + 1 < (values.hasSubsidiaries ? 4 : 2) ? "w-full" : ""}`}>
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full 
                        ${isPassed ? "bg-green" : isActive ? "bg-blue" : "bg-gray-300"} 
                        text-white`}
                      >
                        {isPassed ? <Check size={16} /> : stepNumber}
                      </div>
                      <span className={`ml-2 text-sm ${isActive ? "font-bold" : ""}`}>{label}</span>
                      {index + 1 < (values.hasSubsidiaries ? 4 : 2) && (
                        <div className={`flex-1 h-0.5 mx-4 ${isPassed ? "bg-green" : "bg-gray-300"}`}></div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Step 1: Holding Company Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">Company Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <Field
                      name="groupName"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                      placeholder="Enter group name"
                    />
                    <ErrorMessage name="groupName" component="div" className="mt-1 text-sm text-red" />
                  </div>

                  <div>
                    <label htmlFor="tinNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      TIN/Company Code
                    </label>
                    <Field
                      name="tinNumber"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                      placeholder="Enter TIN/Code"
                    />
                    <ErrorMessage name="tinNumber" component="div" className="mt-1 text-sm text-red" />
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Does this holding company have subsidiaries?
  </label>
  <div className="flex space-x-4">
    {/* Only show "Yes" option if organization.hasSubsidiaries is true */}
    {user?.organization?.hasSubsidiaries !== false && (
      <label className="inline-flex items-center">
        <Field
          type="radio"
          name="hasSubsidiaries"
          value={true}
          checked={values.hasSubsidiaries === true}
          onChange={() => setFieldValue('hasSubsidiaries', true)}
          className="form-radio h-4 w-4 text-green"
        />
        <span className="ml-2">Yes</span>
      </label>
    )}
    
    {/* Only show "No" option if organization.hasSubsidiaries is false */}
    {user?.organization?.hasSubsidiaries !== true && (
      <label className="inline-flex items-center">
        <Field
          type="radio"
          name="hasSubsidiaries"
          value={false}
          checked={values.hasSubsidiaries === false}
          onChange={() => setFieldValue('hasSubsidiaries', false)}
          className="form-radio h-4 w-4 text-green"
        />
        <span className="ml-2">No</span>
      </label>
    )}
  </div>
  <ErrorMessage name="hasSubsidiaries" component="div" className="mt-1 text-sm text-red" />
</div>

                  <div>
                    <h3 className="text-md font-medium mb-2">Add Departments</h3>
                    <FieldArray name="departments">
                      {({ push, remove }) => (
                        <div>
                          {values.departments.map((department: Department, index: number) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                              <Field
                                name={`departments.${index}.departmentName`}
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                placeholder="Enter department name"
                              />
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 text-red hover:bg-red-50 rounded"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => push({ departmentName: "" })}
                            className="flex items-center space-x-2 px-4 py-2 bg-green text-white rounded-md hover:bg-blue"
                          >
                            <Plus size={16} />
                            <span>Add Department</span>
                          </button>
                        </div>
                      )}
                    </FieldArray>
                  </div>
                  
                  {/* Create Group Button (Only show when hasSubsidiaries is false) */}
                  {!values.hasSubsidiaries && (
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-green text-white rounded-md hover:bg-blue flex items-center justify-center disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader size={16} className="mr-2 animate-spin" />
                            validating...
                          </>
                        ) : (
                          <>
                            <Check size={16} className="mr-2" />
                            Validate
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Add Subsidiaries (only if hasSubsidiaries is true) */}
            {step === 2 && values.hasSubsidiaries && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">Add Subsidiaries</h2>
                <FieldArray name="subsidiaries">
                  {({ push, remove }) => (
                    <div>
                      {values.subsidiaries.map((subsidiary: Subsidiary, index: number) => (
                        <div key={index} className="mb-4 p-4 border rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-medium">Subsidiary {index + 1}</h3>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 text-red hover:bg-red-50 rounded"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label
                                htmlFor={`subsidiaries.${index}.subsidiaryName`}
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Subsidiary Name
                              </label>
                              <Field
                                name={`subsidiaries.${index}.subsidiaryName`}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                placeholder="Enter subsidiary name"
                              />
                              <ErrorMessage
                                name={`subsidiaries.${index}.subsidiaryName`}
                                component="div"
                                className="mt-1 text-sm text-red"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`subsidiaries.${index}.tinNumber`}
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Subsidiary TIN
                              </label>
                              <Field
                                name={`subsidiaries.${index}.tinNumber`}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                placeholder="Enter TIN/Code"
                              />
                              <ErrorMessage
                                name={`subsidiaries.${index}.tinNumber`}
                                component="div"
                                className="mt-1 text-sm text-red"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push({ subsidiaryName: "", tinNumber: "", departments: [] })}
                        className="flex items-center space-x-2 px-4 py-2 bg-green text-white rounded-md hover:bg-blue"
                      >
                        <Plus size={16} />
                        <span>Add Subsidiary</span>
                      </button>
                    </div>
                  )}
                </FieldArray>
              </motion.div>
            )}

            {/* Step 3: Add Departments to Subsidiaries (only if hasSubsidiaries is true) */}
            {step === 3 && values.hasSubsidiaries && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">Add Departments to Subsidiaries</h2>
                <FieldArray name="subsidiaries">
                  {({ remove }) => (
                    <div>
                      {values.subsidiaries.map((subsidiary: Subsidiary, subsidiaryIndex: number) => (
                        <div key={subsidiaryIndex} className="mb-4 p-4 border rounded-md">
                          <h3 className="text-lg font-medium mb-2">{subsidiary.subsidiaryName}</h3>
                          <FieldArray name={`subsidiaries.${subsidiaryIndex}.departments`}>
                            {({ push, remove: removeDepartment }) => (
                              <div>
                                {subsidiary.departments.map((department: Department, deptIndex: number) => (
                                  <div key={deptIndex} className="flex items-center space-x-2 mb-2">
                                    <Field
                                      name={`subsidiaries.${subsidiaryIndex}.departments.${deptIndex}.departmentName`}
                                      type="text"
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                      placeholder="Enter department name"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeDepartment(deptIndex)}
                                      className="p-2 text-red hover:bg-red-50 rounded"
                                    >
                                      <Trash2 size={20} />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => push({ departmentName: "" })}
                                  className="flex items-center space-x-2 px-4 py-2 bg-green text-white rounded-md hover:bg-blue"
                                >
                                  <Plus size={16} />
                                  <span>Add Department</span>
                                </button>
                              </div>
                            )}
                          </FieldArray>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldArray>
              </motion.div>
            )}

            {/* Step 4: Review with Hierarchical Tree Structure */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">Review Information</h2>
                <div className="space-y-6">
                  {/* Holding Company Section with Toggle */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div 
                      className="flex items-center justify-between cursor-pointer" 
                      onClick={() => toggleSection('holdingCompany')}
                    >
                      <h3 className="text-lg font-medium">Holding Company: {values.groupName}</h3>
                      {expandedSections.holdingCompany ? (
                        <ChevronUp size={20} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-500" />
                      )}
                    </div>
                    
                    {expandedSections.holdingCompany && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-300">
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <dt className="text-sm font-medium text-gray-500">Name:</dt>
                          <dd className="text-sm text-gray-900">{values.groupName}</dd>
                          <dt className="text-sm font-medium text-gray-500">TIN:</dt>
                          <dd className="text-sm text-gray-900">{values.tinNumber}</dd>
                          <dt className="text-sm font-medium text-gray-500">Has Subsidiaries:</dt>
                          <dd className="text-sm text-gray-900">{values.hasSubsidiaries ? "Yes" : "No"}</dd>
                        </dl>
                        
                        {/* Holding Company Departments */}
                        {values.departments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-md font-medium mb-2">Departments:</h4>
                            <ul className="list-none pl-4 border-l border-gray-300">
                              {values.departments.map((dept: Department, index: number) => (
                                <li key={index} className="text-sm py-1 flex items-center">
                                  <div className="w-2 h-2 bg-blue rounded-full mr-2"></div>
                                  {dept.departmentName}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Subsidiaries Section - Only show if hasSubsidiaries is true */}
                  {values.hasSubsidiaries && values.subsidiaries.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-lg font-medium mb-2">Subsidiaries</h3>
                      <div className="space-y-4 pl-4 border-l-2 border-gray-300">
                        {values.subsidiaries.map((subsidiary: Subsidiary, index: number) => (
                          <div key={index} className="mb-2">
                            <div 
                              className="flex items-center justify-between cursor-pointer" 
                              onClick={() => toggleSubsidiarySection(index)}
                            >
                              <h4 className="text-md font-medium">{subsidiary.subsidiaryName}</h4>
                              {(expandedSections.subsidiaries as Record<number, boolean>)[index] ? (
                                <ChevronUp size={18} className="text-gray-500" />
                              ) : (
                                <ChevronDown size={18} className="text-gray-500" />
                              )}
                            </div>
                            
                            {(expandedSections.subsidiaries as Record<number, boolean>)[index] && (
                              <div className="mt-2 pl-4 border-l border-gray-300">
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                                  <dt className="text-sm font-medium text-gray-500">TIN:</dt>
                                  <dd className="text-sm text-gray-900">{subsidiary.tinNumber}</dd>
                                </dl>
                                
                                {/* Subsidiary Departments */}
                                {subsidiary.departments.length > 0 && (
                                  <div className="mt-2">
                                    <h5 className="text-sm font-medium mb-1">Departments:</h5>
                                    <ul className="list-none pl-4 border-l border-gray-300">
                                      {subsidiary.departments.map((dept: Department, deptIndex: number) => (
                                        <li key={deptIndex} className="text-sm py-1 flex items-center">
                                          <div className="w-2 h-2 bg-green rounded-full mr-2"></div>
                                          {dept.departmentName}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Create Group Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-green text-white rounded-md hover:bg-blue flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Creating Group...
                      </>
                    ) : (
                      <>
                        <Check size={16} className="mr-2" />
                        Create Group
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => prevStep(values)}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Back
                </button>
              )}

              {((step < 4 && values.hasSubsidiaries) || (step === 1 && !values.hasSubsidiaries)) && (
                <button
                  type="button"
                  onClick={() => nextStep(values)}
                  className="ml-auto flex items-center px-4 py-2 bg-green text-white rounded-md hover:bg-green"
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default GroupPage