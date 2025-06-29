"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, CheckCircle, AlertTriangle, Package } from "lucide-react"
import { useData } from "@/contexts/data-context"
import * as XLSX from "xlsx"

export default function ExportPanel() {
  const { clients, workers, tasks, rules, priorities, validationErrors } = useData()
  const [exportOptions, setExportOptions] = useState({
    clients: true,
    workers: true,
    tasks: true,
    rules: true,
    priorities: true,
    validationReport: true,
  })
  const [isExporting, setIsExporting] = useState(false)

  const errorCount = validationErrors.filter((e) => e.type === "error").length
  const warningCount = validationErrors.filter((e) => e.type === "warning").length
  const canExport = errorCount === 0

  const generateRulesConfig = () => {
    return {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      rules: rules
        .filter((rule) => rule.enabled)
        .map((rule) => ({
          id: rule.id,
          type: rule.type,
          name: rule.name,
          description: rule.description,
          parameters: rule.parameters,
          priority: 1, // Could be enhanced with actual priority ordering
        })),
      priorities: priorities.reduce(
        (acc, priority) => {
          acc[priority.id] = {
            name: priority.name,
            weight: priority.weight,
            description: priority.description,
          }
          return acc
        },
        {} as Record<string, any>,
      ),
      metadata: {
        totalClients: clients.length,
        totalWorkers: workers.length,
        totalTasks: tasks.length,
        totalRules: rules.filter((rule) => rule.enabled).length,
        validationStatus: {
          errors: errorCount,
          warnings: warningCount,
          passed: errorCount === 0,
        },
      },
    }
  }

  const generateValidationReport = () => {
    return {
      summary: {
        totalErrors: errorCount,
        totalWarnings: warningCount,
        validationPassed: errorCount === 0,
        generatedAt: new Date().toISOString(),
      },
      errorsByEntity: {
        clients: validationErrors.filter((e) => e.entity === "clients"),
        workers: validationErrors.filter((e) => e.entity === "workers"),
        tasks: validationErrors.filter((e) => e.entity === "tasks"),
      },
      recommendations: validationErrors
        .filter((e) => e.suggestion)
        .map((e) => ({
          entity: e.entity,
          field: e.field,
          issue: e.message,
          recommendation: e.suggestion,
        })),
    }
  }

  /**
   * Download `data` (array of objects) as an `.xlsx` file in the browser.
   */
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    // 1. build a workbook in memory
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

    // 2. generate an ArrayBuffer instead of writing to the (non-existent) filesystem
    const arrayBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

    // 3. trigger a download via Blob + anchor element
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    if (!canExport) return

    setIsExporting(true)
    try {
      // Export data files
      if (exportOptions.clients && clients.length > 0) {
        exportToCSV(clients, "cleaned_clients")
      }
      if (exportOptions.workers && workers.length > 0) {
        exportToCSV(workers, "cleaned_workers")
      }
      if (exportOptions.tasks && tasks.length > 0) {
        exportToCSV(tasks, "cleaned_tasks")
      }

      // Export rules configuration
      if (exportOptions.rules) {
        const rulesConfig = generateRulesConfig()
        exportToJSON(rulesConfig, "rules_config")
      }

      // Export validation report
      if (exportOptions.validationReport) {
        const validationReport = generateValidationReport()
        exportToJSON(validationReport, "validation_report")
      }

      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAll = async () => {
    if (!canExport) return

    setIsExporting(true)
    try {
      // Create a comprehensive export package
      const exportPackage = {
        data: {
          clients: clients,
          workers: workers,
          tasks: tasks,
        },
        configuration: generateRulesConfig(),
        validation: generateValidationReport(),
        metadata: {
          exportedAt: new Date().toISOString(),
          version: "1.0",
          source: "Data Alchemist Configurator",
        },
      }

      exportToJSON(exportPackage, "data_alchemist_export_package")
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Export Status
          </CardTitle>
          <CardDescription>Review your data status before exporting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
              <div className="text-sm text-blue-600">Clients</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{workers.length}</div>
              <div className="text-sm text-green-600">Workers</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{tasks.length}</div>
              <div className="text-sm text-purple-600">Tasks</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{rules.filter((r) => r.enabled).length}</div>
              <div className="text-sm text-orange-600">Active Rules</div>
            </div>
          </div>

          {canExport ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ready to export!</strong> All validations passed. Your data is clean and ready for the next
                stage.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cannot export yet.</strong> Please fix {errorCount} validation errors before exporting.
                {warningCount > 0 && ` (${warningCount} warnings can be ignored)`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Choose what to include in your export package</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Data Files</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clients"
                    checked={exportOptions.clients}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, clients: checked as boolean }))
                    }
                  />
                  <label htmlFor="clients" className="text-sm">
                    Cleaned Clients Data ({clients.length} records)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="workers"
                    checked={exportOptions.workers}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, workers: checked as boolean }))
                    }
                  />
                  <label htmlFor="workers" className="text-sm">
                    Cleaned Workers Data ({workers.length} records)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tasks"
                    checked={exportOptions.tasks}
                    onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, tasks: checked as boolean }))}
                  />
                  <label htmlFor="tasks" className="text-sm">
                    Cleaned Tasks Data ({tasks.length} records)
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Configuration Files</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rules"
                    checked={exportOptions.rules}
                    onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, rules: checked as boolean }))}
                  />
                  <label htmlFor="rules" className="text-sm">
                    Rules Configuration ({rules.filter((r) => r.enabled).length} active rules)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="priorities"
                    checked={exportOptions.priorities}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, priorities: checked as boolean }))
                    }
                  />
                  <label htmlFor="priorities" className="text-sm">
                    Priority Weights ({priorities.length} criteria)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validationReport"
                    checked={exportOptions.validationReport}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, validationReport: checked as boolean }))
                    }
                  />
                  <label htmlFor="validationReport" className="text-sm">
                    Validation Report
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Actions</CardTitle>
          <CardDescription>Download your cleaned data and configuration files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleExport} disabled={!canExport || isExporting} className="h-12">
              {isExporting ? (
                <>Exporting...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected Files
                </>
              )}
            </Button>

            <Button onClick={handleExportAll} disabled={!canExport || isExporting} variant="outline" className="h-12">
              {isExporting ? (
                <>Exporting...</>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Export Complete Package
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Export Selected Files:</strong> Downloads individual files based on your selections above
            </p>
            <p>
              <strong>Export Complete Package:</strong> Downloads a single JSON file containing all data, rules, and
              configuration
            </p>
          </div>

          {canExport && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>What you'll get:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Cleaned and validated CSV/XLSX files for each data entity</li>
                  <li>rules.json file with all business rules and priorities</li>
                  <li>Validation report with any remaining warnings</li>
                  <li>Complete package ready for downstream allocation tools</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
