"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface QuickQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Hardcoded Q&A data
const quickQuestions: QuickQuestion[] = [
  {
    id: "1",
    question: "Hello",
    answer: "Hello! How can I assist you today?",
    category: "Greeting",
  },
  {
    id: "2",
    question: "What are your working hours?",
    answer:
      "We're open Monday to Friday, 9 AM to 6 PM EST. How else can I help you?",
    category: "Business Hours",
  },
  {
    id: "3",
    question: "Loan or delivery related query",
    answer:
      "Please share your registered Loan Account Number or input your registered Mobile Number.",
    category: "Loan & Delivery",
  },
  {
    id: "4",
    question: "How do I return or get a refund?",
    answer:
      "We accept returns within 30 days of purchase. Items must be unused and in original packaging. Would you like me to start a return process?",
    category: "Returns & Refunds",
  },
  {
    id: "5",
    question: "What is my payment due date or cost?",
    answer: "Would you like to know your payment due date?",
    category: "Billing",
  },
  {
    id: "6",
    question: "How can I contact support?",
    answer:
      "You can reach us at support@company.com or call 1-800-123-4567. Is there anything else I can help with?",
    category: "Contact",
  },
  {
    id: "7",
    question: "How can I track my order?",
    answer:
      "To track your order, please provide your Property Sale order number. You can also check your order status in your account dashboard.",
    category: "Order Tracking",
  },
  {
    id: "8",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and Apple Pay. All payments are secure and encrypted.",
    category: "Payments",
  },
  {
    id: "9",
    question: "Thank you",
    answer: "You're welcome! Is there anything else I can help you with?",
    category: "Courtesy",
  },
  {
    id: "10",
    question: "Goodbye",
    answer: "Thank you for contacting us! Have a great day!",
    category: "Exit",
  },
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm your customer support assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickQuestion = (question: QuickQuestion) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: question.question,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Add bot response after a short delay
    setTimeout(() => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: question.answer,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      let response =
        "I'm sorry, I didn't quite understand that. Please try selecting one of the quick questions above, or contact our support team for personalized assistance.";

      const lowerInput = inputValue.toLowerCase();

      // Match keywords to predefined answers
      if (
        lowerInput.includes("hours") ||
        lowerInput.includes("open") ||
        lowerInput.includes("timing")
      ) {
        response =
          quickQuestions.find((q) => q.category === "Business Hours")?.answer ||
          response;
      } else if (lowerInput.includes("track") || lowerInput.includes("order")) {
        response =
          quickQuestions.find((q) => q.category === "Order Tracking")?.answer ||
          response;
      } else if (
        lowerInput.includes("return") ||
        lowerInput.includes("refund")
      ) {
        response =
          quickQuestions.find((q) => q.category === "Returns & Refunds")
            ?.answer || response;
      } else if (
        lowerInput.includes("ship") ||
        lowerInput.includes("delivery")
      ) {
        response =
          quickQuestions.find((q) => q.category === "Loan & Delivery")
            ?.answer || response;
      } else if (lowerInput.includes("payment") || lowerInput.includes("pay")) {
        response =
          quickQuestions.find((q) => q.category === "Billing")?.answer ||
          response;
      } else if (
        lowerInput.includes("contact") ||
        lowerInput.includes("support") ||
        lowerInput.includes("help")
      ) {
        response =
          quickQuestions.find((q) => q.category === "Contact")?.answer ||
          response;
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        response =
          quickQuestions.find((q) => q.category === "Greeting")?.answer ||
          response;
      } else if (lowerInput.includes("thank")) {
        response =
          quickQuestions.find((q) => q.category === "Courtesy")?.answer ||
          response;
      } else if (lowerInput.includes("bye") || lowerInput.includes("goodbye")) {
        response =
          quickQuestions.find((q) => q.category === "Exit")?.answer || response;
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-[400px] shadow-2xl transition-all duration-300 ${
        isMinimized ? "h-16" : "h-[600px]"
      } flex flex-col`}
    >
      <CardHeader className="bg-blue-600 dark:bg-blue-600 text-white rounded-t-lg p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              Customer Support
            </CardTitle>
            <p className="text-xs text-blue-100">
              We typically reply in minutes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-blue-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-950">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Quick Questions:
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickQuestions.slice(0, 6).map((question) => (
                <Button
                  key={question.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs h-auto py-2 px-3 text-left justify-start whitespace-normal"
                >
                  {question.category}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-950">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
