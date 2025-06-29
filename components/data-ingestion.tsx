"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import { useData } from "@/contexts/data-context"
import * as XLSX from "xlsx"

interface FileUploadStatus {
  name: string
  type: "clients" | "workers" | "tasks"
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  error?: string
  aiMappings?: Record<string, string>
}

export default function DataIngestion() {
  const { setClients, setWorkers, setTasks, validateData } = useData()
  const [uploadStatus, setUploadStatus] = useState<FileUploadStatus[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = useCallback(
    async (file: File, type: "clients" | "workers" | "tasks") => {
      const statusId = `${file.name}-${Date.now()}`

      setUploadStatus((prev) => [
        ...prev,
        {
          name: file.name,
          type,
          status: "uploading",
          progress: 0,
        },
      ])

      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 50))
          setUploadStatus((prev) =>
            prev.map((status) => (status.name === file.name ? { ...status, progress: i } : status)),
          )
        }

        setUploadStatus((prev) =>
          prev.map((status) => (status.name === file.name ? { ...status, status: "processing" } : status)),
        )

        // Read file
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // AI-powered column mapping simulation
        const aiMappings = await simulateAIMapping(jsonData[0] as Record<string, any>, type)

        setUploadStatus((prev) =>
          prev.map((status) => (status.name === file.name ? { ...status, aiMappings } : status)),
        )

        // Process and normalize data
        const processedData = await processDataWithAI(jsonData, type, aiMappings)

        // Update context based on type
        switch (type) {
          case "clients":
            setClients(processedData)
            break
          case "workers":
            setWorkers(processedData)
            break
          case "tasks":
            setTasks(processedData)
            break
        }

        setUploadStatus((prev) =>
          prev.map((status) =>
            status.name === file.name ? { ...status, status: "completed", progress: 100 } : status,
          ),
        )
      } catch (error) {
        setUploadStatus((prev) =>
          prev.map((status) =>
            status.name === file.name
              ? {
                  ...status,
                  status: "error",
                  error: error instanceof Error ? error.message : "Unknown error",
                }
              : status,
          ),
        )
      }
    },
    [setClients, setWorkers, setTasks],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsProcessing(true)
      acceptedFiles.forEach((file) => {
        // Determine file type based on name or let user choose
        const fileName = file.name.toLowerCase()
        let type: "clients" | "workers" | "tasks"

        if (fileName.includes("client")) type = "clients"
        else if (fileName.includes("worker")) type = "workers"
        else if (fileName.includes("task")) type = "tasks"
        else type = "clients" // default

        processFile(file, type)
      })
      setIsProcessing(false)
    },
    [processFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: true,
  })

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">{isDragActive ? "Drop files here" : "Upload your data files"}</h3>
        <p className="text-gray-600 mb-4">Drag and drop CSV or XLSX files, or click to browse</p>
        <div className="flex justify-center gap-2 mb-4">
          <Badge variant="outline">CSV</Badge>
          <Badge variant="outline">XLSX</Badge>
          <Badge variant="outline">XLS</Badge>
        </div>
        <Button variant="outline" className="bg-white text-gray-700">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Choose Files
        </Button>
      </div>

      {/* AI Features Info */}
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>AI-Powered Processing:</strong> Our system automatically detects and maps columns, even with incorrect
          headers or different arrangements. It also suggests data corrections and validates relationships between
          entities.
        </AlertDescription>
      </Alert>

      {/* Upload Status */}
      {uploadStatus.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload Status</h3>
          {uploadStatus.map((status, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <CardTitle className="text-sm">{status.name}</CardTitle>
                    <Badge variant="secondary">{status.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {status.status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {status.status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <Badge
                      variant={
                        status.status === "completed"
                          ? "default"
                          : status.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {status.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {status.status !== "error" && <Progress value={status.progress} className="mb-2" />}
                {status.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{status.error}</AlertDescription>
                  </Alert>
                )}
                {status.aiMappings && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Column Mappings:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(status.aiMappings).map(([original, mapped]) => (
                        <Badge key={original} variant="outline" className="text-xs">
                          {original} → {mapped}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sample Data Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Expected Data Structure</CardTitle>
          <CardDescription>
            Your files should contain the following columns (AI will map variations automatically):
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Clients</h4>
            <div className="flex flex-wrap gap-1">
              {["ClientID", "ClientName", "PriorityLevel", "RequestedTaskIDs", "GroupTag", "AttributesJSON"].map(
                (col) => (
                  <Badge key={col} variant="outline" className="text-xs">
                    {col}
                  </Badge>
                ),
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Workers</h4>
            <div className="flex flex-wrap gap-1">
              {[
                "WorkerID",
                "WorkerName",
                "Skills",
                "AvailableSlots",
                "MaxLoadPerPhase",
                "WorkerGroup",
                "QualificationLevel",
              ].map((col) => (
                <Badge key={col} variant="outline" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Tasks</h4>
            <div className="flex flex-wrap gap-1">
              {["TaskID", "TaskName", "Category", "Duration", "RequiredSkills", "PreferredPhases", "MaxConcurrent"].map(
                (col) => (
                  <Badge key={col} variant="outline" className="text-xs">
                    {col}
                  </Badge>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Simulate AI-powered column mapping
async function simulateAIMapping(sampleRow: Record<string, any>, type: string): Promise<Record<string, string>> {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate AI processing

  const mappings: Record<string, string> = {}
  const columns = Object.keys(sampleRow)

  // Simulate intelligent mapping based on column names and content
  columns.forEach((col) => {
    const lowerCol = col.toLowerCase()

    if (type === "clients") {
      // More intelligent mapping for clients
      if (lowerCol.includes("clientid") || lowerCol === "id" || lowerCol === "client_id") {
        mappings[col] = "ClientID"
      } else if (lowerCol.includes("clientname") || lowerCol.includes("name") || lowerCol === "client_name") {
        mappings[col] = "ClientName"
      } else if (lowerCol.includes("priority") || lowerCol.includes("level")) {
        mappings[col] = "PriorityLevel"
      } else if (lowerCol.includes("task") || lowerCol.includes("request") || lowerCol.includes("taskid")) {
        mappings[col] = "RequestedTaskIDs"
      } else if (lowerCol.includes("group") || lowerCol.includes("tag") || lowerCol.includes("category")) {
        mappings[col] = "GroupTag"
      } else if (lowerCol.includes("attribute") || lowerCol.includes("json") || lowerCol.includes("metadata")) {
        mappings[col] = "AttributesJSON"
      }
    } else if (type === "workers") {
      // Intelligent mapping for workers
      if (lowerCol.includes("workerid") || lowerCol === "id" || lowerCol === "worker_id") {
        mappings[col] = "WorkerID"
      } else if (lowerCol.includes("workername") || lowerCol.includes("name") || lowerCol === "worker_name") {
        mappings[col] = "WorkerName"
      } else if (lowerCol.includes("skill") || lowerCol.includes("expertise")) {
        mappings[col] = "Skills"
      } else if (lowerCol.includes("slot") || lowerCol.includes("available") || lowerCol.includes("phase")) {
        mappings[col] = "AvailableSlots"
      } else if (lowerCol.includes("maxload") || lowerCol.includes("load") || lowerCol.includes("capacity")) {
        mappings[col] = "MaxLoadPerPhase"
      } else if (lowerCol.includes("group") || lowerCol.includes("team") || lowerCol.includes("department")) {
        mappings[col] = "WorkerGroup"
      } else if (lowerCol.includes("qualification") || lowerCol.includes("level") || lowerCol.includes("experience")) {
        mappings[col] = "QualificationLevel"
      }
    } else if (type === "tasks") {
      // Intelligent mapping for tasks
      if (lowerCol.includes("taskid") || lowerCol === "id" || lowerCol === "task_id") {
        mappings[col] = "TaskID"
      } else if (lowerCol.includes("taskname") || lowerCol.includes("name") || lowerCol === "task_name") {
        mappings[col] = "TaskName"
      } else if (lowerCol.includes("category") || lowerCol.includes("type") || lowerCol.includes("classification")) {
        mappings[col] = "Category"
      } else if (lowerCol.includes("duration") || lowerCol.includes("time") || lowerCol.includes("length")) {
        mappings[col] = "Duration"
      } else if (lowerCol.includes("skill") || lowerCol.includes("requirement") || lowerCol.includes("expertise")) {
        mappings[col] = "RequiredSkills"
      } else if (lowerCol.includes("phase") || lowerCol.includes("preferred") || lowerCol.includes("schedule")) {
        mappings[col] = "PreferredPhases"
      } else if (lowerCol.includes("concurrent") || lowerCol.includes("parallel") || lowerCol.includes("max")) {
        mappings[col] = "MaxConcurrent"
      }
    }
  })

  // Only return mappings that actually make sense (avoid mapping everything to the same field)
  const uniqueTargets = new Set(Object.values(mappings))
  if (uniqueTargets.size !== Object.values(mappings).length) {
    // If we have duplicate mappings, be more conservative
    const conservativeMappings: Record<string, string> = {}
    columns.forEach((col) => {
      const lowerCol = col.toLowerCase()

      // Only map very obvious matches
      if (type === "clients") {
        if (lowerCol === "clientid" || lowerCol === "client_id") conservativeMappings[col] = "ClientID"
        else if (lowerCol === "clientname" || lowerCol === "client_name") conservativeMappings[col] = "ClientName"
        else if (lowerCol === "prioritylevel" || lowerCol === "priority_level")
          conservativeMappings[col] = "PriorityLevel"
        else if (lowerCol === "requestedtaskids" || lowerCol === "requested_task_ids")
          conservativeMappings[col] = "RequestedTaskIDs"
        else if (lowerCol === "grouptag" || lowerCol === "group_tag") conservativeMappings[col] = "GroupTag"
        else if (lowerCol === "attributesjson" || lowerCol === "attributes_json")
          conservativeMappings[col] = "AttributesJSON"
      }
      // Similar conservative logic for workers and tasks...
    })
    return conservativeMappings
  }

  return mappings
}

// Process data with AI enhancements
async function processDataWithAI(data: any[], type: string, mappings: Record<string, string>) {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate processing

  return data.map((row) => {
    const processed: any = {}

    // Apply mappings and normalize data
    Object.entries(row).forEach(([key, value]) => {
      const mappedKey = mappings[key] || key

      // Type-specific processing
      if (type === "clients") {
        if (mappedKey === "RequestedTaskIDs" && typeof value === "string") {
          processed[mappedKey] = value.split(",").map((s) => s.trim())
        } else if (mappedKey === "PriorityLevel") {
          processed[mappedKey] = Number.parseInt(value as string) || 1
        } else {
          processed[mappedKey] = value
        }
      } else if (type === "workers") {
        if (mappedKey === "Skills" && typeof value === "string") {
          processed[mappedKey] = value.split(",").map((s) => s.trim())
        } else if (mappedKey === "AvailableSlots" && typeof value === "string") {
          processed[mappedKey] = value
            .split(",")
            .map((s) => Number.parseInt(s.trim()))
            .filter((n) => !isNaN(n))
        } else if (mappedKey === "MaxLoadPerPhase" || mappedKey === "QualificationLevel") {
          processed[mappedKey] = Number.parseInt(value as string) || 1
        } else {
          processed[mappedKey] = value
        }
      } else if (type === "tasks") {
        if (mappedKey === "RequiredSkills" && typeof value === "string") {
          processed[mappedKey] = value.split(",").map((s) => s.trim())
        } else if (mappedKey === "PreferredPhases" && typeof value === "string") {
          // Handle ranges like "1-3" or lists like "1,2,3"
          if (value.includes("-")) {
            const [start, end] = value.split("-").map((s) => Number.parseInt(s.trim()))
            processed[mappedKey] = Array.from({ length: end - start + 1 }, (_, i) => start + i)
          } else {
            processed[mappedKey] = value
              .split(",")
              .map((s) => Number.parseInt(s.trim()))
              .filter((n) => !isNaN(n))
          }
        } else if (mappedKey === "Duration" || mappedKey === "MaxConcurrent") {
          processed[mappedKey] = Number.parseInt(value as string) || 1
        } else {
          processed[mappedKey] = value
        }
      }
    })

    return processed
  })
}
