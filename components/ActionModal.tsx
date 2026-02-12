import React from 'react';
import { AlertTriangle, Trash2, CheckCircle2, Flag, AlertCircle } from 'lucide-react';

export interface ActionModalProps {
    isOpen: boolean;
    type?: 'CONFIRM' | 'PROMPT' | 'ALERT';
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    validationString?: string;
    inputValue?: string;
    inputPlaceholder?: string;
    onConfirm: (val?: string) => void;
    onCancel: () => void;
    onInputChange?: (val: string) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({ 
    isOpen, type = 'CONFIRM', title, description, confirmText, cancelText, isDanger, 
    validationString, inputValue, inputPlaceholder, onConfirm, onCancel, onInputChange 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-night-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-night-700 transform transition-all animate-in zoom-in-95 duration-200">
                <div className={`p-6 border-b border-slate-100 dark:border-night-700 flex items-center gap-3 ${isDanger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-night-900'}`}>
                    <div className={`p-2 rounded-full ${isDanger ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-200 dark:bg-night-700 text-slate-600 dark:text-white'}`}>
                        {type === 'ALERT' ? <AlertCircle className="w-6 h-6" /> : (isDanger ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />)}
                    </div>
                    <h3 className={`font-bold text-lg ${isDanger ? 'text-red-900 dark:text-red-300' : 'text-slate-900 dark:text-white'}`}>
                        {title}
                    </h3>
                </div>
                
                <div className="p-6">
                    <p className="text-slate-600 dark:text-night-200 text-sm leading-relaxed mb-4">
                        {description}
                    </p>
                    
                    {type === 'PROMPT' && (
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none font-bold text-center uppercase"
                            placeholder={inputPlaceholder || validationString}
                            value={inputValue}
                            onChange={(e) => onInputChange && onInputChange(e.target.value)}
                        />
                    )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-night-900 border-t border-slate-100 dark:border-night-700 flex gap-3">
                    {type !== 'ALERT' && (
                        <button 
                            onClick={onCancel}
                            className="flex-1 py-2.5 bg-white dark:bg-night-800 border border-slate-300 dark:border-night-600 text-slate-700 dark:text-night-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-night-700 transition-colors"
                        >
                            {cancelText || 'Annulla'}
                        </button>
                    )}
                    <button 
                        onClick={() => onConfirm(inputValue)}
                        disabled={type === 'PROMPT' && validationString && inputValue !== validationString}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {confirmText || 'Ok'}
                    </button>
                </div>
            </div>
        </div>
    );
};