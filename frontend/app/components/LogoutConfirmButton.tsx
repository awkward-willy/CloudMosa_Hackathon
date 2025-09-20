'use client';
import React from 'react';
import { Button } from "@chakra-ui/react";
import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
export default function LogoutConfirmButton() {
    const router = useRouter();
    const yesRef = React.useRef<HTMLButtonElement | null>(null);
    const noRef = React.useRef<HTMLButtonElement | null>(null);
    const [focusIndex, setFocusIndex] = React.useState(0); // 0: yes, 1: no

    React.useEffect(() => {
        const targets = [yesRef.current, noRef.current];
        targets[focusIndex]?.focus();
    }, [focusIndex]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            setFocusIndex(prev => (prev === 0 ? 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (focusIndex === 0) {
                // 提交登出
                yesRef.current?.click();
            } else {
                noRef.current?.click();
            }
        }
    };

    return (
        <form action={logout} onKeyDown={onKeyDown} aria-label="Confirm logout" style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
                ref={yesRef}
                color="white"
                bg="green.600"
                margin="0.5rem"
                borderRadius="lg"
                fontSize="lg"
                type="submit"
                data-focusable
            >Yes</Button>
            <Button
                ref={noRef}
                color="white"
                bg="red.600"
                margin="0.5rem"
                borderRadius="lg"
                fontSize="lg"
                type="button"
                onClick={() => router.push('/')}
                data-focusable
            >No</Button>
        </form>
    )
}