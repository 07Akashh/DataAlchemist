"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Clock, Target, TrendingUp, Sparkles, ArrowRight } from "lucide-react"
import { useData } from "@/contexts/data-context"

interface Step {
  id: string
  title: string
  description: string
  completed: boolean
  progress: number
  estimatedTime: string
  tips: string[]
}

export default function ProgressTracker() {
  const { clients, workers, tasks, validationErrors, rules, dataQualityScore } = useData()
  const [currentStep, setCurrentStep] = useState(0)

  const steps: Step[] = [
    {
      id: "upload",
      title: "Data Upload",
      description: "Upload your CSV/XLSX files for clients, workers, and tasks",
      completed: clients.length > 0 || workers.length > 0 || tasks.length > 0,
      progress: Math.min(
        100,
        ((clients.length > 0 ? 1 : 0) + (workers.length > 0 ? 1 : 0) + (tasks.length > 0 ? 1 : 0)) * 33.33,
      ),
      estimatedTime: "2-5 minutes",
      tips: [
        "Use our sample data to get started quickly",
        "AI will auto-map columns even with different headers",
        "Upload all three file types for best results",
      ],
    },
    {
      id: "validation",
      title: "Data Validation",
      description: "Fix validation errors and improve data quality",
      completed: validationErrors.filter((e) => e.type === "error").length === 0,
      progress: Math.max(0, Math.min(100, dataQualityScore)),
      estimatedTime: "1-3 minutes",
      tips: [
        "Use AI auto-fix for quick error resolution",
        "Focus on critical errors first",
        "Aim for 80%+ data quality score",
      ],
    },
    {
      id: "rules",
      title: "Business Rules",
      description: "Configure rules and constraints for resource allocation",
      completed: rules.length > 0,
      progress: Math.min(100, rules.length * 25),
      estimatedTime: "3-7 minutes",
      tips: [
        "Start with AI-generated rule recommendations",
        "Use natural language to describe complex rules",
        "Test rules with your actual data",
      ],
    },
    {
      id: "optimization",
      title: "Optimization",
      description: "Fine-tune priorities and generate insights",
      completed: dataQualityScore > 80 && rules.length > 0,
      progress: dataQualityScore > 80 && rules.length > 0 ? 100 : 50,
      estimatedTime: "2-4 minutes",
      tips: [
        "Use AI insights for optimization opportunities",
        "Balance priorities based on business needs",
        "Review resource predictions",
      ],
    },
    {
      id: "export",
      title: "Export & Deploy",
      description: "Export your configuration and cleaned data",
      completed: false, // This would be tracked separately
      progress: 0,
      estimatedTime: "1-2 minutes",
      tips: [
        "Export both data and configuration files",
        "Use the complete package for easy deployment",
        "Save configuration for future use",
      ],
    },
  ]

  // Update current step based on completion
  useEffect(() => {
    const completedSteps = steps.filter((step) => step.completed).length
    setCurrentStep(Math.min(completedSteps, steps.length - 1))
  }, [clients, workers, tasks, validationErrors, rules, dataQualityScore])

  const overallProgress = (steps.filter((step) => step.completed).length / steps.length) * 100
  const estimatedTimeRemaining = steps.slice(currentStep).reduce((total, step) => {
    const time = Number.parseInt(step.estimatedTime.split("-")[1]) || 5
    return total + time
  }, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Setup Progress
            </CardTitle>
            <CardDescription>Track your configuration progress and get AI-powered guidance</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{Math.round(overallProgress)}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-500">
              <Clock className="h-3 w-3 inline mr-1" />~{estimatedTimeRemaining} min remaining
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200" />}

              <div
                className={`flex gap-4 p-4 rounded-lg border transition-all ${
                  index === currentStep
                    ? "border-blue-200 bg-blue-50"
                    : step.completed
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                }`}
              >
                {/* Step Icon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-green-600 text-white"
                      : index === currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : index === currentStep ? (
                    <Sparkles className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{step.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={step.completed ? "default" : index === currentStep ? "secondary" : "outline"}>
                        {step.completed ? "Complete" : index === currentStep ? "In Progress" : "Pending"}
                      </Badge>
                      <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <Progress value={step.progress} className="h-1.5" />
                    <div className="text-xs text-gray-500 mt-1">{Math.round(step.progress)}% complete</div>
                  </div>

                  {/* Tips (show for current step) */}
                  {index === currentStep && !step.completed && (
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <h4 className="text-xs font-medium text-blue-800 mb-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        AI Tips for this step:
                      </h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-1">
                            <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        {currentStep < steps.length - 1 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Next: {steps[currentStep + 1]?.title}</h4>
            <p className="text-sm text-blue-700 mb-3">{steps[currentStep + 1]?.description}</p>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Continue Setup
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
