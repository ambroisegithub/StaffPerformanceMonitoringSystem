import React from "react"
import { useAppSelector } from "../Redux/hooks"
import ProfileForm from "./ProfileForm"

const ProfilePage: React.FC = () => {
  const user = useAppSelector((state:any) => state.login.user)

  if (!user) {
    return (
      <div className="p-4 bg-yellow border border-yellow rounded-md text-yellow-700">
        <p className="text-white">You need to be logged in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <ProfileForm userId={user.id} />
    </div>
  )
}

export default ProfilePage
