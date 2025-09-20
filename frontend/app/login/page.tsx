import LoginForm from '@/app/components/login-form';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <main className="flex flex-1 flex-col items-center justify-center space-y-4">
            <LoginForm />
            <p className="text-sm text-gray-500">Don&apos;t have an account?<br />
                <Link className="text-blue-600 font-bold" href="/signup">Sign up</Link>
            </p>
        </main>
    );
}