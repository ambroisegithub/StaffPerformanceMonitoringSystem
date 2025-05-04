// @ts-nocheck

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/Card"
import { Progress } from "../../../../components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
import { TrendingUp, BarChart3 } from "lucide-react"

interface TrendsViewProps {
  monthlyTrends: any[]
}

const TrendsView: React.FC<TrendsViewProps> = ({ monthlyTrends }) => {
  if (!monthlyTrends || monthlyTrends.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Trend Data Available</h3>
          <p className="text-slate-600">Trend analysis requires at least 2 months of data.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Monthly Performance Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Month</TableHead>
                  <TableHead className="font-semibold">Total Tasks</TableHead>
                  <TableHead className="font-semibold">Submitted Days</TableHead>
                  <TableHead className="font-semibold">Completion Rate</TableHead>
                  <TableHead className="font-semibold">Approval Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyTrends.map((trend) => (
                  <TableRow key={trend.month} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{trend.month}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{trend.totalTasks}</span>
                        <span className="text-sm text-slate-500">tasks</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{trend.submittedDays}</span>
                        <span className="text-sm text-slate-500">days</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Progress value={trend.completionRate} className="w-20 h-2" />
                        <span className="text-sm font-medium min-w-[3rem]">{trend.completionRate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Progress value={trend.approvalRate} className="w-20 h-2" />
                        <span className="text-sm font-medium min-w-[3rem]">{trend.approvalRate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Best Performing Month</h4>
              {(() => {
                const bestMonth = monthlyTrends.reduce((best, current) =>
                  current.completionRate > best.completionRate ? current : best,
                )
                return (
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <p className="font-medium text-emerald-900">{bestMonth.month}</p>
                    <p className="text-sm text-emerald-700">
                      {bestMonth.completionRate.toFixed(1)}% completion rate with {bestMonth.totalTasks} tasks
                    </p>
                  </div>
                )
              })()}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Most Active Month</h4>
              {(() => {
                const mostActive = monthlyTrends.reduce((most, current) =>
                  current.totalTasks > most.totalTasks ? current : most,
                )
                return (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-900">{mostActive.month}</p>
                    <p className="text-sm text-blue-700">
                      {mostActive.totalTasks} tasks completed across {mostActive.submittedDays} days
                    </p>
                  </div>
                )
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TrendsView
