'use server';
import LogoutConfirmButton from '../components/LogoutConfirmButton';

export default async function LogoutPage() {
    // Are you sure you want to logout?
    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Are you sure you want to logout?</h1>
            <LogoutConfirmButton />
        </>
    );
}
