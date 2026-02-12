import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 dark:bg-night-950 border-t border-slate-200 dark:border-night-700 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          Lovelink © 2026
        </p>
        <div className="flex justify-center items-center gap-4 text-xs text-slate-500 dark:text-night-200">
          <Link to="/terms" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Termini di Servizio
          </Link>
          <span className="text-slate-300 dark:text-night-700">|</span>
          <Link to="/privacy" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};