'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageIcon } from 'lucide-react';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
    fallbackClassName?: string;
}

export function SafeImage({ src, alt, className, fallbackClassName, ...props }: SafeImageProps) {
    const [error, setError] = useState(false);

    if (error || !src) {
        return (
            <div 
                className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className} ${fallbackClassName}`}
                role="img" 
                aria-label={alt || "Image placeholder"}
            >
                <ImageIcon className="w-8 h-8 opacity-50" />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            {...props}
        />
    );
}
