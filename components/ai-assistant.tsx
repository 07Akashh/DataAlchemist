"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Send, Bot, User, Minimize2, Maximize2 } from "lucide-react"
import { useData } from "@/contexts/data-context"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
  actionable?: boolean
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "👋 Hi! I'm your AI assistant. I can help you optimize your resource allocation, fix data issues, and provide insights. What would you like to work on?",
      timestamp: new Date(),
      suggestions: [
        "Analyze my data quality",
        "Fix validation errors",
        "Optimize resource allocation",
        "Generate insights",
      ],
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { clients, workers, tasks, validationErrors, dataQualityScore, generateAIInsights, autoFixValidationErrors } =
    useData()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    setIsTyping(true)

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const lowerMessage = userMessage.toLowerCase()
    let response = ""
    let suggestions: string[] = []
    let actionable = false

    // Smart response generation based on context
    if (lowerMessage.includes("data quality") || lowerMessage.includes("quality")) {
      response = `Your current data quality score is ${Math.round(dataQualityScore)}%. `
      if (dataQualityScore < 70) {
        response += "I notice some areas for improvement. You have validation errors that I can help fix automatically."
        suggestions = ["Auto-fix validation errors", "Show detailed quality report", "Suggest improvements"]
        actionable = true
      } else if (dataQualityScore < 90) {
        response += "Good quality overall! There are a few minor optimizations I can suggest."
        suggestions = ["Show optimization tips", "Generate quality report", "Check for patterns"]
      } else {
        response += "Excellent data quality! Your data is well-structured and clean."
        suggestions = ["Generate insights", "Optimize allocation", "Export configuration"]
      }
    } else if (lowerMessage.includes("fix") || lowerMessage.includes("error")) {
      const autoFixableCount = validationErrors.filter((e) => e.autoFixable).length
      if (autoFixableCount > 0) {
        response = `I found ${autoFixableCount} issues I can fix automatically. These include missing IDs, invalid priority levels, and formatting issues.`
        suggestions = ["Fix all issues now", "Show error details", "Fix one by one"]
        actionable = true
      } else {
        response = "Great news! I don't see any auto-fixable errors in your data. Your validation is looking good!"
        suggestions = ["Check for warnings", "Optimize performance", "Generate insights"]
      }
    } else if (lowerMessage.includes("optimize") || lowerMessage.includes("improve")) {
      response =
        "I can help optimize your resource allocation in several ways: workload balancing, skill gap analysis, and capacity planning."
      suggestions = [
        "Analyze workload distribution",
        "Check skill coverage",
        "Predict resource needs",
        "Optimize rules",
      ]
      actionable = true
    } else if (lowerMessage.includes("insight") || lowerMessage.includes("analyze")) {
      response =
        "Let me analyze your data patterns and generate insights about resource utilization, skill gaps, and optimization opportunities."
      suggestions = ["Generate full analysis", "Check capacity utilization", "Identify bottlenecks"]
      actionable = true
    } else if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
      response =
        "I can assist you with:\n• Data validation and auto-fixing\n• Resource optimization\n• Insight generation\n• Quality analysis\n• Rule recommendations\n\nWhat specific area would you like help with?"
      suggestions = ["Data validation", "Resource optimization", "Generate insights", "Quality check"]
    } else {
      // General AI response
      response =
        "I understand you're looking for assistance. Based on your current data, I can help with validation, optimization, and insights generation. What would you like to focus on?"
      suggestions = ["Analyze my data", "Fix any issues", "Optimize allocation", "Show insights"]
    }

    setIsTyping(false)

    return {
      id: `ai-${Date.now()}`,
      type: "assistant",
      content: response,
      timestamp: new Date(),
      suggestions,
      actionable,
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    const aiResponse = await generateAIResponse(inputValue)
    setMessages((prev) => [...prev, aiResponse])
  }

  const handleSuggestionClick = async (suggestion: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: suggestion,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Handle specific actions
    if (suggestion.includes("Auto-fix") || suggestion.includes("Fix all")) {
      await autoFixValidationErrors()
      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: "assistant",
        content:
          "✅ I've automatically fixed all the issues I could resolve! Your data quality should be improved now.",
        timestamp: new Date(),
        suggestions: ["Check updated quality score", "Generate new insights", "Continue optimization"],
      }
      setMessages((prev) => [...prev, response])
    } else if (suggestion.includes("Generate") && suggestion.includes("insights")) {
      await generateAIInsights()
      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: "assistant",
        content:
          "🔍 I've generated fresh insights about your data! Check the AI Dashboard to see resource utilization analysis, skill gaps, and optimization recommendations.",
        timestamp: new Date(),
        suggestions: ["View AI Dashboard", "Optimize rules", "Check predictions"],
      }
      setMessages((prev) => [...prev, response])
    } else {
      const aiResponse = await generateAIResponse(suggestion)
      setMessages((prev) => [...prev, aiResponse])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full animate-pulse" />
      </div>
    )
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      }`}
    >
      <Card className="h-full shadow-2xl border-2 border-purple-200">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white text-purple-600">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm">AI Assistant</CardTitle>
                <CardDescription className="text-xs text-purple-100">
                  {isTyping ? "Thinking..." : "Ready to help"}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.type === "assistant" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`max-w-[80%] ${message.type === "user" ? "order-1" : ""}`}>
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            message.type === "user" ? "bg-blue-600 text-white ml-auto" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {message.content}
                        </div>

                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs h-7 px-2"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>

                      {message.type === "user" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your data..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
