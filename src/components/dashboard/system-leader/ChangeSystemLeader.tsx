// @ts-nocheck
"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useDispatch } from "react-redux"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { motion } from "framer-motion"
import { AppDispatch } from "../../../Redux/store"
import { changeSystemLeader } from "../../../Redux/Slices/SystemLeaderSlice"
import { Check, User, Mail, Phone, AlertCircle, ArrowLeft, Search, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "react-toastify"
import { Link, useNavigate } from "react-router-dom"
import { logout } from "../../../Redux/Slices/LoginSlices"

const countryCodes = [
    { name: "Afghanistan", dial_code: "+93", code: "AF", continent: "Asia", flag: "🇦🇫" },
    { name: "Albania", dial_code: "+355", code: "AL", continent: "Europe", flag: "🇦🇱" },
    { name: "Algeria", dial_code: "+213", code: "DZ", continent: "Africa", flag: "🇩🇿" },
    { name: "Angola", dial_code: "+244", code: "AO", continent: "Africa", flag: "🇦🇴" },
    { name: "Argentina", dial_code: "+54", code: "AR", continent: "South America", flag: "🇦🇷" },
    { name: "Australia", dial_code: "+61", code: "AU", continent: "Oceania", flag: "🇦🇺" },
    { name: "Austria", dial_code: "+43", code: "AT", continent: "Europe", flag: "🇦🇹" },
    { name: "Bahrain", dial_code: "+973", code: "BH", continent: "Asia", flag: "🇧🇭" },
    { name: "Bangladesh", dial_code: "+880", code: "BD", continent: "Asia", flag: "🇧🇩" },
    { name: "Belgium", dial_code: "+32", code: "BE", continent: "Europe", flag: "🇧🇪" },
    { name: "Benin", dial_code: "+229", code: "BJ", continent: "Africa", flag: "🇧🇯" },
    { name: "Botswana", dial_code: "+267", code: "BW", continent: "Africa", flag: "🇧🇼" },
    { name: "Brazil", dial_code: "+55", code: "BR", continent: "South America", flag: "🇧🇷" },
    { name: "Burkina Faso", dial_code: "+226", code: "BF", continent: "Africa", flag: "🇧🇫" },
    { name: "Burundi", dial_code: "+257", code: "BI", continent: "Africa", flag: "🇧🇮" },
    { name: "Cambodia", dial_code: "+855", code: "KH", continent: "Asia", flag: "🇰🇭" },
    { name: "Cameroon", dial_code: "+237", code: "CM", continent: "Africa", flag: "🇨🇲" },
    { name: "Canada", dial_code: "+1", code: "CA", continent: "North America", flag: "🇨🇦" },
    { name: "Cape Verde", dial_code: "+238", code: "CV", continent: "Africa", flag: "🇨🇻" },
    { name: "Central African Republic", dial_code: "+236", code: "CF", continent: "Africa", flag: "🇨🇫" },
    { name: "Chad", dial_code: "+235", code: "TD", continent: "Africa", flag: "🇹🇩" },
    { name: "Chile", dial_code: "+56", code: "CL", continent: "South America", flag: "🇨🇱" },
    { name: "China", dial_code: "+86", code: "CN", continent: "Asia", flag: "🇨🇳" },
    { name: "Colombia", dial_code: "+57", code: "CO", continent: "South America", flag: "🇨🇴" },
    { name: "Comoros", dial_code: "+269", code: "KM", continent: "Africa", flag: "🇰🇲" },
    { name: "Congo", dial_code: "+242", code: "CG", continent: "Africa", flag: "🇨🇬" },
    { name: "Costa Rica", dial_code: "+506", code: "CR", continent: "North America", flag: "🇨🇷" },
    { name: "Croatia", dial_code: "+385", code: "HR", continent: "Europe", flag: "🇭🇷" },
    { name: "Cuba", dial_code: "+53", code: "CU", continent: "North America", flag: "🇨🇺" },
    { name: "Cyprus", dial_code: "+357", code: "CY", continent: "Europe", flag: "🇨🇾" },
    { name: "Czech Republic", dial_code: "+420", code: "CZ", continent: "Europe", flag: "🇨🇿" },
    { name: "Denmark", dial_code: "+45", code: "DK", continent: "Europe", flag: "🇩🇰" },
    { name: "Djibouti", dial_code: "+253", code: "DJ", continent: "Africa", flag: "🇩🇯" },
    { name: "Egypt", dial_code: "+20", code: "EG", continent: "Africa", flag: "🇪🇬" },
    { name: "Equatorial Guinea", dial_code: "+240", code: "GQ", continent: "Africa", flag: "🇬🇶" },
    { name: "Eritrea", dial_code: "+291", code: "ER", continent: "Africa", flag: "🇪🇷" },
    { name: "Estonia", dial_code: "+372", code: "EE", continent: "Europe", flag: "🇪🇪" },
    { name: "Ethiopia", dial_code: "+251", code: "ET", continent: "Africa", flag: "🇪🇹" },
    { name: "Fiji", dial_code: "+679", code: "FJ", continent: "Oceania", flag: "🇫🇯" },
    { name: "Finland", dial_code: "+358", code: "FI", continent: "Europe", flag: "🇫🇮" },
    { name: "France", dial_code: "+33", code: "FR", continent: "Europe", flag: "🇫🇷" },
    { name: "Gabon", dial_code: "+241", code: "GA", continent: "Africa", flag: "🇬🇦" },
    { name: "Gambia", dial_code: "+220", code: "GM", continent: "Africa", flag: "🇬🇲" },
    { name: "Germany", dial_code: "+49", code: "DE", continent: "Europe", flag: "🇩🇪" },
    { name: "Ghana", dial_code: "+233", code: "GH", continent: "Africa", flag: "🇬🇭" },
    { name: "Greece", dial_code: "+30", code: "GR", continent: "Europe", flag: "🇬🇷" },
    { name: "Guinea", dial_code: "+224", code: "GN", continent: "Africa", flag: "🇬🇳" },
    { name: "Guinea-Bissau", dial_code: "+245", code: "GW", continent: "Africa", flag: "🇬🇼" },
    { name: "Hong Kong", dial_code: "+852", code: "HK", continent: "Asia", flag: "🇭🇰" },
    { name: "Hungary", dial_code: "+36", code: "HU", continent: "Europe", flag: "🇭🇺" },
    { name: "Iceland", dial_code: "+354", code: "IS", continent: "Europe", flag: "🇮🇸" },
    { name: "India", dial_code: "+91", code: "IN", continent: "Asia", flag: "🇮🇳" },
    { name: "Indonesia", dial_code: "+62", code: "ID", continent: "Asia", flag: "🇮🇩" },
    { name: "Iran", dial_code: "+98", code: "IR", continent: "Asia", flag: "🇮🇷" },
    { name: "Iraq", dial_code: "+964", code: "IQ", continent: "Asia", flag: "🇮🇶" },
    { name: "Ireland", dial_code: "+353", code: "IE", continent: "Europe", flag: "🇮🇪" },
    { name: "Israel", dial_code: "+972", code: "IL", continent: "Asia", flag: "🇮🇱" },
    { name: "Italy", dial_code: "+39", code: "IT", continent: "Europe", flag: "🇮🇹" },
    { name: "Ivory Coast", dial_code: "+225", code: "CI", continent: "Africa", flag: "🇨🇮" },
    { name: "Jamaica", dial_code: "+1876", code: "JM", continent: "North America", flag: "🇯🇲" },
    { name: "Japan", dial_code: "+81", code: "JP", continent: "Asia", flag: "🇯🇵" },
    { name: "Jordan", dial_code: "+962", code: "JO", continent: "Asia", flag: "🇯🇴" },
    { name: "Kenya", dial_code: "+254", code: "KE", continent: "Africa", flag: "🇰🇪" },
    { name: "Kuwait", dial_code: "+965", code: "KW", continent: "Asia", flag: "🇰🇼" },
    { name: "Lesotho", dial_code: "+266", code: "LS", continent: "Africa", flag: "🇱🇸" },
    { name: "Liberia", dial_code: "+231", code: "LR", continent: "Africa", flag: "🇱🇷" },
    { name: "Libya", dial_code: "+218", code: "LY", continent: "Africa", flag: "🇱🇾" },
    { name: "Madagascar", dial_code: "+261", code: "MG", continent: "Africa", flag: "🇲🇬" },
    { name: "Malawi", dial_code: "+265", code: "MW", continent: "Africa", flag: "🇲🇼" },
    { name: "Malaysia", dial_code: "+60", code: "MY", continent: "Asia", flag: "🇲🇾" },
    { name: "Mali", dial_code: "+223", code: "ML", continent: "Africa", flag: "🇲🇱" },
    { name: "Mauritania", dial_code: "+222", code: "MR", continent: "Africa", flag: "🇲🇷" },
    { name: "Mauritius", dial_code: "+230", code: "MU", continent: "Africa", flag: "🇲🇺" },
    { name: "Mexico", dial_code: "+52", code: "MX", continent: "North America", flag: "🇲🇽" },
    { name: "Morocco", dial_code: "+212", code: "MA", continent: "Africa", flag: "🇲🇦" },
    { name: "Mozambique", dial_code: "+258", code: "MZ", continent: "Africa", flag: "🇲🇿" },
    { name: "Namibia", dial_code: "+264", code: "NA", continent: "Africa", flag: "🇳🇦" },
    { name: "Nepal", dial_code: "+977", code: "NP", continent: "Asia", flag: "🇳🇵" },
    { name: "Netherlands", dial_code: "+31", code: "NL", continent: "Europe", flag: "🇳🇱" },
    { name: "New Zealand", dial_code: "+64", code: "NZ", continent: "Oceania", flag: "🇳🇿" },
    { name: "Niger", dial_code: "+227", code: "NE", continent: "Africa", flag: "🇳🇪" },
    { name: "Nigeria", dial_code: "+234", code: "NG", continent: "Africa", flag: "🇳🇬" },
    { name: "North Korea", dial_code: "+850", code: "KP", continent: "Asia", flag: "🇰🇵" },
    { name: "Norway", dial_code: "+47", code: "NO", continent: "Europe", flag: "🇳🇴" },
    { name: "Oman", dial_code: "+968", code: "OM", continent: "Asia", flag: "🇴🇲" },
    { name: "Pakistan", dial_code: "+92", code: "PK", continent: "Asia", flag: "🇵🇰" },
    { name: "Palestine", dial_code: "+970", code: "PS", continent: "Asia", flag: "🇵🇸" },
    { name: "Panama", dial_code: "+507", code: "PA", continent: "North America", flag: "🇵🇦" },
    { name: "Papua New Guinea", dial_code: "+675", code: "PG", continent: "Oceania", flag: "🇵🇬" },
    { name: "Paraguay", dial_code: "+595", code: "PY", continent: "South America", flag: "🇵🇾" },
    { name: "Peru", dial_code: "+51", code: "PE", continent: "South America", flag: "🇵🇪" },
    { name: "Philippines", dial_code: "+63", code: "PH", continent: "Asia", flag: "🇵🇭" },
    { name: "Poland", dial_code: "+48", code: "PL", continent: "Europe", flag: "🇵🇱" },
    { name: "Portugal", dial_code: "+351", code: "PT", continent: "Europe", flag: "🇵🇹" },
    { name: "Qatar", dial_code: "+974", code: "QA", continent: "Asia", flag: "🇶🇦" },
    { name: "Romania", dial_code: "+40", code: "RO", continent: "Europe", flag: "🇷🇴" },
    { name: "Russia", dial_code: "+7", code: "RU", continent: "Europe", flag: "🇷🇺" },
    { name: "Rwanda", dial_code: "+250", code: "RW", continent: "Africa", flag: "🇷🇼" },
    { name: "Saudi Arabia", dial_code: "+966", code: "SA", continent: "Asia", flag: "🇸🇦" },
    { name: "Senegal", dial_code: "+221", code: "SN", continent: "Africa", flag: "🇸🇳" },
    { name: "Serbia", dial_code: "+381", code: "RS", continent: "Europe", flag: "🇷🇸" },
    { name: "Sierra Leone", dial_code: "+232", code: "SL", continent: "Africa", flag: "🇸🇱" },
    { name: "Singapore", dial_code: "+65", code: "SG", continent: "Asia", flag: "🇸🇬" },
    { name: "Slovakia", dial_code: "+421", code: "SK", continent: "Europe", flag: "🇸🇰" },
    { name: "Slovenia", dial_code: "+386", code: "SI", continent: "Europe", flag: "🇸🇮" },
    { name: "Somalia", dial_code: "+252", code: "SO", continent: "Africa", flag: "🇸🇴" },
    { name: "South Africa", dial_code: "+27", code: "ZA", continent: "Africa", flag: "🇿🇦" },
    { name: "South Korea", dial_code: "+82", code: "KR", continent: "Asia", flag: "🇰🇷" },
    { name: "South Sudan", dial_code: "+211", code: "SS", continent: "Africa", flag: "🇸🇸" },
    { name: "Spain", dial_code: "+34", code: "ES", continent: "Europe", flag: "🇪🇸" },
    { name: "Sri Lanka", dial_code: "+94", code: "LK", continent: "Asia", flag: "🇱🇰" },
    { name: "Sudan", dial_code: "+249", code: "SD", continent: "Africa", flag: "🇸🇩" },
    { name: "Swaziland", dial_code: "+268", code: "SZ", continent: "Africa", flag: "🇸🇿" },
    { name: "Sweden", dial_code: "+46", code: "SE", continent: "Europe", flag: "🇸🇪" },
    { name: "Switzerland", dial_code: "+41", code: "CH", continent: "Europe", flag: "🇨🇭" },
    { name: "Syria", dial_code: "+963", code: "SY", continent: "Asia", flag: "🇸🇾" },
    { name: "Taiwan", dial_code: "+886", code: "TW", continent: "Asia", flag: "🇹🇼" },
    { name: "Tanzania", dial_code: "+255", code: "TZ", continent: "Africa", flag: "🇹🇿" },
    { name: "Thailand", dial_code: "+66", code: "TH", continent: "Asia", flag: "🇹🇭" },
    { name: "Togo", dial_code: "+228", code: "TG", continent: "Africa", flag: "🇹🇬" },
    { name: "Tunisia", dial_code: "+216", code: "TN", continent: "Africa", flag: "🇹🇳" },
    { name: "Turkey", dial_code: "+90", code: "TR", continent: "Europe", flag: "🇹🇷" },
    { name: "Uganda", dial_code: "+256", code: "UG", continent: "Africa", flag: "🇺🇬" },
    { name: "Ukraine", dial_code: "+380", code: "UA", continent: "Europe", flag: "🇺🇦" },
    { name: "United Arab Emirates", dial_code: "+971", code: "AE", continent: "Asia", flag: "🇦🇪" },
    { name: "United Kingdom", dial_code: "+44", code: "GB", continent: "Europe", flag: "🇬🇧" },
    { name: "United States", dial_code: "+1", code: "US", continent: "North America", flag: "🇺🇸" },
    { name: "Uruguay", dial_code: "+598", code: "UY", continent: "South America", flag: "🇺🇾" },
    { name: "Uzbekistan", dial_code: "+998", code: "UZ", continent: "Asia", flag: "🇺🇿" },
    { name: "Venezuela", dial_code: "+58", code: "VE", continent: "South America", flag: "🇻🇪" },
    { name: "Vietnam", dial_code: "+84", code: "VN", continent: "Asia", flag: "🇻🇳" },
    { name: "Western Sahara", dial_code: "+212", code: "EH", continent: "Africa", flag: "🇪🇭" },
    { name: "Yemen", dial_code: "+967", code: "YE", continent: "Asia", flag: "🇾🇪" },
    { name: "Zambia", dial_code: "+260", code: "ZM", continent: "Africa", flag: "🇿🇲" },
    { name: "Zimbabwe", dial_code: "+263", code: "ZW", continent: "Africa", flag: "🇿🇼" },
  ];

// Enhanced Phone Input component with country code selection
const PhoneInput = ({ name, placeholder, label, required = false }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCountries, setFilteredCountries] = useState(countryCodes)
  const [selectedCountry, setSelectedCountry] = useState(
    countryCodes.find((country) => country.code === "US") || countryCodes[0],
  )
  const [phoneNumber, setPhoneNumber] = useState("")

  const handleCountrySelect = useCallback((country:any) => {
    setSelectedCountry(country)
    setShowDropdown(false)
  }, [])

  const handlePhoneChange = useCallback((value:any) => {
    setPhoneNumber(value)
  }, [])

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = countryCodes.filter(
        (country) =>
          country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          country.dial_code.includes(searchTerm) ||
          country.code.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCountries(filtered)
    } else {
      setFilteredCountries(countryCodes)
    }
  }, [searchTerm])

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red">*</span>}
      </label>
      <div className="flex mt-1 relative">
        <Field name={name}>
          {({ field, form }) => {
            // Effect to parse the initial field value if present
            useEffect(() => {
              if (field.value && !phoneNumber) {
                const parts = field.value.split(" ")
                if (parts.length > 1) {
                  const dialCode = parts[0]
                  const numberPart = field.value.substring(dialCode.length + 1)
                  setPhoneNumber(numberPart)

                  const country = countryCodes.find((c) => c.dial_code === dialCode)
                  if (country) {
                    setSelectedCountry(country)
                  }
                }
              }
            }, [field.value]); // Only run when field.value changes

            // Separate effect for updating the form value
            useEffect(() => {
              const fullNumber = `${selectedCountry.dial_code} ${phoneNumber}`
              if (field.value !== fullNumber) {
                form.setFieldValue(name, fullNumber)
              }
            }, [selectedCountry.dial_code, phoneNumber]); // Only include primitive values

            return (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-between w-28 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-green focus:border-green-500 bg-gray-50"
                  >
                    <span className="flex items-center">
                      <span className="mr-2 text-base">{selectedCountry.flag}</span>
                      <span>{selectedCountry.dial_code}</span>
                    </span>
                    {showDropdown ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  {showDropdown && (
                    <div className="absolute top-full left-0 z-10 mt-1 w-64 max-h-60 overflow-auto bg-white rounded-md shadow-lg border border-gray-300">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green focus:border-green-500"
                            placeholder="Search countries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      <ul className="py-1">
                        {filteredCountries.map((country) => (
                          <li
                            key={country.code}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${
                              country.dial_code === selectedCountry.dial_code ? "bg-gray-100" : ""
                            }`}
                            onClick={() => handleCountrySelect(country)}
                          >
                            <div className="flex items-center">
                              <span className="mr-2">{country.flag}</span>
                              <span className="text-sm">{country.name}</span>
                            </div>
                            <span className="text-sm font-medium">{country.dial_code}</span>
                          </li>
                        ))}
                        {filteredCountries.length === 0 && (
                          <li className="px-4 py-2 text-sm text-gray-500">No countries found</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-green focus:border-green-500"
                    placeholder={placeholder}
                  />
                </div>
              </>
            )
          }}
        </Field>
      </div>
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red" />
    </div>
  )
}

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  telephone: Yup.string().required("Telephone number is required"),
})

const ChangeSystemLeader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showError, setShowError] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  const handleTryAgain = () => {
    setShowError(false)
  }

  const renderErrorMessage = () => {
    return (
      <div className="text-center py-10">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full border border-red-500">
          <AlertCircle className="h-6 w-6 text-red" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-red">Error Occurred</h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleTryAgain}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full mt-6 flex flex-col py-2 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-6">
        <Link to="/system-leader" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full mx-auto space-y-8 p-6 bg-white rounded-xl shadow-md"
      >
        <h2 className="text-center text-2xl font-bold text-gray-900">Change System Leader</h2>

        <div className="bg-yellow-50 border-l-4 border-[#FF8C00] p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-[#FF8C00]" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-[#FF8C00]">
                <strong>Warning:</strong> Changing the system leader will delete the current system leader account. You
                will be logged out immediately after the change is complete.
              </p>
            </div>
          </div>
        </div>

        {error && showError ? (
          renderErrorMessage()
        ) : (
          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              telephone: "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              setSubmitting(true)
              setLoading(true)
              dispatch(changeSystemLeader(values))
                .unwrap()
                .then(() => {
                  toast.success("System leader changed successfully. Please login with the new credentials.")
                  // Logout and redirect to login page
                  setTimeout(() => {
                    handleLogout()
                  }, 1500)
                })
                .catch((err) => {
                  setShowError(true)
                  setError(err || "Failed to change system leader")
                  toast.error("Failed to change system leader")
                })
                .finally(() => {
                  setSubmitting(false)
                  setLoading(false)
                })
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name <span className="text-red">*</span>
                      </label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Field
                          name="firstName"
                          type="text"
                          className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green-500"
                          placeholder="Enter first name"
                        />
                      </div>
                      <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red" />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name <span className="text-red">*</span>
                      </label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Field
                          name="lastName"
                          type="text"
                          className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green-500"
                          placeholder="Enter last name"
                        />
                      </div>
                      <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red">*</span>
                    </label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Field
                        name="email"
                        type="email"
                        className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green-500"
                        placeholder="Enter email address"
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red" />
                  </div>

                  <PhoneInput name="telephone" placeholder="Enter telephone number" label="Telephone" required={true} />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                      ${
                        loading || isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
                      }`}
                  >
                    {loading || isSubmitting ? (
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
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Check className="h-5 w-5 mr-2" />
                        Change System Leader
                      </span>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </motion.div>
    </div>
  )
}

export default ChangeSystemLeader