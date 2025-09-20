'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';

export default function LoginForm() {
    const [state, action, pending] = useActionState(login, undefined);

    return (
        <form action={action} className="flex flex-col space-y-4 w-50">
            <div className="flex flex-col text-left">
                <label htmlFor="username" className="text-gray-700 font-medium mb-2 my-2">Username</label>
                <input id="username" name="username" placeholder="your username" className="border-2 border-green-400 focus:border-green-500 focus:outline-none px-4 rounded-lg text-gray-700" />
            </div>
            <div className="flex flex-col text-left">
                <label htmlFor="password" className="text-gray-700 font-medium mb-2 my-2">Password</label>
                <input id="password" name="password" type="password" className="border-2 border-green-400 focus:border-green-500 focus:outline-none px-4 rounded-lg text-gray-700" />
            </div>
            <div className="flex flex-col items-center">
                {state?.message && <p className="text-red-600 text-sm">{state.message}</p>}
                {pending ? (
                    <span className="text-gray-700 font-bold py-3">Logging in...</span>
                ) : (
                    <button type="submit" className="text-white font-bold rounded-lg w-20 bg-green-500 py-3">
                        Log In
                    </button>
                )}
            </div>
        </form>
    );
}
