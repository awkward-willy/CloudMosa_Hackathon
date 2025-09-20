import SignupForm from '@/app/components/signup-form';

export default function SignupPage() {
    return (
        <main className="flex flex-1 flex-col items-center justify-center space-y-4">
            <h3 className="text-lg font-bold text-gray-600">Create your account</h3>
            <SignupForm />
        </main>
    );
}
