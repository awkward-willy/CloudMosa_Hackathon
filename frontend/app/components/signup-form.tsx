'use client'

import { signup } from '@/app/actions/auth'
import { useActionState } from 'react'

export default function SignupForm() {
    const [state, action, pending] = useActionState(signup, undefined)

    return (
        <form action={action} className="flex flex-col space-y-4 w-50">
            <div className="flex flex-col text-left">
                <label htmlFor="name" className="text-gray-700 font-medium mb-2 my-2">Name</label>
                <input id="name" name="name" placeholder="Name" className="border-2 border-green-400 focus:border-green-500 focus:outline-none px-4 rounded-lg text-gray-700" />
            </div>
            {state?.errors?.name && <p className="text-red-600 text-sm">{state.errors.name}</p>}

            <div className="flex flex-col text-left">
                <label htmlFor="email" className="text-gray-700 font-medium mb-2 my-2">Email</label>
                <input id="email" name="email" placeholder="Email" className="border-2 border-green-400 focus:border-green-500 focus:outline-none px-4 rounded-lg text-gray-700" />
            </div>
            {state?.errors?.email && <p  className="text-red-600 text-sm">{state.errors.email}</p>}

            <div className="flex flex-col text-left">
                <label htmlFor="password" className="text-gray-700 font-medium mb-2 my-2">Password</label>
                <input id="password" name="password" type="password" className="border-2 border-green-400 focus:border-green-500 focus:outline-none px-4 rounded-lg text-gray-700" />
            </div>
            {state?.errors?.password && (
                <div>
                    <p  className="text-red-600 text-sm">Password must:</p>
                    <ul>
                        {state.errors.password.map((error: string) => (
                            <li  className="text-red-600 text-sm" key={error}>- {error}</li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="flex flex-col items-center">
                <button disabled={pending} type="submit" className="text-white font-bold rounded-lg w-20 bg-green-500 py-3">
                    Sign Up
                </button>
            </div>
        </form>
    )
}