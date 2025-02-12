"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { filterUsers, setActiveLevel } from "../../../../Redux/Slices/supervisorSlice"
import type { RootState, AppDispatch } from "../../../../Redux/store"
import { SupervisoryLevel } from "../../types/users"
import { Search, Filter } from "lucide-react"

const FilterPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { activeLevel } = useSelector((state: RootState) => state.supervisor)

  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Apply filters when dependencies change
  useEffect(() => {
    dispatch(
      filterUsers({
        level: activeLevel || undefined,
        search: searchQuery,
      }),
    )
  }, [dispatch, activeLevel, searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleLevelChange = (level: SupervisoryLevel | null) => {
    dispatch(setActiveLevel(level))
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="flex gap-2 mb-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full border rounded-md"
          />
        </div>

        <button onClick={toggleFilters} className="px-3 py-2 border rounded-md flex items-center gap-1 hover:bg-muted">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="p-4 border rounded-md mb-4 bg-background shadow-sm">
          <h3 className="font-medium mb-2">Filter by Supervisory Level</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleLevelChange(null)}
              className={`px-3 py-1 text-sm rounded-full ${
                activeLevel === null ? "bg-green text-white" : "bg-blue text-white"
              }`}
            >
              All Levels
            </button>
            {Object.values(SupervisoryLevel).map((level) => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeLevel === level ? "bg-green text-white" : "bg-blue text-white"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel

