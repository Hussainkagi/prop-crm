"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  userId: string
  name: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (userId: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hardcoded credentials
const VALID_USER = {
  userId: "user001",
  password: "12345678",
  name: "Current Agent",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already logged in (session persistence)
    const storedUser = sessionStorage.getItem("crm_user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setIsAuthenticated(true)
    }
  }, [])

  const login = (userId: string, password: string): boolean => {
    if (userId === VALID_USER.userId && password === VALID_USER.password) {
      const loggedInUser = { userId: VALID_USER.userId, name: VALID_USER.name }
      setUser(loggedInUser)
      setIsAuthenticated(true)
      sessionStorage.setItem("crm_user", JSON.stringify(loggedInUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    sessionStorage.removeItem("crm_user")
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
