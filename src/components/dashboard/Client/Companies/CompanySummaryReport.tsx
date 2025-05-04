import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Building2, Users, FileText, Briefcase } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../Redux/store';

const CompanySummaryReport = () => {
  const { companies, loading } = useSelector((state: RootState) => state.companies);
  
  // Calculate totals for summary cards
  const totalCompanies = companies?.length || 0;
  const totalUsers = companies?.reduce((sum, company) => sum + (company.userCount || 0), 0) || 0;
  const totalDepartments = companies?.reduce((sum, company) => sum + (company.departments?.length || 0), 0) || 0;
  
  // Group companies by group
  const groupedCompanies = companies?.reduce((acc, company) => {
    const groupName = company.group?.name || 'Independent';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(company);
    return acc;
  }, {} as Record<string, typeof companies>) || {};

  // Get unique groups
  const uniqueGroups = Object.keys(groupedCompanies).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-5">
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue/10 rounded-full">
                <Building2 className="h-8 w-8 text-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Companies</p>
                <h3 className="text-2xl font-bold">{totalCompanies}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        

        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-500 rounded-full">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Departments</p>
                <h3 className="text-2xl font-bold">{totalDepartments}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-amber-500 rounded-full">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Organizations</p>
                <h3 className="text-2xl font-bold">{uniqueGroups}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySummaryReport;