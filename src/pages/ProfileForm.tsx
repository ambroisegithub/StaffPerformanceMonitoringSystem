// @ts-nocheck

"use client"
import React from "react"
import { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../Redux/hooks"
import { fetchProfileData, updateProfileData, setIsEditing } from "../Redux/Slices/profileSlice"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Loader2, Camera, User } from "lucide-react"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card"
import { Input } from "../components/ui/input"
import Loader from "../components/ui/Loader"
import { useSelector } from "react-redux"
import { RootState } from "../Redux/store" 

interface ProfileFormProps {
  userId: number
  onSubmitSuccess?: () => void
  onCancel?: () => void
}

const ProfileForm: React.FC<ProfileFormProps> = ({ userId, onSubmitSuccess, onCancel }) => {
  const dispatch = useAppDispatch()
  const { loading, error, isEditing, updateLoading } = useAppSelector((state) => state.profile)
  
  // Get user info from login state for basic information
  const userInfo = useSelector((state: RootState) => state.login.user)
  
  // Use profile state data for up-to-date fields (particularly telephone, bio, address, and profile picture)
  const profileData = useAppSelector((state) => state.profile.data)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
    bio: "",
    address: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Fetch profile picture when component mounts and whenever it might change
  useEffect(() => {
    dispatch(fetchProfileData(userId))
  }, [dispatch, userId])

  // Update form data using the most up-to-date information
  useEffect(() => {
    // First set basic info from user login state
    if (userInfo) {
      setFormData({
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        email: userInfo.email || "",
        telephone: userInfo.telephone || "",
        bio: userInfo.bio || "",
        address: userInfo.address || "",
      })
    }
    
    // Then override with the most up-to-date data from profile fetch
    if (profileData) {
      setFormData(prevData => ({
        ...prevData,
        telephone: profileData.telephone || prevData.telephone,
        bio: profileData.bio || prevData.bio,
        address: profileData.address || prevData.address,
      }))
    }
  }, [userInfo, profileData])
  
  // Set profile picture from the most up-to-date source
  useEffect(() => {
    if (profileData?.profilePictureUrl) {
      setPreviewUrl(profileData.profilePictureUrl)
    } else if (userInfo?.profilePictureUrl) {
      setPreviewUrl(userInfo.profilePictureUrl)
    }
  }, [profileData?.profilePictureUrl, userInfo?.profilePictureUrl])

  // Handle file selection for profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedFile) {
        // If there's a file, we need to use FormData to send both file and profile data
        const formDataFile = new FormData()

        // Append all profile data
        formDataFile.append("firstName", formData.firstName)
        formDataFile.append("lastName", formData.lastName)
        formDataFile.append("telephone", formData.telephone)
        formDataFile.append("bio", formData.bio || "")
        formDataFile.append("address", formData.address || "")

        // Append the file
        formDataFile.append("profilePicture", selectedFile)

        // Use the updateProfileData action with FormData
        await dispatch(updateProfileData(formDataFile))
      } else {
        // If no file, just update the profile data
        await dispatch(
          updateProfileData({
            firstName: formData.firstName,
            lastName: formData.lastName,
            telephone: formData.telephone,
            bio: formData.bio,
            address: formData.address,
          }),
        )
      }

      // After successful update, fetch the latest profile picture immediately
      await dispatch(fetchProfileData(userId))

      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    dispatch(setIsEditing(!isEditing))
  }

  // Cancel editing
  const handleCancel = () => {
    dispatch(setIsEditing(false))

    // Reset form data to original profile data
    if (profileData) {
      setFormData({
        firstName: userInfo?.firstName || "",
        lastName: userInfo?.lastName || "",
        email: userInfo?.email || "",
        telephone: profileData.telephone || "",
        bio: profileData.bio || "",
        address: profileData.address || "",
      })

      // Reset profile picture preview
      setPreviewUrl(profileData.profilePictureUrl)
      setSelectedFile(null)
    } else if (userInfo) {
      // Fall back to user info if profile data is not available
      setFormData({
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        email: userInfo.email || "",
        telephone: userInfo.telephone || "",
        bio: userInfo.bio || "",
        address: userInfo.address || "",
      })
      
      setPreviewUrl(userInfo.profilePictureUrl)
      setSelectedFile(null)
    }

    if (onCancel) {
      onCancel()
    }
  }

  if (loading && !userInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    )
  }

  if (error && !userInfo) {
    return (
      <div className="text-red p-4 bg-red-50 rounded-md">
        <p>Error loading profile: {error}</p>
        <Button onClick={() => dispatch(fetchProfileData(userId))} className="mt-2 border border-red">
          Retry
        </Button>
      </div>
    )
  }

  // If we don't have userInfo data, show a loading indicator
  if (!userInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">User Profile</CardTitle>
        <CardDescription>View and manage your profile information</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                {previewUrl ? (
                  <img src={previewUrl || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {isEditing && (
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-green text-white p-2 rounded-full shadow-md hover:bg-primary/90 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={!isEditing}
              />
            </div>

            <div className="flex-1">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {userInfo.firstName} {userInfo.lastName}
                </h3>
                <p className="text-gray-500">{userInfo.email}</p>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="bg-blue text-white border-blue-200">
                    {userInfo.role}
                  </Badge>

                  {userInfo.company && (
                    <Badge variant="outline" className="bg-green text-white border-green-200">
                      {userInfo.company.name}
                    </Badge>
                  )}

                  {userInfo.department && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {userInfo.department.name}
                    </Badge>
                  )}
                  
                  {profileData?.supervisoryLevelObj && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {profileData.supervisoryLevelObj.level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>

              <div className="space-y-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={true}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={true}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={true}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telephone
                  </label>
                  <Input
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>

              <div className="space-y-3">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full min-h-[120px]"
                    placeholder={isEditing ? "Tell us about yourself..." : "No bio provided"}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 pt-6">
          {isEditing ? (
            <>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={updateLoading} className="bg-red text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={updateLoading} className="bg-green text-white">
                {updateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={toggleEditMode} className="bg-blue text-white">
              Edit Profile
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}

export default ProfileForm