// "use client"

// import React from "react"
// import { FileText, FileSpreadsheet, FileIcon as FilePdf } from "lucide-react"
// import { exportToPDF, exportToExcel, exportToDOCX } from "../../../../utils/exportUtils"
// import { Button } from "../button"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../ui/dropdown-menu"

// interface ExportOptionsProps {
//   data: any[]
//   title?: string
//   disabled?: boolean
// }

// const ExportOptions: React.FC<ExportOptionsProps> = ({ data, title = "Task Review Report", disabled = false }) => {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="outline" size="sm" className="flex items-center gap-2" disabled={disabled}>
//           <FileText className="h-4 w-4" />
//           <span>Export</span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-48">
//         <DropdownMenuItem onClick={() => exportToPDF(data, title)} className="flex items-center gap-2 cursor-pointer">
//           <FilePdf className="h-4 w-4 text-red-500" />
//           <span>Export as PDF</span>
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => exportToExcel(data, title)} className="flex items-center gap-2 cursor-pointer">
//           <FileSpreadsheet className="h-4 w-4 text-green-600" />
//           <span>Export as Excel</span>
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => exportToDOCX(data, title)} className="flex items-center gap-2 cursor-pointer">
//           <FileText className="h-4 w-4 text-blue-600" />
//           <span>Export as Word</span>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }

// export default ExportOptions

