import React, { forwardRef, useEffect, useRef, InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    isFocused?: boolean;
    className?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ type = 'text', className = '', isFocused = false, ...props }, ref) => {
        const innerRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (isFocused) {
                (ref ? (ref as React.RefObject<HTMLInputElement>).current : innerRef.current)?.focus();
            }
        }, [isFocused, ref]);

        return (
            <input
                {...props}
                type={type}
                className={
                    'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' +
                    className
                }
                ref={ref || innerRef}
            />
        );
    }
);

export default TextInput; 