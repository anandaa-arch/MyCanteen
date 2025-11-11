'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@/lib/supabaseClient'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validationSchemas'
import { FormInput, FormSubmitButton, FormErrorSummary } from '@/components/FormComponents'
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { AuthErrorBoundary } from '@/components/PageErrorBoundary'

function LoginPageContent() {
  const router = useRouter()
  const supabase = useSupabaseClient()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (formData) => {
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      const user = data.user
      if (!user) throw new Error('Login failed: no user')

      // ✅ Fetch role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles_new')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      if (!profile || !profile.role) throw new Error('User role not found')

      // Redirect based on role
      if (profile.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/user/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Image Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/canteen-3.jpg"
          alt="Modern Canteen"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/90 to-blue-900/90"></div>
        
        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image 
              src="/MyCanteen-logo.jpg" 
              alt="MyCanteen Logo" 
              width={48} 
              height={48}
              className="rounded-xl object-cover"
            />
            <div className="text-3xl font-bold">MyCanteen</div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Streamline Your
              <br />
              Canteen Operations
            </h1>
            <p className="text-xl text-blue-100 max-w-md">
              Smart attendance tracking, automated billing, and real-time insights for modern institutions.
            </p>
            
            {/* Features */}
            <div className="space-y-3 pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>QR-based attendance tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Automated billing & reminders</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Real-time analytics dashboard</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-blue-200">
            © {new Date().getFullYear()} MyCanteen. Professional Mess Management.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo (Visible on mobile only) */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Image 
                src="/MyCanteen-logo.jpg" 
                alt="MyCanteen Logo" 
                width={48} 
                height={48}
                className="rounded-xl object-cover"
              />
              <div className="text-2xl font-bold text-blue-700">MyCanteen</div>
            </div>
          </div>

          {/* Back to Home Button */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-700 transition font-medium mb-8"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <FormErrorSummary errors={errors} />

            <form className="space-y-6 mt-6" onSubmit={handleSubmit(onSubmit)}>
              <FormInput
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                error={errors.email?.message}
                {...register('email')}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    className={`w-full px-4 py-4 pr-12 text-gray-900 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition placeholder-gray-500 ${
                      errors.password 
                        ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <FormSubmitButton loading={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </FormSubmitButton>
            </form>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Having trouble accessing your account?
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setError('Please contact your administrator for support')
                  }
                  className="text-blue-700 hover:text-blue-800 font-medium text-sm transition"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 mt-8 opacity-60">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-blue-200 rounded"></div>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span>Secure Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthErrorBoundary>
      <LoginPageContent />
    </AuthErrorBoundary>
  )
}