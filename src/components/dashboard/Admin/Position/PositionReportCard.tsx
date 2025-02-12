import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card";
import { useSelector, useDispatch } from "react-redux";
import { fetchPositions } from "../../../../Redux/Slices/PositionSlices";
import { AppDispatch, RootState } from "../../../../Redux/store";
import { BarChart, Briefcase, Users, Calendar, AlertCircle } from "lucide-react";

const PositionSummaryCard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { positions, loading, error } = useSelector((state: RootState) => state.positions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchPositions())
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [dispatch]);

  const totalPositions = positions.length;
  const activePositions = positions.filter(pos => pos.isActive).length;
  const inactivePositions = totalPositions - activePositions;
  
  const newestPosition = positions.length > 0 ? 
    [...positions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : 
    null;
    
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentlyUpdatedCount = positions.filter(
    pos => new Date(pos.updated_at) > sevenDaysAgo
  ).length;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <AlertCircle className="h-8 w-8 text-red mb-2" />
            <p className="text-red">Error loading position data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <BarChart className="mr-2 h-5 w-5" />
          Position Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Positions</p>
                <p className="text-2xl font-bold">{totalPositions}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue opacity-70" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Active</p>
                <p className="text-2xl font-bold">{activePositions}</p>
              </div>
              <Users className="h-8 w-8 text-green opacity-70" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Inactive</p>
                <p className="text-2xl font-bold">{inactivePositions}</p>
              </div>
              <Users className="h-8 w-8 text-red opacity-70" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Updated (7d)</p>
                <p className="text-2xl font-bold">{recentlyUpdatedCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500 opacity-70" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PositionSummaryCard;