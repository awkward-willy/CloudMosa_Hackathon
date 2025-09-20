'use server';
import LogoutConfirmButton from '../components/LogoutConfirmButton';

export default async function LogoutPage() {
    // Are you sure you want to logout?
    return (
        <main className="flex flex-1 flex-col items-center justify-center space-y-4">
            <h2 className="text-2xl font-bold mb-4">Are you sure you want to log out?</h2>
            <LogoutConfirmButton />
        </main>
    );
}