import SignupForm from '@/app/components/signup-form';

export default function SignupPage() {
    return (
        <div className="mx-auto flex min-h-screen flex-col items-center justify-center p-2 text-center">
            <main className="flex flex-1 flex-col items-center justify-center space-y-4">
                <h1 className="text-lg font-bold text-gray-600">Create your account</h1>
                <SignupForm />
            </main>
        </div>
    );
}
