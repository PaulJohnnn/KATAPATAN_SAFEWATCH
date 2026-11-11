import React from 'react';
import { Shield, ArrowRight, ShieldCheck, EyeOff, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingView = ({ onNavigate }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center text-blue-950 dark:text-blue-100">
          <Shield className="w-8 h-8 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="font-extrabold text-xl tracking-tight">Katapatan SafeWatch</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:py-24 max-w-6xl mx-auto w-full md:grid md:grid-cols-2 md:gap-12">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col items-start space-y-6"
        >
          <motion.div variants={itemVariants} className="inline-block bg-blue-100 dark:bg-slate-800 text-blue-900 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-2">
            Community First
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black text-blue-950 dark:text-white leading-tight">
            1-Tap Anonymous Emergency Network for Verified Neighbors.
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-600 dark:text-slate-400 font-medium">
            Bridge dangerous emergency delays. Connect instantly with your barangay.
          </motion.p>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('login')}
            className="mt-4 bg-blue-950 dark:bg-blue-600 hover:bg-blue-900 dark:hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(37,99,235,0.3)] transition-all flex items-center text-lg"
          >
            Launch App <ArrowRight className="ml-2 w-5 h-5" />
          </motion.button>
          <motion.p variants={itemVariants} className="text-sm text-gray-500 dark:text-slate-400 font-medium">
            New here?{' '}
            <button onClick={() => onNavigate('signup')} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Create a free account
            </button>{' '}
            or try the demo resident account.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-16 md:mt-0 relative w-full flex justify-center"
        >
          {/* Decorative element resembling a phone UI */}
          <div className="w-[300px] h-[600px] border-[12px] border-slate-900 dark:border-slate-800 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col pt-8 items-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="absolute top-0 w-32 h-7 bg-slate-900 dark:bg-slate-800 rounded-b-2xl z-10"></div>

            {/* Mock App Screen Inside */}
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 bg-red-500 rounded-full mt-24 shadow-[0_0_40px_rgba(239,68,68,0.5)] flex items-center justify-center relative"
            >
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
              <span className="text-white font-black text-2xl relative z-10">SOS</span>
            </motion.div>

            <div className="mt-12 bg-white dark:bg-slate-800 w-5/6 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700"></div>
                <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-3/4"></div>
            </div>

            <div className="mt-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 w-5/6 rounded-2xl p-4 flex items-center shadow-sm">
              <div className="h-4 bg-orange-200 dark:bg-orange-900/30 rounded w-full"></div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="bg-white dark:bg-slate-950 py-24 px-6 border-t border-gray-100 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: ShieldCheck, title: "1-Tap SOS", tone: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400", desc: "Instantly alert your neighborhood and local authorities with a single tap in emergencies." },
              { icon: EyeOff, title: "Hide Identities", tone: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400", desc: "Report suspicious activities entirely anonymously. Your safety and privacy remain our top priority." },
              { icon: Bell, title: "Local Barangay Alerts", tone: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400", desc: "Receive verified, hyper-local alerts directly from your barangay officials in real-time." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-gray-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-xl border border-transparent hover:border-gray-100 dark:hover:border-slate-700 group"
              >
                <div className={`w-16 h-16 ${feature.tone} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-blue-950 dark:text-blue-100 mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed font-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingView;
