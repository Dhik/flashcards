'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();

  const apps = [
    {
      name: 'FlashCards',
      description: 'Master English vocabulary with smart spaced repetition',
      path: '/flashcards',
      gradient: 'from-blue-500 to-purple-600',
      icon: '📚',
    },
    {
      name: 'SinsarAnalytics',
      description: 'Advanced analytics and insights platform',
      path: '/sinsar-analytics',
      gradient: 'from-green-500 to-teal-600',
      icon: '📊',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          Future Dream
        </h1>
        <p className="text-gray-600 text-xl md:text-2xl">
          Choose your application
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        {apps.map((app, index) => (
          <motion.button
            key={app.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => router.push(app.path)}
            className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 p-8"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

            <div className="relative z-10 text-center">
              <div className="text-6xl mb-4">{app.icon}</div>
              <h2 className={`text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r ${app.gradient}`}>
                {app.name}
              </h2>
              <p className="text-gray-600 text-lg">
                {app.description}
              </p>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${app.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
          </motion.button>
        ))}
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-gray-500 text-sm"
      >
        © 2025 Future Dream. All rights reserved.
      </motion.footer>
    </div>
  );
}
