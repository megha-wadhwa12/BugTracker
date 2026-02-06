'use client'

import { signupAPI } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';
import { Bug } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupFormValues, signupSchema } from '@/lib/validators/auth';
import toast from 'react-hot-toast';

export default function SignupPage() {
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const { register, handleSubmit, formState: {
        errors, isSubmitting
    } } = useForm<signupFormValues>({
        resolver: zodResolver(signupSchema)
    });

    const onSubmit = async (values: signupFormValues) => {
        try {
            const data = await signupAPI(values);
            login(data.token, data.user);
            toast.success("Account created successfully 🎉");
            router.push('/dashboard');
        } catch (error) {
            toast.error("Email already exists or invalid data");
        }
    }

    return (
        <div className="min-h-screen min-w-screen bg-main-gradient flex items-center justify-center text-white select-none flex-col px-4">
            <div className="flex flex-col min-w-screen items-center text-center mb-6">
                <div className='h-10 w-10 rounded-full bg-primary-soft flex items-center justify-center mb-3'>
                    <span className='text-primary text-lg'><Bug /></span>
                </div>

                <h1 className='text-xl font-semibold text-primary'>Join BugTrack Pro today</h1>
                <p className="text-sm text-muted mt-1">
                    Start managing your projects and issues with the most advanced bug tracking tool.
                </p>
            </div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className='w-full max-w-md rounded-2xl p-8 bg-card text-muted backdrop-blur-xl border border-default shadow-xl'>
                <div className='space-y-4'>
                    <div>
                        <label htmlFor='name' className='block text-xs font-medium text-secondary mb-1'>Full Name</label>
                        <input
                            type="text"
                            className='w-full h-11 rounded-lg px-3 text-sm bg-input border border-default text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary'
                            autoComplete='false'
                            placeholder='Jane Doe'
                            autoCorrect='off'
                            autoCapitalize='true'
                            {...register('name')}
                        />
                        {errors.name && (
                            <p className="text-xs text-danger mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="email" className='block text-xs font-medium text-secondary mb-1'>Email address</label>
                        <input type="email"
                            autoComplete='false'
                            placeholder='name@company.com'
                            className='w-full h-11 rounded-lg px-3 text-sm bg-input border border-default text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary'
                            autoCapitalize='false'
                            autoCorrect='off'
                            {...register('email')}
                        />
                        {errors.email && (
                            <p className="text-xs text-danger mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-secondary mb-1">
                                Password
                            </label>
                        </div>

                        <div>
                            <input type="password" placeholder='••••••••'
                                className='w-full h-11 rounded-lg px-3 text-sm bg-input border border-default text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary'
                                autoComplete='false'
                                autoCapitalize='none'
                                autoCorrect='off'
                                {...register('password')}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-danger mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <button
                        className='mt-6 w-full h-11 rounded-lg bg-primary hover:bg-primary-hover text-black font-medium transition text-sm'
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating account..." : "Create account →"}
                    </button>

                    <div className="flex items-center gap-3 my-4">
                        <div className="h-px flex-1 bg-border-soft" />

                        <span className="text-xs text-tertiary tracking-wider">
                            OR CONTINUE WITH
                        </span>

                        <div className="h-px flex-1 bg-border-soft" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            className="h-10 rounded-lg border border-default flex items-center justify-center gap-2 text-sm text-primary bg-card hover:bg-card-hover transition"
                        >
                            <span className="text-lg">
                                <FcGoogle />
                            </span>
                            Google
                        </button>

                        <button
                            className="h-10 rounded-lg border border-default flex items-center justify-center gap-2 text-sm text-primary bg-card hover:bg-card-hover transition"
                        >
                            <span className="text-lg text-primary">
                                <FaGithub />
                            </span>
                            GitHub
                        </button>
                    </div>

                    <p className="text-center text-sm text-tertiary mt-6">
                        Already have an account?{" "}
                        <a className="text-green font-medium hover:underline" onClick={() => router.push('/login')}>
                            Log in
                        </a>
                    </p>
                </div>
            </form>
        </div>
    )
}
