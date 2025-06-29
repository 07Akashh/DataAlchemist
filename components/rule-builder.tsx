"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Sparkles, Lightbulb, Settings, Edit, Save, X, Wand2 } from "lucide-react"
import { useData, type Rule } from "@/contexts/data-context"

export default function RuleBuilder() {
  const { rules, addRule, updateRule, removeRule, clients, workers, tasks } = useData()
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [naturalLanguageRule, setNaturalLanguageRule] = useState("")
  const [isProcessingNL, setIsProcessingNL] = useState(false)
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    type: "coRun",
    name: "",
    description: "",
    parameters: {},
    enabled: true,
  })

  const ruleTypes = [
    { value: "coRun", label: "Co-run Tasks", description: "Tasks that must run together" },
    { value: "slotRestriction", label: "Slot Restriction", description: "Minimum common slots requirement" },
    { value: "loadLimit", label: "Load Limit", description: "Maximum slots per phase for workers" },
    { value: "phaseWindow", label: "Phase Window", description: "Allowed phases for specific tasks" },
    { value: "patternMatch", label: "Pattern Match", description: "Regex-based rules" },
    { value: "precedence", label: "Precedence Override", description: "Rule priority ordering" },
    { value: "custom", label: "Custom Rule", description: "AI-generated custom rule" },
  ]

  const handleAddRule = () => {
    if (!newRule.name || !newRule.type) return

    const rule: Rule = {
      id: `rule-${Date.now()}`,
      type: newRule.type as Rule["type"],
      name: newRule.name,
      description: newRule.description || "",
      parameters: newRule.parameters || {},
      enabled: newRule.enabled ?? true,
    }

    addRule(rule)
    setNewRule({
      type: "coRun",
      name: "",
      description: "",
      parameters: {},
      enabled: true,
    })
    setShowRuleForm(false)
  }

  const handleNaturalLanguageRule = async () => {
    if (!naturalLanguageRule.trim()) return

    setIsProcessingNL(true)
    try {
      // Simulate AI processing of natural language rule
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Enhanced AI-generated rule based on natural language
      const aiRule: Rule = {
        id: `ai-rule-${Date.now()}`,
        type: "custom",
        name: `AI Rule: ${naturalLanguageRule.slice(0, 30)}...`,
        description: `Generated from: "${naturalLanguageRule}"`,
        parameters: {
          originalQuery: naturalLanguageRule,
          aiGenerated: true,
          conditions: parseNaturalLanguageRule(naturalLanguageRule),
          confidence: 0.85,
          suggestedActions: generateRuleActions(naturalLanguageRule),
        },
        enabled: true,
      }

      addRule(aiRule)
      setNaturalLanguageRule("")
    } catch (error) {
      console.error("Error processing natural language rule:", error)
    } finally {
      setIsProcessingNL(false)
    }
  }

  const generateRuleRecommendations = () => {
    const recommendations = []

    // Co-run pattern suggestions
    const tasksByClient: Record<string, string[]> = {}
    clients.forEach((client) => {
      ;(client.RequestedTaskIDs ?? []).forEach((taskId) => {
        if (!tasksByClient[taskId]) tasksByClient[taskId] = []
        tasksByClient[taskId].push(client.ClientID)
      })
    })

    Object.entries(tasksByClient).forEach(([taskId, clientIds]) => {
      if (clientIds.length > 1) {
        recommendations.push({
          type: "coRun",
          suggestion: `Tasks often requested together: ${taskId}`,
          description: `${clientIds.length} clients request this task`,
          action: () => createCoRunRule([taskId]),
        })
      }
    })

    // Worker overload suggestions
    workers.forEach((worker) => {
      const availableSlots = (worker.AvailableSlots ?? []).length
      const maxLoad = worker.MaxLoadPerPhase ?? 0

      if (availableSlots > 0 && maxLoad > 0 && availableSlots < maxLoad * 2) {
        recommendations.push({
          type: "loadLimit",
          suggestion: `Worker ${worker.WorkerName} may be overloaded`,
          description: `Only ${availableSlots} available slot${availableSlots === 1 ? "" : "s"} vs ${maxLoad} max load`,
          action: () => createLoadLimitRule(worker.WorkerGroup, Math.floor(maxLoad * 0.8)),
        })
      }
    })

    // Skill coverage recommendations
    const allRequiredSkills = new Set<string>()
    tasks.forEach((task) => {
      ;(task.RequiredSkills ?? []).forEach((skill) => allRequiredSkills.add(skill))
    })

    const workerSkills = new Set<string>()
    workers.forEach((worker) => {
      ;(worker.Skills ?? []).forEach((skill) => workerSkills.add(skill))
    })

    const missingSkills = Array.from(allRequiredSkills).filter((skill) => !workerSkills.has(skill))
    if (missingSkills.length > 0) {
      recommendations.push({
        type: "custom",
        suggestion: `Missing skills detected: ${missingSkills.slice(0, 3).join(", ")}`,
        description: `${missingSkills.length} required skills not available in worker pool`,
        action: () => createSkillGapRule(missingSkills),
      })
    }

    return recommendations.slice(0, 5)
  }

  const createCoRunRule = (taskIds: string[]) => {
    const rule: Rule = {
      id: `corun-${Date.now()}`,
      type: "coRun",
      name: `Co-run Tasks: ${taskIds.join(", ")}`,
      description: `Tasks ${taskIds.join(", ")} must run together`,
      parameters: { tasks: taskIds },
      enabled: true,
    }
    addRule(rule)
  }

  const createLoadLimitRule = (workerGroup: string, maxSlots: number) => {
    const rule: Rule = {
      id: `loadlimit-${Date.now()}`,
      type: "loadLimit",
      name: `Load Limit: ${workerGroup}`,
      description: `Limit ${workerGroup} workers to ${maxSlots} slots per phase`,
      parameters: { workerGroup, maxSlotsPerPhase: maxSlots },
      enabled: true,
    }
    addRule(rule)
  }

  const createSkillGapRule = (missingSkills: string[]) => {
    const rule: Rule = {
      id: `skillgap-${Date.now()}`,
      type: "custom",
      name: `Skill Gap Alert: ${missingSkills.slice(0, 2).join(", ")}`,
      description: `Alert for missing skills: ${missingSkills.join(", ")}`,
      parameters: { missingSkills, alertType: "skill_gap" },
      enabled: true,
    }
    addRule(rule)
  }

  const handleEditRule = (ruleId: string) => {
    setEditingRule(ruleId)
  }

  const handleSaveRule = (ruleId: string, updates: Partial<Rule>) => {
    updateRule(ruleId, updates)
    setEditingRule(null)
  }

  const handleCancelEdit = () => {
    setEditingRule(null)
  }

  const recommendations = generateRuleRecommendations()

  return (
    <div className="space-y-6">
      {/* Natural Language Rule Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Natural Language Rule Creator
          </CardTitle>
          <CardDescription>
            Describe your business rule in plain English, and AI will convert it to a structured rule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Example: 'Tasks T001 and T002 should always run together' or 'Sales workers should not work more than 3 phases per cycle' or 'High priority clients should get preference in phase 1'"
              value={naturalLanguageRule}
              onChange={(e) => setNaturalLanguageRule(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleNaturalLanguageRule}
              disabled={!naturalLanguageRule.trim() || isProcessingNL}
              className="w-full"
            >
              {isProcessingNL ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Rule with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rule Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Rule Recommendations
            </CardTitle>
            <CardDescription>Based on your data patterns, here are some suggested rules:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Alert key={index}>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{rec.suggestion}</strong>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={rec.action}>
                        Add Rule
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Business Rules
              </CardTitle>
              <CardDescription>{rules.length} rules configured</CardDescription>
            </div>
            <Button onClick={() => setShowRuleForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No rules configured yet.</p>
              <p className="text-sm">Add rules to define business constraints and requirements.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  {editingRule === rule.id ? (
                    <EditRuleForm
                      rule={rule}
                      onSave={(updates) => handleSaveRule(rule.id, updates)}
                      onCancel={handleCancelEdit}
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge variant="outline">{rule.type}</Badge>
                          {rule.parameters.aiGenerated && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI
                            </Badge>
                          )}
                          {rule.parameters.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(rule.parameters.confidence * 100)}% confidence
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => updateRule(rule.id, { enabled })}
                          />
                          <Button size="sm" variant="ghost" onClick={() => handleEditRule(rule.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removeRule(rule.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rule.description}</p>

                      {/* Rule Parameters Display */}
                      {Object.keys(rule.parameters).length > 0 && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                          <strong>Parameters:</strong>
                          <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(rule.parameters, null, 2)}</pre>
                        </div>
                      )}

                      {rule.parameters.originalQuery && (
                        <div className="text-xs bg-blue-50 p-2 rounded mt-2">
                          <strong>Original query:</strong> {rule.parameters.originalQuery}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rule Form Modal */}
      {showRuleForm && (
        <RuleForm
          newRule={newRule}
          setNewRule={setNewRule}
          onSave={handleAddRule}
          onCancel={() => setShowRuleForm(false)}
          ruleTypes={ruleTypes}
          clients={clients}
          workers={workers}
          tasks={tasks}
        />
      )}
    </div>
  )
}

// Edit Rule Form Component
function EditRuleForm({
  rule,
  onSave,
  onCancel,
}: {
  rule: Rule
  onSave: (updates: Partial<Rule>) => void
  onCancel: () => void
}) {
  const [editedRule, setEditedRule] = useState<Partial<Rule>>({
    name: rule.name,
    description: rule.description,
    parameters: rule.parameters,
  })

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Rule Name</label>
        <Input value={editedRule.name} onChange={(e) => setEditedRule((prev) => ({ ...prev, name: e.target.value }))} />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <Textarea
          value={editedRule.description}
          onChange={(e) => setEditedRule((prev) => ({ ...prev, description: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onSave(editedRule)}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

// Rule Form Component
function RuleForm({
  newRule,
  setNewRule,
  onSave,
  onCancel,
  ruleTypes,
  clients,
  workers,
  tasks,
}: {
  newRule: Partial<Rule>
  setNewRule: (rule: Partial<Rule>) => void
  onSave: () => void
  onCancel: () => void
  ruleTypes: any[]
  clients: any[]
  workers: any[]
  tasks: any[]
}) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([])

  const handleParameterChange = (key: string, value: any) => {
    setNewRule((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, [key]: value },
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Rule</CardTitle>
        <CardDescription>Configure a new business rule for your resource allocation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Rule Type</label>
          <Select
            value={newRule.type}
            onValueChange={(value) => setNewRule((prev) => ({ ...prev, type: value as Rule["type"] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rule type" />
            </SelectTrigger>
            <SelectContent>
              {ruleTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Rule Name</label>
          <Input
            placeholder="Enter rule name"
            value={newRule.name}
            onChange={(e) => setNewRule((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Description</label>
          <Textarea
            placeholder="Describe what this rule does"
            value={newRule.description}
            onChange={(e) => setNewRule((prev) => ({ ...prev, description: e.target.value }))}
            rows={2}
          />
        </div>

        {/* Rule-specific parameters */}
        {newRule.type === "coRun" && (
          <div>
            <label className="text-sm font-medium mb-2 block">Select Tasks to Co-run</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.TaskID} className="flex items-center space-x-2">
                  <Checkbox
                    id={task.TaskID}
                    checked={selectedTasks.includes(task.TaskID)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTasks((prev) => [...prev, task.TaskID])
                        handleParameterChange("tasks", [...selectedTasks, task.TaskID])
                      } else {
                        setSelectedTasks((prev) => prev.filter((id) => id !== task.TaskID))
                        handleParameterChange(
                          "tasks",
                          selectedTasks.filter((id) => id !== task.TaskID),
                        )
                      }
                    }}
                  />
                  <label htmlFor={task.TaskID} className="text-sm">
                    {task.TaskName}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {newRule.type === "loadLimit" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Worker Group</label>
              <Select onValueChange={(value) => handleParameterChange("workerGroup", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select worker group" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(workers.map((w) => w.WorkerGroup))).map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Max Slots Per Phase</label>
              <Input
                type="number"
                placeholder="Enter max slots"
                onChange={(e) => handleParameterChange("maxSlotsPerPhase", Number.parseInt(e.target.value))}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Switch
            checked={newRule.enabled}
            onCheckedChange={(enabled) => setNewRule((prev) => ({ ...prev, enabled }))}
          />
          <label className="text-sm">Enable this rule</label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onSave} className="flex-1">
            Add Rule
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions
function parseNaturalLanguageRule(query: string) {
  const conditions = []
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("together") || lowerQuery.includes("co-run") || lowerQuery.includes("same time")) {
    conditions.push({ type: "coRun", detected: true, confidence: 0.9 })
  }

  if (lowerQuery.includes("not more than") || lowerQuery.includes("limit") || lowerQuery.includes("maximum")) {
    conditions.push({ type: "loadLimit", detected: true, confidence: 0.8 })
  }

  if (
    lowerQuery.includes("phase") &&
    (lowerQuery.includes("window") || lowerQuery.includes("only") || lowerQuery.includes("during"))
  ) {
    conditions.push({ type: "phaseWindow", detected: true, confidence: 0.85 })
  }

  if (lowerQuery.includes("priority") || lowerQuery.includes("preference") || lowerQuery.includes("first")) {
    conditions.push({ type: "precedence", detected: true, confidence: 0.75 })
  }

  return conditions
}

function generateRuleActions(query: string) {
  const actions = []
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("together")) {
    actions.push("Group specified tasks for simultaneous execution")
  }

  if (lowerQuery.includes("limit")) {
    actions.push("Apply workload restrictions to specified workers/groups")
  }

  if (lowerQuery.includes("priority")) {
    actions.push("Adjust scheduling priority for specified entities")
  }

  return actions
}
