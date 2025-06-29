"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BarChart3, Target, Shuffle, Scale, Sparkles, Plus, Edit, Save, X, Wand2 } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function PrioritizationPanel() {
  const { priorities, updatePriority } = useData()
  const [selectedPreset, setSelectedPreset] = useState("")
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiRecommendation, setAiRecommendation] = useState<string>("")
  const [customCriteria, setCustomCriteria] = useState({ name: "", description: "", weight: 0.1 })
  const [showAddCriteria, setShowAddCriteria] = useState(false)
  const [editingCriteria, setEditingCriteria] = useState<string | null>(null)

  const presets = [
    {
      id: "maximize-fulfillment",
      name: "Maximize Fulfillment",
      description: "Prioritize completing as many requested tasks as possible",
      weights: {
        "priority-level": 0.2,
        "task-fulfillment": 0.4,
        fairness: 0.15,
        efficiency: 0.15,
        timeline: 0.1,
      },
    },
    {
      id: "fair-distribution",
      name: "Fair Distribution",
      description: "Ensure equal workload distribution across all workers",
      weights: {
        "priority-level": 0.15,
        "task-fulfillment": 0.2,
        fairness: 0.4,
        efficiency: 0.15,
        timeline: 0.1,
      },
    },
    {
      id: "minimize-workload",
      name: "Minimize Workload",
      description: "Optimize for efficiency and resource utilization",
      weights: {
        "priority-level": 0.1,
        "task-fulfillment": 0.2,
        fairness: 0.15,
        efficiency: 0.4,
        timeline: 0.15,
      },
    },
    {
      id: "timeline-focused",
      name: "Timeline Focused",
      description: "Prioritize meeting deadlines and schedule adherence",
      weights: {
        "priority-level": 0.15,
        "task-fulfillment": 0.2,
        fairness: 0.15,
        efficiency: 0.15,
        timeline: 0.35,
      },
    },
    {
      id: "cost-optimized",
      name: "Cost Optimized",
      description: "Minimize resource costs while maintaining quality",
      weights: {
        "priority-level": 0.1,
        "task-fulfillment": 0.25,
        fairness: 0.1,
        efficiency: 0.45,
        timeline: 0.1,
      },
    },
  ]

  const applyPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)
    if (!preset) return

    Object.entries(preset.weights).forEach(([priorityId, weight]) => {
      updatePriority(priorityId, weight)
    })
    setSelectedPreset(presetId)
  }

  const generateAIRecommendation = async () => {
    setIsGeneratingAI(true)
    try {
      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const recommendations = [
        "Based on your data, consider increasing 'Task Fulfillment' weight to 0.35 for better client satisfaction.",
        "Your worker distribution suggests reducing 'Fairness' to 0.15 and increasing 'Efficiency' to 0.25.",
        "High priority clients in your data indicate 'Priority Level' should be weighted at 0.3 or higher.",
        "Timeline constraints in your tasks suggest increasing 'Timeline' weight to 0.25 for better scheduling.",
        "Resource utilization analysis recommends balancing 'Efficiency' at 0.3 and 'Fairness' at 0.2.",
      ]

      const randomRecommendation = recommendations[Math.floor(Math.random() * recommendations.length)]
      setAiRecommendation(randomRecommendation)
    } catch (error) {
      console.error("AI recommendation error:", error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const applyAIRecommendation = () => {
    // Parse and apply AI recommendation (simplified)
    if (aiRecommendation.includes("Task Fulfillment")) {
      updatePriority("task-fulfillment", 0.35)
    }
    if (aiRecommendation.includes("Priority Level")) {
      updatePriority("priority-level", 0.3)
    }
    if (aiRecommendation.includes("Timeline")) {
      updatePriority("timeline", 0.25)
    }
    if (aiRecommendation.includes("Efficiency")) {
      updatePriority("efficiency", 0.3)
    }
    if (aiRecommendation.includes("Fairness")) {
      updatePriority("fairness", 0.2)
    }

    setAiRecommendation("")
  }

  const handleDragStart = (e: React.DragEvent, priorityId: string) => {
    setDraggedItem(priorityId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) return

    // Reorder priorities based on drag and drop
    const draggedPriority = priorities.find((p) => p.id === draggedItem)
    const targetPriority = priorities.find((p) => p.id === targetId)

    if (draggedPriority && targetPriority) {
      // Swap weights
      const tempWeight = draggedPriority.weight
      updatePriority(draggedItem, targetPriority.weight)
      updatePriority(targetId, tempWeight)
    }

    setDraggedItem(null)
  }

  const addCustomCriteria = () => {
    if (!customCriteria.name.trim()) return

    // In a real implementation, this would add to the priorities array
    console.log("Adding custom criteria:", customCriteria)
    setShowAddCriteria(false)
    setCustomCriteria({ name: "", description: "", weight: 0.1 })
  }

  const normalizeWeights = () => {
    const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0)
    if (totalWeight === 0) return

    priorities.forEach((priority) => {
      updatePriority(priority.id, priority.weight / totalWeight)
    })
  }

  const resetWeights = () => {
    const equalWeight = 1 / priorities.length
    priorities.forEach((priority) => {
      updatePriority(priority.id, equalWeight)
    })
  }

  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0)
  const normalizedPriorities = priorities.map((p) => ({
    ...p,
    normalizedWeight: totalWeight > 0 ? (p.weight / totalWeight) * 100 : 0,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Prioritization & Weights
              </CardTitle>
              <CardDescription>
                Configure how the resource allocation system should balance different criteria. Total weight:{" "}
                {totalWeight.toFixed(2)}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={normalizeWeights}>
                Normalize
              </Button>
              <Button variant="outline" size="sm" onClick={resetWeights}>
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Priority Recommendations
          </CardTitle>
          <CardDescription>
            Get AI-powered suggestions for optimal priority weighting based on your data patterns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={generateAIRecommendation} disabled={isGeneratingAI} className="w-full">
              {isGeneratingAI ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing your data...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Recommendations
                </>
              )}
            </Button>

            {aiRecommendation && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800 mb-2">AI Recommendation</h4>
                    <p className="text-sm text-blue-700 mb-3">{aiRecommendation}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={applyAIRecommendation}>
                        Apply Recommendation
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setAiRecommendation("")}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sliders" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sliders" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Sliders
          </TabsTrigger>
          <TabsTrigger value="ranking" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Drag & Drop
          </TabsTrigger>
          <TabsTrigger value="presets" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sliders">
          <Card>
            <CardHeader>
              <CardTitle>Weight Assignment</CardTitle>
              <CardDescription>Use sliders to assign relative importance to each criterion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {priorities.map((priority) => {
                const normalizedPriority = normalizedPriorities.find((p) => p.id === priority.id)
                const isEditing = editingCriteria === priority.id

                return (
                  <div key={priority.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              value={priority.name}
                              onChange={(e) => {
                                // In real implementation, update priority name
                                console.log("Updating name:", e.target.value)
                              }}
                              className="font-medium"
                            />
                            <Textarea
                              value={priority.description}
                              onChange={(e) => {
                                // In real implementation, update priority description
                                console.log("Updating description:", e.target.value)
                              }}
                              rows={2}
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => setEditingCriteria(null)}>
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingCriteria(null)}>
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{priority.name}</h4>
                              <Button size="sm" variant="ghost" onClick={() => setEditingCriteria(priority.id)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600">{priority.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline">{(priority.weight * 100).toFixed(0)}%</Badge>
                        <Badge variant="secondary">{normalizedPriority?.normalizedWeight.toFixed(0)}% normalized</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[priority.weight]}
                        onValueChange={([value]) => updatePriority(priority.id, value)}
                        max={1}
                        min={0}
                        step={0.01}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={priority.weight.toFixed(2)}
                        onChange={(e) => updatePriority(priority.id, Number.parseFloat(e.target.value) || 0)}
                        className="w-20 h-8"
                        min="0"
                        max="1"
                        step="0.01"
                      />
                    </div>
                  </div>
                )
              })}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Weight:</span>
                  <Badge variant={Math.abs(totalWeight - 1) < 0.01 ? "default" : "secondary"}>
                    {(totalWeight * 100).toFixed(0)}%
                  </Badge>
                </div>
                {Math.abs(totalWeight - 1) > 0.01 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Weights will be automatically normalized during allocation
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle>Priority Ranking</CardTitle>
              <CardDescription>Drag and drop to reorder criteria by importance (most important at top)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {priorities
                  .sort((a, b) => b.weight - a.weight)
                  .map((priority, index) => (
                    <div
                      key={priority.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, priority.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, priority.id)}
                      className={`p-4 border rounded-lg cursor-move transition-colors ${
                        draggedItem === priority.id ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{priority.name}</h4>
                            <p className="text-sm text-gray-600">{priority.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{(priority.weight * 100).toFixed(0)}%</Badge>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${priority.weight * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets">
          <Card>
            <CardHeader>
              <CardTitle>Preset Profiles</CardTitle>
              <CardDescription>Choose from predefined priority configurations for common scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Preset</label>
                <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a preset configuration" />
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        <div>
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs text-gray-500">{preset.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPreset && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">{presets.find((p) => p.id === selectedPreset)?.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {presets.find((p) => p.id === selectedPreset)?.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(presets.find((p) => p.id === selectedPreset)?.weights || {}).map(
                      ([key, weight]) => {
                        const priority = priorities.find((p) => p.id === key)
                        return (
                          <div key={key} className="flex justify-between text-xs">
                            <span>{priority?.name}:</span>
                            <span>{(weight * 100).toFixed(0)}%</span>
                          </div>
                        )
                      },
                    )}
                  </div>

                  <Button onClick={() => applyPreset(selectedPreset)} className="w-full mt-4">
                    Apply This Preset
                  </Button>
                </div>
              )}

              {/* — All Presets as Cards — */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {presets.map((preset) => (
                  <Card
                    key={preset.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => applyPreset(preset.id)}
                  >
                    <CardContent className="pt-4 space-y-3">
                      <h4 className="font-medium">{preset.name}</h4>
                      <p className="text-sm text-gray-600">{preset.description}</p>

                      {Object.entries(preset.weights).map(([key, weight]) => {
                        const priority = priorities.find((p) => p.id === key)
                        return (
                          <div key={key} className="flex justify-between text-xs text-gray-500">
                            <span>{priority?.name}</span>
                            <span>{(weight * 100).toFixed(0)}%</span>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* — Optional custom-criteria tab (placeholder) — */}
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Criteria (coming soon)</CardTitle>
              <CardDescription>Define entirely new prioritisation criteria with AI assistance.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Future enhancement: let AI analyse your data and propose brand-new weighting dimensions tailored to your
                organisation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
