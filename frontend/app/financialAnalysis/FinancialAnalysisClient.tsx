"use client";

import { useState, useRef, useCallback, useTransition } from 'react';
import { Spinner } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { fetchFinancialAnalysisAudio } from '@/app/actions/financialAnalysis/fetchFinancialAnalysisAudio';

interface Props {
    initialAdvice: string;
    initialError?: string;
}

export default function FinancialAnalysisClient({ initialAdvice, initialError }: Props) {
    const [advice] = useState(initialAdvice);
    const [error, setError] = useState<string | undefined>(initialError);
    const [loadingAudio, setLoadingAudio] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const objectUrlRef = useRef<string | null>(null);

    const [isPending, startTransition] = useTransition();

    const fetchAudio = useCallback(() => {
        startTransition(async () => {
            try {
                setLoadingAudio(true);
                setError(undefined);
                const { audioBuffer, error } = await fetchFinancialAnalysisAudio(30);
                if (error) {
                    setError(error);
                    return;
                }
                if (!audioBuffer) {
                    setError('No audio data received');
                    return;
                }
                const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
                if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
                const url = URL.createObjectURL(blob);
                objectUrlRef.current = url;
                if (!audioRef.current) {
                    audioRef.current = new Audio();
                    audioRef.current.onended = () => setIsPlaying(false);
                    audioRef.current.onpause = () => setIsPlaying(false);
                    audioRef.current.onplay = () => setIsPlaying(true);
                }
                audioRef.current.src = url;
                await audioRef.current.play();
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : String(e));
            } finally {
                setLoadingAudio(false);
            }
        });
    }, []);

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;
        if (audioRef.current.paused) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, []);

    return (
        <section className="w-full max-w-3xl space-y-4 p-4">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={audioRef.current ? togglePlay : fetchAudio}
                    disabled={loadingAudio}
                    className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium"
                >
                    {(loadingAudio || isPending) ? <div className="flex items-center gap-2"><Spinner size='xs' /> <span>Loading</span></div> : audioRef.current ? (isPlaying ? 'Pause' : 'Play') : 'Speak'}
                </button>
                {audioRef.current && !loadingAudio && (
                    <span className="text-xs text-gray-500">{isPlaying ? 'Playing...' : 'Audio loaded'}</span>
                )}
            </div>
            {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none bg-gray-50 p-4 rounded border border-gray-200 ">
                <ReactMarkdown>{advice}</ReactMarkdown>
            </div>
        </section>
    );
}
