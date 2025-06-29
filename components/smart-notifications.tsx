"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, CheckCircle, AlertTriangle, Info, TrendingUp, Zap } from "lucide-react"
import { useData } from "@/contexts/data-context"

interface Notification {
  id: string
  type: "success" | "warning" | "info" | "error" | "optimization"
  title: string
  message: string
  timestamp: Date
  actionable: boolean
  action?: () => void
  actionLabel?: string
  priority: "high" | "medium" | "low"
  autoHide?: boolean
}

export default function SmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const { validationErrors, dataQualityScore, aiInsights, autoFixValidationErrors, generateAIInsights } = useData()

  // Smart notification generation based on data changes
  useEffect(() => {
    const newNotifications: Notification[] = []

    // Data quality notifications
    if (dataQualityScore < 60) {
      newNotifications.push({
        id: "quality-low",
        type: "warning",
        title: "Low Data Quality Detected",
        message: `Your data quality score is ${Math.round(dataQualityScore)}%. Consider fixing validation errors.`,
        timestamp: new Date(),
        actionable: true,
        action: autoFixValidationErrors,
        actionLabel: "Auto-fix Issues",
        priority: "high",
      })
    } else if (dataQualityScore > 90) {
      newNotifications.push({
        id: "quality-excellent",
        type: "success",
        title: "Excellent Data Quality!",
        message: `Your data quality score is ${Math.round(dataQualityScore)}%. Ready for optimization.`,
        timestamp: new Date(),
        actionable: true,
        action: generateAIInsights,
        actionLabel: "Generate Insights",
        priority: "low",
        autoHide: true,
      })
    }

    // Validation error notifications
    const criticalErrors = validationErrors.filter((e) => e.severity === "critical").length
    if (criticalErrors > 0) {
      newNotifications.push({
        id: "critical-errors",
        type: "error",
        title: "Critical Errors Found",
        message: `${criticalErrors} critical errors need immediate attention.`,
        timestamp: new Date(),
        actionable: true,
        action: autoFixValidationErrors,
        actionLabel: "Fix Now",
        priority: "high",
      })
    }

    // AI insights notifications
    const highImpactInsights = aiInsights.filter((i) => i.impact === "high").length
    if (highImpactInsights > 0) {
      newNotifications.push({
        id: "high-impact-insights",
        type: "optimization",
        title: "High-Impact Optimizations Available",
        message: `${highImpactInsights} optimization opportunities detected.`,
        timestamp: new Date(),
        actionable: false,
        priority: "medium",
      })
    }

    // Update notifications (avoid duplicates)
    setNotifications((prev) => {
      const existingIds = prev.map((n) => n.id)
      const filtered = newNotifications.filter((n) => !existingIds.includes(n.id))
      return [...prev, ...filtered]
    })

    if (newNotifications.length > 0) {
      setIsVisible(true)
    }
  }, [validationErrors, dataQualityScore, aiInsights, autoFixValidationErrors, generateAIInsights])

  // Auto-hide notifications
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications((prev) =>
        prev.filter((notification) => {
          if (notification.autoHide && Date.now() - notification.timestamp.getTime() > 5000) {
            return false
          }
          return true
        }),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "optimization":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      default:
        return "border-l-blue-500"
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-40 w-96 space-y-2">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`border-l-4 ${getPriorityColor(notification.priority)} shadow-lg animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {notification.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-2">{notification.message}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {notification.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {notification.actionable && notification.action && (
                    <Button
                      size="sm"
                      onClick={() => {
                        notification.action?.()
                        dismissNotification(notification.id)
                      }}
                      className="h-7 text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {notification.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
