'use client';

import { AnimatePresence, MotionConfig } from 'framer-motion';

export default function MotionProvider({
    children
}: {
    children: React.ReactNode
}) {
    return (
        // reducedMotion="user" turns off transform animations for people who ask for less motion
        <MotionConfig reducedMotion="user">
            <AnimatePresence mode="wait">
                {children}
            </AnimatePresence>
        </MotionConfig>
    );
}
