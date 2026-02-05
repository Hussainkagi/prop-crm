"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type ThemeMode = "light" | "dark"
type ThemeColor = "blue" | "green" | "purple" | "orange" | "red" | "teal"

interface ThemeContextType {
  mode: ThemeMode
  color: ThemeColor
  setMode: (mode: ThemeMode) => void
  setColor: (color: ThemeColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const colorVariables: Record<ThemeColor, { primary: string; primaryForeground: string }> = {
  blue: { primary: "217 91% 60%", primaryForeground: "0 0% 100%" },
  green: { primary: "142 76% 36%", primaryForeground: "0 0% 100%" },
  purple: { primary: "262 83% 58%", primaryForeground: "0 0% 100%" },
  orange: { primary: "24 95% 53%", primaryForeground: "0 0% 100%" },
  red: { primary: "0 84% 60%", primaryForeground: "0 0% 100%" },
  teal: { primary: "173 80% 40%", primaryForeground: "0 0% 100%" },
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light")
  const [color, setColorState] = useState<ThemeColor>("blue")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedMode = localStorage.getItem("crm_theme_mode") as ThemeMode
    const storedColor = localStorage.getItem("crm_theme_color") as ThemeColor
    if (storedMode) setModeState(storedMode)
    if (storedColor) setColorState(storedColor)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    
    // Apply dark/light mode
    if (mode === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // Apply color theme
    const colors = colorVariables[color]
    root.style.setProperty("--primary", colors.primary)
    root.style.setProperty("--primary-foreground", colors.primaryForeground)
    root.style.setProperty("--ring", colors.primary)
    
    localStorage.setItem("crm_theme_mode", mode)
    localStorage.setItem("crm_theme_color", color)
  }, [mode, color, mounted])

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
  }

  const setColor = (newColor: ThemeColor) => {
    setColorState(newColor)
  }

  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ mode, color, setMode, setColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
