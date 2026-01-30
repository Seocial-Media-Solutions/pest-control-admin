import { useState } from 'react';

const Toggle = ({ checked, onChange, label, disabled = false, size = 'md' }) => {
    const sizes = {
        sm: {
            container: 'w-8 h-4',
            circle: 'w-3 h-3',
            translate: 'translate-x-4'
        },
        md: {
            container: 'w-11 h-6',
            circle: 'w-5 h-5',
            translate: 'translate-x-5'
        },
        lg: {
            container: 'w-14 h-7',
            circle: 'w-6 h-6',
            translate: 'translate-x-7'
        }
    };

    const currentSize = sizes[size];

    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`
                    relative inline-flex ${currentSize.container} items-center rounded-full
                    transition-all duration-300 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
                    disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-inner
                    ${checked
                        ? 'bg-green-500 hover:bg-green-600 focus:ring-green-400 border-2 border-green-600'
                        : 'bg-red-500 hover:bg-red-600 focus:ring-red-400 border-2 border-red-600'
                    }
                `}
            >
                <span className="sr-only">{label}</span>
                <span
                    className={`
                        ${currentSize.circle}
                        inline-block rounded-full bg-white shadow-lg
                        transform transition-all duration-300 ease-in-out
                        ring-2 ring-white
                        ${checked ? currentSize.translate : 'translate-x-0.5'}
                    `}
                />
            </button>
            {label && (
                <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                    {label}
                </span>
            )}
        </div>
    );
};

export default Toggle;
