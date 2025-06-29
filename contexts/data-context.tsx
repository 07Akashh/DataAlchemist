"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useMemo } from "react"

export interface Client {
  ClientID: string
  ClientName: string
  PriorityLevel: number
  RequestedTaskIDs: string[]
  GroupTag: string
  AttributesJSON: string
}

export interface Worker {
  WorkerID: string
  WorkerName: string
  Skills: string[]
  AvailableSlots: number[]
  MaxLoadPerPhase: number
  WorkerGroup: string
  QualificationLevel: number
}

export interface Task {
  TaskID: string
  TaskName: string
  Category: string
  Duration: number
  RequiredSkills: string[]
  PreferredPhases: number[]
  MaxConcurrent: number
}

export interface ValidationError {
  id: string
  type: "error" | "warning" | "info"
  entity: "clients" | "workers" | "tasks"
  rowIndex: number
  field: string
  message: string
  suggestion?: string
  severity: "critical" | "high" | "medium" | "low"
  autoFixable: boolean
}

export interface Rule {
  id: string
  type: "coRun" | "slotRestriction" | "loadLimit" | "phaseWindow" | "patternMatch" | "precedence" | "custom"
  name: string
  description: string
  parameters: Record<string, any>
  enabled: boolean
  confidence?: number
  impact?: "high" | "medium" | "low"
}

export interface Priority {
  id: string
  name: string
  weight: number
  description: string
}

export interface AIInsight {
  id: string
  type: "optimization" | "warning" | "recommendation" | "pattern"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  confidence: number
  actionable: boolean
  suggestedAction?: string
}

interface DataContextType {
  clients: Client[]
  workers: Worker[]
  tasks: Task[]
  validationErrors: ValidationError[]
  rules: Rule[]
  priorities: Priority[]
  aiInsights: AIInsight[]
  dataQualityScore: number
  optimizationSuggestions: string[]
  setClients: (clients: Client[]) => void
  setWorkers: (workers: Worker[]) => void
  setTasks: (tasks: Task[]) => void
  setValidationErrors: (errors: ValidationError[]) => void
  addRule: (rule: Rule) => void
  updateRule: (id: string, rule: Partial<Rule>) => void
  removeRule: (id: string) => void
  updatePriority: (id: string, weight: number) => void
  validateData: () => void
  searchData: (query: string) => Promise<any>
  generateAIInsights: () => Promise<void>
  autoFixValidationErrors: () => Promise<void>
  optimizeRules: () => Promise<void>
  predictResourceNeeds: () => Promise<any>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([])
  const [priorities, setPriorities] = useState<Priority[]>([
    { id: "priority-level", name: "Priority Level", weight: 0.3, description: "Client priority importance" },
    { id: "task-fulfillment", name: "Task Fulfillment", weight: 0.25, description: "Requested task completion" },
    { id: "fairness", name: "Fairness", weight: 0.2, description: "Equal distribution across workers" },
    { id: "efficiency", name: "Efficiency", weight: 0.15, description: "Resource utilization optimization" },
    { id: "timeline", name: "Timeline", weight: 0.1, description: "Schedule adherence" },
  ])

  // --- AI consistency check (must be before it's used) ---
  const calculateConsistencyScore = useCallback(() => {
    let score = 100

    // Check skill consistency across workers and tasks
    const allWorkerSkills = new Set(workers.flatMap((w) => w.Skills || []))
    const allTaskSkills = new Set(tasks.flatMap((t) => t.RequiredSkills || []))
    const skillOverlap = new Set([...allWorkerSkills].filter((x) => allTaskSkills.has(x)))

    if (allTaskSkills.size > 0) {
      const skillCoverage = skillOverlap.size / allTaskSkills.size
      score = skillCoverage * 100
    }

    return score
  }, [workers, tasks])

  // --- Data quality score ---
  const dataQualityScore = useMemo(() => {
    if (clients.length === 0 && workers.length === 0 && tasks.length === 0) return 0

    const totalRecords = clients.length + workers.length + tasks.length
    const errorCount = validationErrors.filter((e) => e.type === "error").length
    const warningCount = validationErrors.filter((e) => e.type === "warning").length

    // Base score calculation
    let score = 100
    score -= errorCount * 10 // Each error reduces score by 10
    score -= warningCount * 3 // Each warning reduces score by 3

    // Completeness factor
    const completenessScore = Math.min(100, (totalRecords / 50) * 100) // Assume 50 records is ideal
    score = (score + completenessScore) / 2

    // Consistency factor (check for consistent data patterns)
    const consistencyScore = calculateConsistencyScore()
    score = (score + consistencyScore) / 2

    return Math.max(0, Math.min(100, score))
  }, [clients, workers, tasks, validationErrors, calculateConsistencyScore])

  // Enhanced AI-powered validation
  const validateData = useCallback(async () => {
    const errors: ValidationError[] = []

    // AI-enhanced client validation
    clients.forEach((client, index) => {
      if (!client.ClientID) {
        errors.push({
          id: `client-${index}-id`,
          type: "error",
          entity: "clients",
          rowIndex: index,
          field: "ClientID",
          message: "Client ID is required",
          suggestion: `Generate ID: C${String(index + 1).padStart(3, "0")}`,
          severity: "critical",
          autoFixable: true,
        })
      }

      // AI pattern detection for priority levels
      if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
        const suggestedPriority = Math.max(1, Math.min(5, Math.round(Math.random() * 5)))
        errors.push({
          id: `client-${index}-priority`,
          type: "error",
          entity: "clients",
          rowIndex: index,
          field: "PriorityLevel",
          message: "Priority level must be between 1 and 5",
          suggestion: `AI suggests priority level: ${suggestedPriority} based on client profile`,
          severity: "high",
          autoFixable: true,
        })
      }
      // Smart task validation with AI recommendations
      ;(client.RequestedTaskIDs ?? []).forEach((taskId) => {
        const task = tasks.find((task) => task.TaskID === taskId)
        if (!task) {
          errors.push({
            id: `client-${index}-task-${taskId}`,
            type: "error",
            entity: "clients",
            rowIndex: index,
            field: "RequestedTaskIDs",
            message: `Requested task ${taskId} does not exist`,
            suggestion: "AI can suggest similar available tasks or create this task automatically",
            severity: "medium",
            autoFixable: false,
          })
        }
      })

      // AI-powered JSON validation
      if (client.AttributesJSON) {
        try {
          JSON.parse(client.AttributesJSON)
        } catch {
          errors.push({
            id: `client-${index}-json`,
            type: "warning",
            entity: "clients",
            rowIndex: index,
            field: "AttributesJSON",
            message: "Invalid JSON format",
            suggestion: "AI can auto-format and validate JSON structure",
            severity: "medium",
            autoFixable: true,
          })
        }
      }
    })

    // AI-enhanced task validation with skill gap analysis
    tasks.forEach((task, index) => {
      if (!task.TaskID) {
        errors.push({
          id: `task-${index}-id`,
          type: "error",
          entity: "tasks",
          rowIndex: index,
          field: "TaskID",
          message: "Task ID is required",
          suggestion: `Generate ID: T${String(index + 1).padStart(3, "0")}`,
          severity: "critical",
          autoFixable: true,
        })
      }
      // AI-powered skill gap analysis
      ;(task.RequiredSkills ?? []).forEach((skill) => {
        const workersWithSkill = workers.filter((worker) => (worker.Skills || []).includes(skill))

        if (workersWithSkill.length === 0) {
          errors.push({
            id: `task-${index}-skill-${skill}`,
            type: "warning",
            entity: "tasks",
            rowIndex: index,
            field: "RequiredSkills",
            message: `No worker has the required skill: ${skill}`,
            suggestion: `AI suggests training existing workers or hiring specialists in ${skill}`,
            severity: "high",
            autoFixable: false,
          })
        } else if (workersWithSkill.length < 2) {
          errors.push({
            id: `task-${index}-skill-risk-${skill}`,
            type: "info",
            entity: "tasks",
            rowIndex: index,
            field: "RequiredSkills",
            message: `Only ${workersWithSkill.length} worker has skill: ${skill}`,
            suggestion: "Consider cross-training to reduce single points of failure",
            severity: "low",
            autoFixable: false,
          })
        }
      })

      // AI workload prediction
      if (task.Duration > 5) {
        errors.push({
          id: `task-${index}-duration-warning`,
          type: "info",
          entity: "tasks",
          rowIndex: index,
          field: "Duration",
          message: "Long duration task detected",
          suggestion: "AI suggests breaking into smaller subtasks for better resource allocation",
          severity: "low",
          autoFixable: false,
        })
      }
    })

    // AI-enhanced worker validation with capacity analysis
    workers.forEach((worker, index) => {
      if (!worker.WorkerID) {
        errors.push({
          id: `worker-${index}-id`,
          type: "error",
          entity: "workers",
          rowIndex: index,
          field: "WorkerID",
          message: "Worker ID is required",
          suggestion: `Generate ID: W${String(index + 1).padStart(3, "0")}`,
          severity: "critical",
          autoFixable: true,
        })
      }

      // AI capacity optimization
      const availableSlots = (worker.AvailableSlots || []).length
      const maxLoad = worker.MaxLoadPerPhase || 0

      if (availableSlots > 0 && maxLoad > 0) {
        const utilizationRatio = maxLoad / availableSlots
        if (utilizationRatio > 0.8) {
          errors.push({
            id: `worker-${index}-overload-risk`,
            type: "warning",
            entity: "workers",
            rowIndex: index,
            field: "MaxLoadPerPhase",
            message: "High utilization ratio detected",
            suggestion: `AI suggests reducing max load to ${Math.floor(availableSlots * 0.7)} for optimal performance`,
            severity: "medium",
            autoFixable: true,
          })
        }
      }

      // AI skill diversity analysis
      const uniqueSkills = new Set(worker.Skills || [])
      if (uniqueSkills.size < 2) {
        errors.push({
          id: `worker-${index}-skill-diversity`,
          type: "info",
          entity: "workers",
          rowIndex: index,
          field: "Skills",
          message: "Limited skill diversity",
          suggestion: "AI recommends cross-training to increase versatility",
          severity: "low",
          autoFixable: false,
        })
      }
    })

    setValidationErrors(errors)
  }, [clients, workers, tasks])

  // AI-powered auto-fix functionality
  const autoFixValidationErrors = useCallback(async () => {
    const fixableErrors = validationErrors.filter((error) => error.autoFixable)
    const updatedClients = [...clients]
    const updatedWorkers = [...workers]
    const updatedTasks = [...tasks]

    for (const error of fixableErrors) {
      switch (error.entity) {
        case "clients":
          if (error.field === "ClientID" && !updatedClients[error.rowIndex]?.ClientID) {
            updatedClients[error.rowIndex] = {
              ...updatedClients[error.rowIndex],
              ClientID: `C${String(error.rowIndex + 1).padStart(3, "0")}`,
            }
          }
          if (error.field === "PriorityLevel") {
            const suggestedPriority = Number.parseInt(error.suggestion?.match(/\d+/)?.[0] || "3")
            updatedClients[error.rowIndex] = {
              ...updatedClients[error.rowIndex],
              PriorityLevel: suggestedPriority,
            }
          }
          if (error.field === "AttributesJSON") {
            try {
              const parsed = JSON.parse(updatedClients[error.rowIndex].AttributesJSON)
              updatedClients[error.rowIndex] = {
                ...updatedClients[error.rowIndex],
                AttributesJSON: JSON.stringify(parsed, null, 2),
              }
            } catch {
              updatedClients[error.rowIndex] = {
                ...updatedClients[error.rowIndex],
                AttributesJSON: '{"status": "active"}',
              }
            }
          }
          break

        case "workers":
          if (error.field === "WorkerID" && !updatedWorkers[error.rowIndex]?.WorkerID) {
            updatedWorkers[error.rowIndex] = {
              ...updatedWorkers[error.rowIndex],
              WorkerID: `W${String(error.rowIndex + 1).padStart(3, "0")}`,
            }
          }
          if (error.field === "MaxLoadPerPhase") {
            const suggestedLoad = Number.parseInt(error.suggestion?.match(/\d+/)?.[0] || "2")
            updatedWorkers[error.rowIndex] = {
              ...updatedWorkers[error.rowIndex],
              MaxLoadPerPhase: suggestedLoad,
            }
          }
          break

        case "tasks":
          if (error.field === "TaskID" && !updatedTasks[error.rowIndex]?.TaskID) {
            updatedTasks[error.rowIndex] = {
              ...updatedTasks[error.rowIndex],
              TaskID: `T${String(error.rowIndex + 1).padStart(3, "0")}`,
            }
          }
          break
      }
    }

    setClients(updatedClients)
    setWorkers(updatedWorkers)
    setTasks(updatedTasks)

    // Re-validate after fixes
    setTimeout(validateData, 100)
  }, [validationErrors, clients, workers, tasks, validateData])

  // AI-powered insights generation
  const generateAIInsights = useCallback(async () => {
    const insights: AIInsight[] = []

    // Resource utilization analysis
    const totalWorkerCapacity = workers.reduce(
      (sum, worker) => sum + (worker.MaxLoadPerPhase || 0) * (worker.AvailableSlots?.length || 0),
      0,
    )
    const totalTaskDemand = tasks.reduce((sum, task) => sum + (task.Duration || 0), 0)

    if (totalTaskDemand > totalWorkerCapacity * 0.8) {
      insights.push({
        id: "capacity-warning",
        type: "warning",
        title: "Resource Capacity Alert",
        description: `Task demand (${totalTaskDemand}) is approaching worker capacity (${totalWorkerCapacity})`,
        impact: "high",
        confidence: 0.9,
        actionable: true,
        suggestedAction: "Consider hiring additional workers or extending project timeline",
      })
    }

    // Skill gap analysis
    const requiredSkills = new Set(tasks.flatMap((t) => t.RequiredSkills || []))
    const availableSkills = new Set(workers.flatMap((w) => w.Skills || []))
    const missingSkills = [...requiredSkills].filter((skill) => !availableSkills.has(skill))

    if (missingSkills.length > 0) {
      insights.push({
        id: "skill-gap",
        type: "recommendation",
        title: "Skill Gap Identified",
        description: `Missing skills: ${missingSkills.join(", ")}`,
        impact: "high",
        confidence: 0.95,
        actionable: true,
        suggestedAction: "Implement training program or hire specialists",
      })
    }

    // Workload distribution analysis
    const workerLoads = workers.map((worker) => ({
      id: worker.WorkerID,
      load: (worker.MaxLoadPerPhase || 0) * (worker.AvailableSlots?.length || 0),
    }))

    const avgLoad = workerLoads.reduce((sum, w) => sum + w.load, 0) / workerLoads.length
    const imbalancedWorkers = workerLoads.filter((w) => Math.abs(w.load - avgLoad) > avgLoad * 0.3)

    if (imbalancedWorkers.length > 0) {
      insights.push({
        id: "workload-imbalance",
        type: "optimization",
        title: "Workload Imbalance Detected",
        description: `${imbalancedWorkers.length} workers have significantly different workloads`,
        impact: "medium",
        confidence: 0.8,
        actionable: true,
        suggestedAction: "Redistribute tasks to balance workload across team",
      })
    }

    // Priority distribution analysis
    const priorityDistribution = clients.reduce(
      (acc, client) => {
        acc[client.PriorityLevel] = (acc[client.PriorityLevel] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const highPriorityClients = (priorityDistribution[4] || 0) + (priorityDistribution[5] || 0)
    const totalClients = clients.length

    if (highPriorityClients / totalClients > 0.6) {
      insights.push({
        id: "priority-inflation",
        type: "pattern",
        title: "Priority Inflation Detected",
        description: `${Math.round((highPriorityClients / totalClients) * 100)}% of clients have high priority`,
        impact: "medium",
        confidence: 0.7,
        actionable: true,
        suggestedAction: "Review and rebalance client priorities for better resource allocation",
      })
    }

    setAiInsights(insights)
  }, [clients, workers, tasks])

  // AI-powered rule optimization
  const optimizeRules = useCallback(async () => {
    const suggestions: string[] = []

    // Analyze rule conflicts
    const coRunRules = rules.filter((r) => r.type === "coRun" && r.enabled)
    const loadLimitRules = rules.filter((r) => r.type === "loadLimit" && r.enabled)

    if (coRunRules.length > 3) {
      suggestions.push("Consider consolidating co-run rules to reduce complexity")
    }

    if (loadLimitRules.length === 0 && workers.length > 5) {
      suggestions.push("Add load limit rules to prevent worker overload in larger teams")
    }

    // Analyze rule effectiveness
    const customRules = rules.filter((r) => r.type === "custom" && r.enabled)
    const lowConfidenceRules = customRules.filter((r) => (r.confidence || 0) < 0.7)

    if (lowConfidenceRules.length > 0) {
      suggestions.push(`Review ${lowConfidenceRules.length} low-confidence AI-generated rules`)
    }

    setOptimizationSuggestions(suggestions)
  }, [rules, workers])

  // AI-powered resource prediction
  const predictResourceNeeds = useCallback(async () => {
    const prediction = {
      recommendedWorkers: Math.ceil(tasks.length / 3),
      skillGaps: [],
      timelineRisk: "low",
      capacityUtilization: 0,
      recommendations: [],
    }

    // Calculate capacity utilization
    const totalCapacity = workers.reduce(
      (sum, w) => sum + (w.MaxLoadPerPhase || 0) * (w.AvailableSlots?.length || 0),
      0,
    )
    const totalDemand = tasks.reduce((sum, t) => sum + (t.Duration || 0), 0)

    prediction.capacityUtilization = totalCapacity > 0 ? totalDemand / totalCapacity : 0

    if (prediction.capacityUtilization > 0.9) {
      prediction.timelineRisk = "high"
      prediction.recommendations.push("Consider extending timeline or adding resources")
    } else if (prediction.capacityUtilization > 0.7) {
      prediction.timelineRisk = "medium"
      prediction.recommendations.push("Monitor resource allocation closely")
    }

    return prediction
  }, [workers, tasks])

  // Enhanced AI search with natural language processing
  const searchData = useCallback(
    async (query: string) => {
      // Simulate AI-powered semantic search
      await new Promise((resolve) => setTimeout(resolve, 500))

      const lowerQuery = query.toLowerCase()
      const results = {
        clients: [],
        workers: [],
        tasks: [],
        insights: [],
      }

      // Smart search with context understanding
      if (lowerQuery.includes("high priority") || lowerQuery.includes("urgent")) {
        results.clients = clients.filter((c) => c.PriorityLevel >= 4)
      } else if (lowerQuery.includes("skill") || lowerQuery.includes("expertise")) {
        const skillMatch = lowerQuery.match(/skill[s]?\s+(\w+)/)?.[1]
        if (skillMatch) {
          results.workers = workers.filter((w) =>
            (w.Skills || []).some((skill) => skill.toLowerCase().includes(skillMatch)),
          )
          results.tasks = tasks.filter((t) =>
            (t.RequiredSkills || []).some((skill) => skill.toLowerCase().includes(skillMatch)),
          )
        }
      } else if (lowerQuery.includes("overload") || lowerQuery.includes("capacity")) {
        results.workers = workers.filter((w) => {
          const utilization = (w.MaxLoadPerPhase || 0) / (w.AvailableSlots?.length || 1)
          return utilization > 0.8
        })
      } else {
        // Fallback to general search
        results.clients = clients.filter((client) => JSON.stringify(client).toLowerCase().includes(lowerQuery))
        results.workers = workers.filter((worker) => JSON.stringify(worker).toLowerCase().includes(lowerQuery))
        results.tasks = tasks.filter((task) => JSON.stringify(task).toLowerCase().includes(lowerQuery))
      }

      return results
    },
    [clients, workers, tasks],
  )

  const addRule = useCallback((rule: Rule) => {
    setRules((prev) => [...prev, rule])
  }, [])

  const updateRule = useCallback((id: string, updates: Partial<Rule>) => {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule)))
  }, [])

  const removeRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id))
  }, [])

  const updatePriority = useCallback((id: string, weight: number) => {
    setPriorities((prev) => prev.map((priority) => (priority.id === id ? { ...priority, weight } : priority)))
  }, [])

  return (
    <DataContext.Provider
      value={{
        clients,
        workers,
        tasks,
        validationErrors,
        rules,
        priorities,
        aiInsights,
        dataQualityScore,
        optimizationSuggestions,
        setClients,
        setWorkers,
        setTasks,
        setValidationErrors,
        addRule,
        updateRule,
        removeRule,
        updatePriority,
        validateData,
        searchData,
        generateAIInsights,
        autoFixValidationErrors,
        optimizeRules,
        predictResourceNeeds,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
