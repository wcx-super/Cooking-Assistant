'use client'

import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/services/auth'
import { BotIcon, MessageSquareIcon, SparklesIcon, ZapIcon } from '@/ui/Icons'

export default function HomePage() {
  const router = useRouter()

  const handleStartChat = () => {
    // 检查是否已登录
    if (isAuthenticated()) {
      // 已登录，跳转到聊天页面
      router.push('/chat')
    } else {
      // 未登录，跳转到登录页面
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-1 via-white to-accent-1 flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-6 rounded-xl flex items-center justify-center">
                <BotIcon size={24} className="text-white" />
              </div>
              <span className="text-2xl font-display text-gray-10">做饭助手</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-gray-10 hover:text-brand-6 transition-colors font-medium"
              >
                登录
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-4 py-2 bg-brand-6 rounded-lg hover:bg-brand-7 transition-colors font-medium"
              >
                <span className="text-white">注册</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32">
          <div className="text-center">
            {/* Main Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-6 to-accent-6 rounded-3xl flex items-center justify-center shadow-2xl">
                  <BotIcon size={48} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-5 rounded-full flex items-center justify-center animate-pulse">
                  <SparklesIcon size={16} className="text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-10 mb-6">
              家常菜谱
              <span className="bg-gradient-to-r from-brand-6 to-accent-6 bg-clip-text text-transparent">
                {' '}智能助手
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-7 mb-12 max-w-2xl mx-auto">
              基于 RAG 技术，整合 370 多道家常菜谱，帮你快速找到想做的菜和详细做法。
              告诉它冰箱里有什么，它来告诉你今天吃什么。
            </p>

            {/* CTA Button */}
            <button
              onClick={handleStartChat}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-brand-6 to-accent-6 text-white text-lg font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <MessageSquareIcon size={24} className="text-white" />
              <span className="text-white">开始对话</span>
            </button>

            {/* Features */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-brand-1 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <ZapIcon size={28} className="text-brand-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-10 mb-3">
                  快速检索
                </h3>
                <p className="text-gray-7">
                  基于向量数据库，秒级检索相关菜谱，快速获取做法
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-accent-1 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <SparklesIcon size={28} className="text-accent-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-10 mb-3">
                  按需推荐
                </h3>
                <p className="text-gray-7">
                  根据手头的食材、口味和难度，推荐适合的家常菜
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-green-1 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <MessageSquareIcon size={28} className="text-green-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-10 mb-3">
                  精确用量
                </h3>
                <p className="text-gray-7">
                  用量和步骤来自真实菜谱，新手也能照着做
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white/50 backdrop-blur-sm border-t border-gray-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-7 text-sm">
            © 2024 做饭助手. 菜谱数据来自 HowToCook. Powered by RAG & AI technology.
          </p>
        </div>
      </footer>
    </div>
  )
}