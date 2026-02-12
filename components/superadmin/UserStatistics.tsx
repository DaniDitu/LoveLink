import React from 'react';
import { PieChart, Calendar, MapPin, Users } from 'lucide-react';

interface StatsProps {
    stats: {
        total: number;
        men: number;
        women: number;
        couples: number;
        avgAge: number;
        topRegion?: [string, number];
    } | null;
}

export const UserStatistics: React.FC<StatsProps> = ({ stats }) => {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-night-800 p-5 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                    <PieChart className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-night-200 font-bold uppercase">Distribuzione Genere</p>
                    <div className="flex gap-2 text-sm font-medium mt-1">
                        <span className="text-blue-600">{stats.men} M</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-rose-500">{stats.women} F</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-purple-500">{stats.couples} C</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-night-800 p-5 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-400">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-night-200 font-bold uppercase">Età Media</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.avgAge || 0} Anni</p>
                </div>
            </div>

            <div className="bg-white dark:bg-night-800 p-5 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full text-orange-600 dark:text-orange-400">
                    <MapPin className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-night-200 font-bold uppercase">Top Regione</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[120px]" title={stats.topRegion ? stats.topRegion[0] : 'N/A'}>
                        {stats.topRegion ? stats.topRegion[0] : 'N/A'}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-night-800 p-5 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600 dark:text-purple-400">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-night-200 font-bold uppercase">Utenti Filtrati</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
            </div>
        </div>
    );
};