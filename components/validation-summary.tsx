"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Lightbulb, RefreshCw } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function ValidationSummary() {
  const { validationErrors, validateData } = useData()

  const errorCount = validationErrors.filter((e) => e.type === "error").length
  const warningCount = validationErrors.filter((e) => e.type === "warning").length

  const errorsByEntity = {
    clients: validationErrors.filter((e) => e.entity === "clients"),
    workers: validationErrors.filter((e) => e.entity === "workers"),
    tasks: validationErrors.filter((e) => e.entity === "tasks"),
  }

  if (validationErrors.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>All validations passed!</strong> Your data is clean and ready for rule configuration.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Validation Summary
            </CardTitle>
            <CardDescription>
              {errorCount} errors and {warningCount} warnings found in your data
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={validateData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-validate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-red-600">Errors</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <div className="text-sm text-yellow-600">Warnings</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {validationErrors.filter((e) => e.suggestion).length}
            </div>
            <div className="text-sm text-blue-600">Suggestions</div>
          </div>
        </div>

        {/* Errors by Entity */}
        <div className="space-y-3">
          {Object.entries(errorsByEntity).map(([entity, errors]) => {
            if (errors.length === 0) return null

            return (
              <div key={entity} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">{entity}</h4>
                  <Badge variant="outline">{errors.length} issues</Badge>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {errors.slice(0, 5).map((error, index) => (
                    <div key={error.id} className="flex items-start gap-2 text-sm">
                      <div className="flex-shrink-0 mt-0.5">
                        {error.type === "error" ? (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          Row {error.rowIndex + 1}, {error.field}
                        </div>
                        <div className="text-gray-600">{error.message}</div>
                        {error.suggestion && (
                          <div className="flex items-center gap-1 mt-1 text-blue-600">
                            <Lightbulb className="h-3 w-3" />
                            <span className="text-xs">{error.suggestion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {errors.length > 5 && (
                    <div className="text-xs text-gray-500 text-center">... and {errors.length - 5} more issues</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
