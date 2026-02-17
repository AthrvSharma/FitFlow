import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Database } from 'lucide-react';
import DataVerification from '../components/developer/DataVerification';

export default function DevTools() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Code2 className="w-10 h-10 text-indigo-600" />
          Developer Tools
        </h1>
        <p className="text-slate-600 mt-2 font-semibold text-lg">Verify your cloud data storage</p>
      </motion.div>

      <DataVerification />
    </div>
  );
}