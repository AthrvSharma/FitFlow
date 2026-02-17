import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function QuickActionCard({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  gradient 
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card 
        className="p-6 cursor-pointer border-slate-200/60 hover:border-indigo-300 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
        onClick={onClick}
      >
        <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </Card>
    </motion.div>
  );
}