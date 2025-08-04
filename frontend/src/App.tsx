import React, { useState, useEffect } from 'react'
import config from './config/env'
import {
  Search,
  Shield,
  AlertTriangle,
  Calendar,
  Building,
  Eye,
  EyeOff,
  Database,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  TrendingUp,
  BarChart3,
  LogIn,
  LogOut,
  UserPlus,
  X
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
}

interface AuthResponse {
  message: string
  token: string
  user: User
}

interface BreachDetail {
  breach: string
  details: string
  domain: string
  industry: string
  logo: string
  password_risk: string
  references: string
  searchable: string
  verified: string
  xposed_data: string
  xposed_date: string
  xposed_records: number
}

interface BackendResponse {
  success: boolean
  email: string
  data: {
    BreachMetrics: {
      industry: any[]
      passwords_strength: Array<{
        EasyToCrack: number
        PlainText: number
        StrongHash: number
        Unknown: number
      }>
      risk: Array<{
        risk_label: string
        risk_score: number
      }>
      xposed_data: any[]
      yearwise_details: Array<Record<string, number>>
    }
    BreachesSummary: {
      site: string
    }
    ExposedBreaches: {
      breaches_details: BreachDetail[]
    }
    ExposedPastes: any
    PastesSummary: {
      cnt: number
      domain: string
      tmpstmp: string
    }
  }
  checkedAt: string
}

export default function App() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BackendResponse | null>(null)
  const [error, setError] = useState("")
  const [showEmail, setShowEmail] = useState(false)

  // Authentication state
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authLoading, setAuthLoading] = useState(false)

  // Search limit for non-authenticated users
  const [searchCount, setSearchCount] = useState(0)
  const MAX_SEARCHES_WITHOUT_AUTH = 5

  // Authentication form state
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  // Check for existing auth token on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }

    // Get search count from localStorage for non-authenticated users
    const savedSearchCount = localStorage.getItem('searchCount')
    if (savedSearchCount && !token) {
      setSearchCount(parseInt(savedSearchCount))
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError("")

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const payload = authMode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : authForm

      const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data: AuthResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `${authMode} failed`)
      }

      // Store auth data
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userData', JSON.stringify(data.user))
      setUser(data.user)

      // Reset search count for authenticated users
      localStorage.removeItem('searchCount')
      setSearchCount(0)

      // Close modal and reset form
      setShowAuthModal(false)
      setAuthForm({ name: '', email: '', password: '' })

    } catch (err: any) {
      setError(err.message || `${authMode} failed. Please try again.`)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    setUser(null)
    setSearchCount(0)
    localStorage.removeItem('searchCount')
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    // Check search limit for non-authenticated users
    if (!user && searchCount >= MAX_SEARCHES_WITHOUT_AUTH) {
      setError(`You've reached the maximum of ${MAX_SEARCHES_WITHOUT_AUTH} searches. Please log in to continue searching.`)
      return
    }

    setLoading(true)
    setError("")
    setResults(null)

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      // Add auth token if user is logged in
      const token = localStorage.getItem('authToken')
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${config.apiBaseUrl}/api/auth/email-breach`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch breach data")
      }

      setResults(data)

      // Increment search count for non-authenticated users
      if (!user) {
        const newSearchCount = searchCount + 1
        setSearchCount(newSearchCount)
        localStorage.setItem('searchCount', newSearchCount.toString())
      }
    } catch (err: any) {
      setError(err.message || "Failed to check email. Please try again.")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@")
    if (local.length <= 2) return email
    return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`
  }

  const getRiskColor = (riskLabel: string) => {
    switch (riskLabel.toLowerCase()) {
      case "low":
        return "text-green-400 bg-green-900/30"
      case "medium":
        return "text-yellow-400 bg-yellow-900/30"
      case "high":
        return "text-red-400 bg-red-900/30"
      default:
        return "text-gray-400 bg-gray-800/30"
    }
  }

  const getPasswordRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "plaintext":
        return "bg-red-600 text-white"
      case "easytocrack":
        return "bg-orange-600 text-white"
      case "hardtocrack":
        return "bg-green-600 text-white"
      case "unknown":
        return "bg-gray-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getTotalRecordsExposed = () => {
    if (!results?.data?.ExposedBreaches?.breaches_details) return 0
    return results.data.ExposedBreaches.breaches_details.reduce((total, breach) => total + breach.xposed_records, 0)
  }

  const getYearlyData = () => {
    if (!results?.data?.BreachMetrics?.yearwise_details?.[0]) return []
    const yearly = results.data.BreachMetrics.yearwise_details[0]
    return Object.entries(yearly)
      .filter(([_, count]) => count > 0)
      .map(([year, count]) => ({ year: year.replace('y', ''), count }))
  }

  const getExposedDataTypes = () => {
    if (!results?.data?.BreachMetrics?.xposed_data?.[0]?.children) return []

    const categories: Array<{ category: string, items: Array<{ name: string, value: number }> }> = []

    results.data.BreachMetrics.xposed_data[0].children.forEach((category: any) => {
      const items = category.children?.map((item: any) => ({
        name: item.name.replace('data_', ''),
        value: item.value
      })) || []

      categories.push({
        category: category.name,
        items: items
      })
    })

    return categories
  }

  // Helper function to check if email is safe (no breaches found)
  const isEmailSafe = () => {
    return results?.success && (!results?.data?.ExposedBreaches?.breaches_details || results.data.ExposedBreaches.breaches_details.length === 0)
  }

  // Helper function to get breach count safely
  const getBreachCount = () => {
    return results?.data?.ExposedBreaches?.breaches_details?.length || 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <div className="max-w-[90%] mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center relative">
          {/* Auth Section */}
          <div className="absolute top-0 right-0 flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Welcome, {user.name}!</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-300">
                    Searches: {searchCount}/{MAX_SEARCHES_WITHOUT_AUTH}
                  </p>
                  <p className="text-xs text-gray-400">Login for unlimited searches</p>
                </div>
                <button
                  onClick={() => {
                    setAuthMode('login')
                    setShowAuthModal(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup')
                    setShowAuthModal(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </button>
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-xl">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Email Breach Checker
              </h1>
              <p className="text-gray-400 mt-1">
                Check if your email has been compromised in data breaches
              </p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
            <Search className="h-5 w-5 text-blue-400" />
            Search for Breaches
          </h2>

          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <input
              type="email"
              placeholder="Enter email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-12 px-4 text-lg border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-900/70 text-white placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Checking...
                </div>
              ) : (
                <div className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Check Email
                </div>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Status Message */}
            <div className={`p-4 rounded-lg border ${results.success
              ? 'bg-blue-900/30 border-blue-700'
              : 'bg-red-900/30 border-red-700'
              }`}>
              <div className="flex items-center">
                {results.success ? (
                  <CheckCircle className="h-5 w-5 text-blue-400 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400 mr-2" />
                )}
                <div>
                  <p className={`font-medium ${results.success ? 'text-blue-300' : 'text-red-300'}`}>
                    Breach check completed for {results.email}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Checked at: {new Date(results.checkedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Breaches</p>
                    <p className={`text-2xl font-bold ${getBreachCount() === 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {getBreachCount()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${getBreachCount() === 0 ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                    {getBreachCount() === 0 ? (
                      <Shield className="h-6 w-6 text-green-400" />
                    ) : (
                      <Database className="h-6 w-6 text-red-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Records Exposed</p>
                    <p className={`text-2xl font-bold ${getTotalRecordsExposed() === 0 ? 'text-green-400' : 'text-blue-400'}`}>
                      {formatNumber(getTotalRecordsExposed())}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${getTotalRecordsExposed() === 0 ? 'bg-green-900/50' : 'bg-blue-900/50'}`}>
                    <Users className={`h-6 w-6 ${getTotalRecordsExposed() === 0 ? 'text-green-400' : 'text-blue-400'}`} />
                  </div>
                </div>
              </div>

              {results.data?.BreachMetrics?.risk?.[0] ? (
                <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Risk Level</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getRiskColor(results.data.BreachMetrics.risk[0].risk_label)}`}>
                          {results.data.BreachMetrics.risk[0].risk_label}
                        </span>
                        <span className="text-sm text-gray-400">
                          {results.data.BreachMetrics.risk[0].risk_score}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-purple-900/50">
                      <TrendingUp className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Risk Level</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 rounded-full text-sm font-medium text-green-400 bg-green-900/30">
                          Low
                        </span>
                        <span className="text-sm text-gray-400">
                          0%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-green-900/50">
                      <Shield className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Email Address</p>
                    <p className="text-lg font-medium text-white">
                      {showEmail ? results.email : maskEmail(results.email)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEmail(!showEmail)}
                    className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    {showEmail ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Analysis */}
            {results.data?.BreachMetrics?.passwords_strength?.[0] && (
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                  <Key className="h-5 w-5 text-blue-400" />
                  Password Security Analysis
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(results.data.BreachMetrics.passwords_strength[0]).map(([type, count]) => (
                    <div key={type} className="text-center p-4 border border-gray-700 rounded-lg bg-gray-900/30">
                      <p className="text-2xl font-bold text-white">{count}</p>
                      <p className="text-sm text-gray-400 capitalize">
                        {type.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yearly Breach Timeline */}
            {getYearlyData().length > 0 && (
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  Breach Timeline
                </h3>
                <div className="space-y-2">
                  {getYearlyData().map(({ year, count }) => (
                    <div key={year} className="flex items-center justify-between p-2 bg-gray-900/40 rounded-lg">
                      <span className="font-medium text-white">{year}</span>
                      <span className="text-red-400 font-bold">{count} breach{count > 1 ? 'es' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exposed Data Types */}
            {getExposedDataTypes().length > 0 && (
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  Exposed Data Categories
                </h3>
                <div className="space-y-4">
                  {getExposedDataTypes().map((category, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg p-4 bg-gray-900/30">
                      <h4 className="font-semibold text-lg mb-3 text-white">{category.category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((item, itemIndex) => (
                          <span
                            key={itemIndex}
                            className="px-3 py-1 bg-orange-900/50 text-orange-300 text-sm rounded-full"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Breach Details */}
            {results.data?.ExposedBreaches?.breaches_details && results.data.ExposedBreaches.breaches_details.length > 0 && (
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                  <Database className="h-5 w-5 text-red-400" />
                  Detailed Breach Information
                </h3>
                <div className="space-y-6">
                  {results.data.ExposedBreaches.breaches_details.map((breach, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg p-6 bg-gray-900/30">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {breach.logo && (
                            <img src={breach.logo} alt={breach.breach} className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div>
                            <h4 className="font-bold text-xl text-white">{breach.breach}</h4>
                            <p className="text-gray-400">{breach.domain}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Building className="h-4 w-4 text-blue-400" />
                              <span className="text-sm text-blue-400">{breach.industry}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {breach.verified === "Yes" && (
                            <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded-full font-medium">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-300">
                            <strong>Date:</strong> {breach.xposed_date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-300">
                            <strong>Records:</strong> {formatNumber(breach.xposed_records)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-gray-400" />
                          <span className={`text-xs px-2 py-1 rounded-full ${getPasswordRiskColor(breach.password_risk)}`}>
                            {breach.password_risk}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {breach.details}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-2">Compromised Data:</p>
                        <div className="flex flex-wrap gap-2">
                          {breach.xposed_data.split(';').map((data, dataIndex) => (
                            <span
                              key={dataIndex}
                              className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded-full"
                            >
                              {data.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email is Safe - No Breaches Found */}
            {isEmailSafe() && (
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700 rounded-xl shadow-2xl p-8 text-center">
                <div className="p-4 rounded-full bg-green-900/50 w-fit mx-auto mb-4">
                  <Shield className="h-12 w-12 text-green-400" />
                </div>
                <h3 className="text-2xl font-semibold text-green-300 mb-2">Your Email is Safe! 🎉</h3>
                <p className="text-green-400 mb-4">
                  Great news! This email address was not found in any known data breaches.
                </p>
                <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-300">
                    No compromised accounts found<br />
                    No exposed personal data<br />
                    No password leaks detected
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Keep your accounts secure by using strong, unique passwords and enabling two-factor authentication.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </h2>
              <button
                onClick={() => {
                  setShowAuthModal(false)
                  setError("")
                  setAuthForm({ name: '', email: '', password: '' })
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAuth} className="p-6 space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    required={authMode === 'signup'}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your password"
                />
                {authMode === 'signup' && (
                  <p className="text-xs text-gray-400 mt-1">
                    Password must include uppercase, lowercase, number, and symbol
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {authLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    {authMode === 'login' ? 'Logging in...' : 'Signing up...'}
                  </div>
                ) : (
                  authMode === 'login' ? 'Login' : 'Sign Up'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'signup' : 'login')
                    setError("")
                    setAuthForm({ name: '', email: '', password: '' })
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  {authMode === 'login'
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Login"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}