"use client"

import React from "react"
import { useState } from "react"
import { useEffect } from "react"
import { fetchUsers } from "../../../../Redux/Slices/ManageUserSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { useDispatch, useSelector } from "react-redux"
import LevelPage from "./LevelPage"
import LevelAssignment from "./LevelAssignment"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs"

const SupervisoryManagementPage: React.FC = () => {
    const { user: loggedInUser } = useSelector((state: RootState) => state.login); 
    const dispatch = useDispatch<AppDispatch>()
  
  const [activeTab, setActiveTab] = useState("levels")
  useEffect(() => {
    if (loggedInUser?.organization?.id) {
      dispatch(fetchUsers(loggedInUser.organization.id));
    }
  }, [dispatch, loggedInUser]);
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Supervisory Management</h1>
      <p className="text-gray-500 mb-6">Manage supervisory levels and assign them to users</p>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="levels">Supervisory Levels</TabsTrigger>
                                {loggedInUser?.role !== "overall" && (

          <TabsTrigger value="assignments">Change user Level</TabsTrigger>
                                )}
                                  
        </TabsList>

        <TabsContent value="levels" className="mt-6">
          <LevelPage />
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <div className="max-w-4xl mx-auto">
            <LevelAssignment showTitle={true} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SupervisoryManagementPage

