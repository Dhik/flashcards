'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SinsarAnalyticsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-teal-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        <div className="text-8xl mb-8">📊</div>
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 mb-6">
          SinsarAnalytics
        </h1>
        <p className="text-gray-600 text-xl mb-12">
          Advanced analytics and insights platform
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600">
            This application is currently under development. Check back soon for powerful analytics features!
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
        >
          ← Back to Home
        </button>
      </motion.div>
    </div>
  );
}
