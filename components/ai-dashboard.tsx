"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function AIDashboard() {
  const {
    aiInsights,
    dataQualityScore,
    optimizationSuggestions,
    generateAIInsights,
    autoFixValidationErrors,
    optimizeRules,
    predictResourceNeeds,
    validationErrors,
  } = useData()

  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [isAutoFixing, setIsAutoFixing] = useState(false)
  const [resourcePrediction, setResourcePrediction] = useState<any>(null)

  useEffect(() => {
    generateAIInsights()
  }, [generateAIInsights])

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true)
    await generateAIInsights()
    await optimizeRules()
    setIsGeneratingInsights(false)
  }

  const handleAutoFix = async () => {
    setIsAutoFixing(true)
    await autoFixValidationErrors()
    setIsAutoFixing(false)
  }

  const handlePredictResources = async () => {
    const prediction = await predictResourceNeeds()
    setResourcePrediction(prediction)
  }

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getQualityBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, text: "Excellent" }
    if (score >= 60) return { variant: "secondary" as const, text: "Good" }
    return { variant: "destructive" as const, text: "Needs Improvement" }
  }

  const autoFixableErrors = validationErrors.filter((e) => e.autoFixable).length

  return (
    <div className="space-y-6">
      {/* AI Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Intelligence Dashboard
          </CardTitle>
          <CardDescription>
            Real-time AI analysis and optimization recommendations for your resource allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
              <div className={`text-3xl font-bold ${getQualityColor(dataQualityScore)}`}>
                {Math.round(dataQualityScore)}%
              </div>
              <div className="text-sm text-gray-600 mb-2">Data Quality Score</div>
              <Badge {...getQualityBadge(dataQualityScore)}>{getQualityBadge(dataQualityScore).text}</Badge>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{aiInsights.length}</div>
              <div className="text-sm text-gray-600 mb-2">AI Insights</div>
              <Badge variant="outline">Active</Badge>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{autoFixableErrors}</div>
              <div className="text-sm text-gray-600 mb-2">Auto-Fixable Issues</div>
              <Badge variant="secondary">Ready</Badge>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{optimizationSuggestions.length}</div>
              <div className="text-sm text-gray-600 mb-2">Optimizations</div>
              <Badge variant="outline">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            AI Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsights}
              className="h-16 flex flex-col gap-1"
            >
              {isGeneratingInsights ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              <span className="text-sm">Generate AI Insights</span>
            </Button>

            <Button
              onClick={handleAutoFix}
              disabled={isAutoFixing || autoFixableErrors === 0}
              variant="outline"
              className="h-16 flex flex-col gap-1 bg-transparent"
            >
              {isAutoFixing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
              <span className="text-sm">Auto-Fix Issues ({autoFixableErrors})</span>
            </Button>

            <Button
              onClick={handlePredictResources}
              variant="outline"
              className="h-16 flex flex-col gap-1 bg-transparent"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Predict Resource Needs</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="prediction">Prediction</TabsTrigger>
          <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>Intelligent analysis of your data patterns and potential issues</CardDescription>
            </CardHeader>
            <CardContent>
              {aiInsights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No AI insights available yet.</p>
                  <p className="text-sm">Click "Generate AI Insights" to analyze your data.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <Alert key={insight.id} className="border-l-4 border-l-blue-500">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {insight.type === "warning" && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                          {insight.type === "optimization" && <TrendingUp className="h-4 w-4 text-blue-500" />}
                          {insight.type === "recommendation" && <Lightbulb className="h-4 w-4 text-green-500" />}
                          {insight.type === "pattern" && <BarChart3 className="h-4 w-4 text-purple-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(insight.confidence * 100)}% confidence
                            </Badge>
                            <Badge
                              variant={
                                insight.impact === "high"
                                  ? "destructive"
                                  : insight.impact === "medium"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {insight.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                          {insight.suggestedAction && (
                            <div className="text-xs bg-blue-50 p-2 rounded">
                              <strong>Suggested Action:</strong> {insight.suggestedAction}
                            </div>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Optimization Suggestions
              </CardTitle>
              <CardDescription>AI-powered recommendations to improve your configuration</CardDescription>
            </CardHeader>
            <CardContent>
              {optimizationSuggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No optimization suggestions available.</p>
                  <p className="text-sm">Your configuration appears to be well-optimized!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {optimizationSuggestions.map((suggestion, index) => (
                    <Alert key={index}>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>{suggestion}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prediction">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resource Prediction
              </CardTitle>
              <CardDescription>AI-powered forecasting of resource needs and capacity planning</CardDescription>
            </CardHeader>
            <CardContent>
              {!resourcePrediction ? (
                <div className="text-center py-8">
                  <Button onClick={handlePredictResources} className="mb-4">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Resource Prediction
                  </Button>
                  <p className="text-sm text-gray-500">
                    AI will analyze your current data to predict future resource needs
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{resourcePrediction.recommendedWorkers}</div>
                      <div className="text-sm text-gray-600">Recommended Workers</div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(resourcePrediction.capacityUtilization * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Capacity Utilization</div>
                    </div>

                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 capitalize">
                        {resourcePrediction.timelineRisk}
                      </div>
                      <div className="text-sm text-gray-600">Timeline Risk</div>
                    </div>
                  </div>

                  {resourcePrediction.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">AI Recommendations:</h4>
                      <div className="space-y-2">
                        {resourcePrediction.recommendations.map((rec: string, index: number) => (
                          <Alert key={index}>
                            <Lightbulb className="h-4 w-4" />
                            <AlertDescription>{rec}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Data Quality Analysis
              </CardTitle>
              <CardDescription>Detailed breakdown of your data quality metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Quality Score</span>
                    <span className={`text-sm font-bold ${getQualityColor(dataQualityScore)}`}>
                      {Math.round(dataQualityScore)}%
                    </span>
                  </div>
                  <Progress value={dataQualityScore} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Quality Factors</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Data Completeness</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Data Consistency</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Validation Compliance</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Relationship Integrity</span>
                        <span className="font-medium">88%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Improvement Areas</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        <span>Missing required fields</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        <span>Inconsistent data formats</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Good skill coverage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Balanced workload distribution</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
