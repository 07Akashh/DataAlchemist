"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, AlertTriangle, CheckCircle, Sparkles, RefreshCw } from "lucide-react"
import { useData } from "@/contexts/data-context"
import DataGrid from "@/components/data-grid"
import ValidationSummary from "@/components/validation-summary"

export default function DataGrids() {
  const { clients, workers, tasks, validationErrors, validateData, searchData } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState("clients")

  useEffect(() => {
    validateData()
  }, [clients, workers, tasks, validateData])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await searchData(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const errorCounts = {
    clients: validationErrors.filter((e) => e.entity === "clients").length,
    workers: validationErrors.filter((e) => e.entity === "workers").length,
    tasks: validationErrors.filter((e) => e.entity === "tasks").length,
  }

  const totalErrors = validationErrors.filter((e) => e.type === "error").length
  const totalWarnings = validationErrors.filter((e) => e.type === "warning").length

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Natural Language Search
          </CardTitle>
          <CardDescription>
            Search your data using plain English. Try: "All tasks with duration more than 2 phases" or "Workers with
            JavaScript skills in phase 1"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search your data using natural language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>

          {searchResults && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Search Results:</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Badge variant="outline" className="mb-2">
                    Clients ({searchResults.clients.length})
                  </Badge>
                  {searchResults.clients.slice(0, 3).map((client: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-gray-50 rounded mb-1">
                      {client.ClientName}
                    </div>
                  ))}
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    Workers ({searchResults.workers.length})
                  </Badge>
                  {searchResults.workers.slice(0, 3).map((worker: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-gray-50 rounded mb-1">
                      {worker.WorkerName}
                    </div>
                  ))}
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    Tasks ({searchResults.tasks.length})
                  </Badge>
                  {searchResults.tasks.slice(0, 3).map((task: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-gray-50 rounded mb-1">
                      {task.TaskName}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Summary */}
      <ValidationSummary />

      {/* Data Status */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-sm text-gray-600">Clients</p>
              </div>
              <div className="flex items-center gap-1">
                {errorCounts.clients > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <Badge variant={errorCounts.clients > 0 ? "destructive" : "default"}>
                  {errorCounts.clients} errors
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{workers.length}</p>
                <p className="text-sm text-gray-600">Workers</p>
              </div>
              <div className="flex items-center gap-1">
                {errorCounts.workers > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <Badge variant={errorCounts.workers > 0 ? "destructive" : "default"}>
                  {errorCounts.workers} errors
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{tasks.length}</p>
                <p className="text-sm text-gray-600">Tasks</p>
              </div>
              <div className="flex items-center gap-1">
                {errorCounts.tasks > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <Badge variant={errorCounts.tasks > 0 ? "destructive" : "default"}>{errorCounts.tasks} errors</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Grids */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients" className="flex items-center gap-2">
            Clients
            {errorCounts.clients > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {errorCounts.clients}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="workers" className="flex items-center gap-2">
            Workers
            {errorCounts.workers > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {errorCounts.workers}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            Tasks
            {errorCounts.tasks > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {errorCounts.tasks}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <DataGrid data={clients} type="clients" />
        </TabsContent>

        <TabsContent value="workers">
          <DataGrid data={workers} type="workers" />
        </TabsContent>

        <TabsContent value="tasks">
          <DataGrid data={tasks} type="tasks" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
