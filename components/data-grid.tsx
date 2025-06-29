"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Save, X, AlertTriangle, Plus, Trash2, Sparkles, Wand2 } from "lucide-react"
import { useData } from "@/contexts/data-context"

interface DataGridProps {
  data: any[]
  type: "clients" | "workers" | "tasks"
}

export default function DataGrid({ data, type }: DataGridProps) {
  const { validationErrors, setClients, setWorkers, setTasks, clients, workers, tasks } = useData()
  const [editingCell, setEditingCell] = useState<{ row: number; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isAddingRow, setIsAddingRow] = useState(false)
  const [newRowData, setNewRowData] = useState<any>({})
  const [aiSuggestion, setAiSuggestion] = useState<string>("")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const getColumns = () => {
    switch (type) {
      case "clients":
        return ["ClientID", "ClientName", "PriorityLevel", "RequestedTaskIDs", "GroupTag", "AttributesJSON"]
      case "workers":
        return [
          "WorkerID",
          "WorkerName",
          "Skills",
          "AvailableSlots",
          "MaxLoadPerPhase",
          "WorkerGroup",
          "QualificationLevel",
        ]
      case "tasks":
        return ["TaskID", "TaskName", "Category", "Duration", "RequiredSkills", "PreferredPhases", "MaxConcurrent"]
      default:
        return []
    }
  }

  const getRowErrors = (rowIndex: number) => {
    return validationErrors.filter((error) => error.entity === type && error.rowIndex === rowIndex)
  }

  const getCellError = (rowIndex: number, field: string) => {
    return validationErrors.find(
      (error) => error.entity === type && error.rowIndex === rowIndex && error.field === field,
    )
  }

  const handleEdit = (rowIndex: number, field: string, currentValue: any) => {
    setEditingCell({ row: rowIndex, field })
    setEditValue(Array.isArray(currentValue) ? currentValue.join(", ") : String(currentValue || ""))
  }

  const handleSave = () => {
    if (!editingCell) return

    const { row, field } = editingCell
    const updatedData = [...data]

    // Process the value based on field type
    let processedValue = editValue

    if (field === "RequestedTaskIDs" || field === "Skills" || field === "RequiredSkills") {
      processedValue = editValue
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    } else if (field === "AvailableSlots" || field === "PreferredPhases") {
      processedValue = editValue
        .split(",")
        .map((s) => Number.parseInt(s.trim()))
        .filter((n) => !isNaN(n))
    } else if (
      field === "PriorityLevel" ||
      field === "Duration" ||
      field === "MaxConcurrent" ||
      field === "MaxLoadPerPhase" ||
      field === "QualificationLevel"
    ) {
      processedValue = Number.parseInt(editValue) || 0
    }

    updatedData[row] = { ...updatedData[row], [field]: processedValue }

    // Update the appropriate data store
    switch (type) {
      case "clients":
        setClients(updatedData)
        break
      case "workers":
        setWorkers(updatedData)
        break
      case "tasks":
        setTasks(updatedData)
        break
    }

    setEditingCell(null)
    setEditValue("")
  }

  const handleCancel = () => {
    setEditingCell(null)
    setEditValue("")
  }

  const handleDeleteRow = (rowIndex: number) => {
    const updatedData = data.filter((_, index) => index !== rowIndex)

    switch (type) {
      case "clients":
        setClients(updatedData)
        break
      case "workers":
        setWorkers(updatedData)
        break
      case "tasks":
        setTasks(updatedData)
        break
    }
  }

  const handleAddRow = () => {
    const columns = getColumns()
    const defaultRow: any = {}

    columns.forEach((col) => {
      if (col.includes("ID")) {
        defaultRow[col] = `${type.charAt(0).toUpperCase()}${String(data.length + 1).padStart(3, "0")}`
      } else if (col === "PriorityLevel") {
        defaultRow[col] = 1
      } else if (
        col === "Duration" ||
        col === "MaxConcurrent" ||
        col === "MaxLoadPerPhase" ||
        col === "QualificationLevel"
      ) {
        defaultRow[col] = 1
      } else if (col.includes("Skills") || col.includes("TaskIDs") || col.includes("Slots") || col.includes("Phases")) {
        defaultRow[col] = []
      } else {
        defaultRow[col] = ""
      }
    })

    setNewRowData(defaultRow)
    setIsAddingRow(true)
  }

  const handleSaveNewRow = () => {
    const updatedData = [...data, newRowData]

    switch (type) {
      case "clients":
        setClients(updatedData)
        break
      case "workers":
        setWorkers(updatedData)
        break
      case "tasks":
        setTasks(updatedData)
        break
    }

    setIsAddingRow(false)
    setNewRowData({})
  }

  const handleCancelNewRow = () => {
    setIsAddingRow(false)
    setNewRowData({})
  }

  const generateAISuggestion = async (field: string, currentValue: any) => {
    setIsGeneratingAI(true)
    try {
      // Simulate AI suggestion generation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      let suggestion = ""

      if (field === "Skills" || field === "RequiredSkills") {
        const commonSkills = ["JavaScript", "Python", "React", "Node.js", "SQL", "Docker", "AWS", "TypeScript"]
        suggestion = commonSkills.slice(0, 3).join(", ")
      } else if (field === "Category") {
        const categories = ["Development", "Design", "Testing", "DevOps", "Analysis"]
        suggestion = categories[Math.floor(Math.random() * categories.length)]
      } else if (field === "GroupTag" || field === "WorkerGroup") {
        const groups = ["Frontend", "Backend", "FullStack", "DevOps", "QA"]
        suggestion = groups[Math.floor(Math.random() * groups.length)]
      } else if (field === "AttributesJSON") {
        suggestion = '{"priority": "high", "department": "engineering"}'
      } else {
        suggestion = `AI suggested value for ${field}`
      }

      setAiSuggestion(suggestion)
    } catch (error) {
      console.error("AI suggestion error:", error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const applyAISuggestion = () => {
    setEditValue(aiSuggestion)
    setAiSuggestion("")
  }

  const formatCellValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(", ")
    }
    if (typeof value === "object" && value !== null) {
      try {
        return JSON.stringify(value, null, 2)
      } catch {
        return String(value)
      }
    }
    if (typeof value === "string" && (value.startsWith("{") || value.startsWith("["))) {
      try {
        const parsed = JSON.parse(value)
        return JSON.stringify(parsed, null, 2)
      } catch {
        return value
      }
    }
    return String(value || "")
  }

  const renderEditCell = (field: string, currentValue: any) => {
    const isEditing = editingCell?.field === field

    if (!isEditing) return null

    if (field === "PriorityLevel") {
      return (
        <div className="flex items-center gap-1">
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((level) => (
                <SelectItem key={level} value={String(level)}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" onClick={handleSave}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    if (field === "AttributesJSON") {
      return (
        <div className="flex items-center gap-1">
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-20 min-w-[200px]"
            placeholder="Enter JSON..."
          />
          <div className="flex flex-col gap-1">
            <Button size="sm" variant="ghost" onClick={() => generateAISuggestion(field, currentValue)}>
              <Sparkles className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleSave}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 min-w-[150px]"
          placeholder={`Enter ${field}...`}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => generateAISuggestion(field, currentValue)}
          disabled={isGeneratingAI}
        >
          {isGeneratingAI ? <Wand2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Save className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  const columns = getColumns()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">{type} Data</CardTitle>
          <Button onClick={handleAddRow} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add {type.slice(0, -1)}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {aiSuggestion && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">AI Suggestion:</span>
                <span className="text-sm text-blue-700">{aiSuggestion}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={applyAISuggestion}>
                  Apply
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAiSuggestion("")}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
                <TableHead className="w-20">Errors</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => {
                const rowErrors = getRowErrors(rowIndex)
                return (
                  <TableRow key={rowIndex} className={rowErrors.length > 0 ? "bg-red-50" : ""}>
                    <TableCell className="font-medium">{rowIndex + 1}</TableCell>
                    {columns.map((column) => {
                      const cellError = getCellError(rowIndex, column)
                      const isEditing = editingCell?.row === rowIndex && editingCell?.field === column

                      return (
                        <TableCell key={column} className={`relative ${cellError ? "bg-red-100" : ""}`}>
                          {isEditing ? (
                            renderEditCell(column, row[column])
                          ) : (
                            <div
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded min-h-[32px]"
                              onClick={() => handleEdit(rowIndex, column, row[column])}
                            >
                              <span
                                className={`flex-1 ${column === "AttributesJSON" ? "font-mono text-xs whitespace-pre-wrap" : ""}`}
                              >
                                {column === "AttributesJSON" ? (
                                  <JsonDisplay value={row[column]} />
                                ) : (
                                  formatCellValue(row[column])
                                )}
                              </span>
                              <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                              {cellError && <AlertTriangle className="h-3 w-3 text-red-500" />}
                            </div>
                          )}
                          {cellError && (
                            <div className="absolute z-10 bg-red-600 text-white text-xs p-2 rounded mt-1 shadow-lg max-w-xs">
                              <div className="font-medium">{cellError.message}</div>
                              {cellError.suggestion && <div className="mt-1 text-red-200">{cellError.suggestion}</div>}
                            </div>
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      {rowErrors.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {rowErrors.length}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRow(rowIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}

              {/* Add New Row */}
              {isAddingRow && (
                <TableRow className="bg-green-50">
                  <TableCell className="font-medium">New</TableCell>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      <Input
                        value={formatCellValue(newRowData[column])}
                        onChange={(e) => {
                          let value: any = e.target.value
                          if (
                            column.includes("Skills") ||
                            column.includes("TaskIDs") ||
                            column.includes("Slots") ||
                            column.includes("Phases")
                          ) {
                            value = e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s.length > 0)
                          } else if (
                            column === "PriorityLevel" ||
                            column === "Duration" ||
                            column === "MaxConcurrent" ||
                            column === "MaxLoadPerPhase" ||
                            column === "QualificationLevel"
                          ) {
                            value = Number.parseInt(e.target.value) || 0
                          }
                          setNewRowData((prev) => ({ ...prev, [column]: value }))
                        }}
                        className="h-8"
                        placeholder={`Enter ${column}...`}
                      />
                    </TableCell>
                  ))}
                  <TableCell></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleSaveNewRow}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelNewRow}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data.length === 0 && !isAddingRow && (
          <div className="text-center py-8">
            <p className="text-gray-500">No {type} data uploaded yet.</p>
            <p className="text-sm text-gray-400 mt-1">Upload a file or add data manually.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// JSON Display Component
function JsonDisplay({ value }: { value: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  let jsonString = ""
  let isValidJson = false

  try {
    if (typeof value === "string") {
      const parsed = JSON.parse(value)
      jsonString = JSON.stringify(parsed, null, 2)
      isValidJson = true
    } else if (typeof value === "object" && value !== null) {
      jsonString = JSON.stringify(value, null, 2)
      isValidJson = true
    } else {
      jsonString = String(value || "")
    }
  } catch {
    jsonString = String(value || "")
  }

  if (!isValidJson) {
    return <span className="text-gray-500">{jsonString}</span>
  }

  const lines = jsonString.split("\n")
  const preview = lines.slice(0, 2).join("\n") + (lines.length > 2 ? "\n..." : "")

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <pre
          className={`text-xs bg-gray-50 p-2 rounded border overflow-hidden ${isExpanded ? "whitespace-pre-wrap" : "whitespace-nowrap"}`}
        >
          <code className="text-blue-600">{isExpanded ? jsonString : preview}</code>
        </pre>
        {lines.length > 2 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="text-xs h-6 px-2"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        )}
      </div>
    </div>
  )
}
