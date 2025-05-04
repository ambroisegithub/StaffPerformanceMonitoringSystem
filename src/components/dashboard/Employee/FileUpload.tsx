"use client"

import React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaUpload, FaFile, FaImage, FaVideo, FaMusic, FaTimes, FaExclamationTriangle } from "react-icons/fa"

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxFileSize?: number 
  acceptedTypes?: string[]
  disabled?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = [
    "image/*",
    "video/*",
    "audio/*",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".zip",
    ".rar",
  ],
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <FaImage className="text-blue-500" />
    if (file.type.startsWith("video/")) return <FaVideo className="text-purple-500" />
    if (file.type.startsWith("audio/")) return <FaMusic className="text-green-500" />
    return <FaFile className="text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validationErrors: string[] = []

    // Check total file count
    if (files.length + fileArray.length > maxFiles) {
      validationErrors.push(`Maximum ${maxFiles} files allowed`)
      return { validFiles: [], errors: validationErrors }
    }

    const validFiles: File[] = []

    fileArray.forEach((file) => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        validationErrors.push(`${file.name} exceeds ${maxFileSize}MB limit`)
        return
      }

      // Check file type
      const isValidType = acceptedTypes.some((type) => {
        if (type.includes("*")) {
          return file.type.startsWith(type.replace("*", ""))
        }
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      })

      if (!isValidType) {
        validationErrors.push(`${file.name} is not a supported file type`)
        return
      }

      // Check for duplicates
      const isDuplicate = files.some(
        (existingFile) => existingFile.name === file.name && existingFile.size === file.size,
      )

      if (isDuplicate) {
        validationErrors.push(`${file.name} is already selected`)
        return
      }

      validFiles.push(file)
    })

    return { validFiles, errors: validationErrors }
  }

  const handleFiles = (newFiles: FileList | File[]) => {
    const { validFiles, errors: validationErrors } = validateFiles(newFiles)

    setErrors(validationErrors)

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-400 hover:bg-blue-50"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          <FaUpload className="mx-auto h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500">
              Max {maxFiles} files, {maxFileSize}MB each
            </p>
            <p className="text-xs text-gray-400 mt-1">Supported: Images, Videos, Audio, Documents</p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-md p-3"
          >
            <div className="flex items-start">
              <FaExclamationTriangle className="h-4 w-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({files.length}/{maxFiles})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between bg-gray-50 rounded-md p-3"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    className="ml-2 p-1 text-red-400 hover:text-red-600 transition-colors"
                    disabled={disabled}
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUpload
