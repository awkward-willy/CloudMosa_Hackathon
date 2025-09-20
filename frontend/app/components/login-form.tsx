'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';

export default function LoginForm() {
    const [state, action, pending] = useActionState(login, undefined);

    return (
        <form action={action} className="flex flex-col space-y-4 w-64">
            <div className="flex flex-col text-left">
                <label htmlFor="username" className="text-sm font-medium">Username</label>
                <input id="username" name="username" placeholder="your_username" className="border px-2 py-1 rounded" />
            </div>
            <div className="flex flex-col text-left">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <input id="password" name="password" type="password" className="border px-2 py-1 rounded" />
            </div>
            {state?.message && <p className="text-red-600 text-sm">{state.message}</p>}
            <button disabled={pending} type="submit" className="bg-blue-600 text-white py-1 rounded disabled:opacity-50">{pending ? 'Logging in...' : 'Log In'}</button>
        </form>
    );
}
