"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Database, Settings, Download, Sparkles, Brain } from "lucide-react"
import DataIngestion from "@/components/data-ingestion"
import DataGrids from "@/components/data-grids"
import RuleBuilder from "@/components/rule-builder"
import PrioritizationPanel from "@/components/prioritization-panel"
import ExportPanel from "@/components/export-panel"
import AIDashboard from "@/components/ai-dashboard"
import AIAssistant from "@/components/ai-assistant"
import SmartNotifications from "@/components/smart-notifications"
import ProgressTracker from "@/components/progress-tracker"
import { DataProvider } from "@/contexts/data-context"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("ai-dashboard")

  return (
    <DataProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Smart Notifications */}
        <SmartNotifications />

        {/* AI Assistant */}
        <AIAssistant />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Data Alchemist
              </h1>
              <Badge variant="secondary" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <p className="text-xl text-gray-600 mb-2">Forge Your Own AI Resource-Allocation Configurator</p>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Transform messy spreadsheets into clean, validated data with advanced AI-powered insights, natural
              language processing, and intelligent optimization recommendations.
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="mb-8">
            <ProgressTracker />
          </div>

          {/* Main Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="ai-dashboard" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Dashboard
              </TabsTrigger>
              <TabsTrigger value="ingestion" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Data Upload
              </TabsTrigger>
              <TabsTrigger value="grids" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Grids
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Rules
              </TabsTrigger>
              <TabsTrigger value="priorities" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Priorities
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai-dashboard">
              <AIDashboard />
            </TabsContent>

            <TabsContent value="ingestion">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Data Ingestion
                    <Badge variant="secondary" className="ml-2">
                      AI-Powered
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Upload your CSV or XLSX files for clients, workers, and tasks. Our AI will intelligently map columns
                    even with incorrect headers and provide optimization suggestions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataIngestion />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grids">
              <DataGrids />
            </TabsContent>

            <TabsContent value="rules">
              <RuleBuilder />
            </TabsContent>

            <TabsContent value="priorities">
              <PrioritizationPanel />
            </TabsContent>

            <TabsContent value="export">
              <ExportPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DataProvider>
  )
}
