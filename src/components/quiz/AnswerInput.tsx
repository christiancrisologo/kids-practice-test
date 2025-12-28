import React, { ChangeEvent } from 'react';

interface AnswerInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({ value, onChange, placeholder, disabled = false }) => {
    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full p-5 text-xl text-center bg-slate-700/50 text-white border-2 border-blue-500 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-slate-800 px-3 py-1 rounded text-sm font-bold">
                ⌨
            </div>
        </div>
    );
};

export default AnswerInput;
