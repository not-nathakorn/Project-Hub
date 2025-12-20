import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Theme colors for status bar (must match index.css background)
// Light mode uses soft blue to blend with gradient background
// Dark mode uses deep slate-900
const THEME_COLORS = {
  light: "#DBEAFE",  // Light blue (matches gradient top - blue-100)
  dark: "#0f172a",   // Dark mode background (slate-900)
}

// Update theme-color meta tag for iOS/iPad status bar
const updateThemeColor = (resolvedTheme: "light" | "dark") => {
  // Remove existing theme-color meta tags
  const existingMetas = document.querySelectorAll('meta[name="theme-color"]')
  existingMetas.forEach(meta => meta.remove())
  
  // Create new theme-color meta tag
  const meta = document.createElement('meta')
  meta.name = 'theme-color'
  meta.content = THEME_COLORS[resolvedTheme]
  document.head.appendChild(meta)
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    let resolvedTheme: "light" | "dark"

    if (theme === "system") {
      resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
    } else {
      resolvedTheme = theme
    }

    root.classList.add(resolvedTheme)
    
    // ✅ Update theme-color for iOS/iPad status bar
    updateThemeColor(resolvedTheme)
  }, [theme])

  // Listen for system theme changes when using "system" mode
  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = (e: MediaQueryListEvent) => {
      const resolvedTheme = e.matches ? "dark" : "light"
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(resolvedTheme)
      updateThemeColor(resolvedTheme)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
