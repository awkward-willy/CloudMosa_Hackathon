import LoginForm from '@/app/components/login-form';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="mx-auto flex min-h-screen flex-col items-center justify-center p-2 text-center">
            <main className="flex flex-1 flex-col items-center justify-center space-y-4">
                <h1 className="text-lg font-bold text-gray-600">Welcome back</h1>
                <LoginForm />
                <p className="text-sm text-gray-500">Don&apos;t have an account?
                    <Link className="text-blue-600 underline" href="/signup">Sign up</Link>
                </p>
            </main>
        </div>
    );
}
