'use client'

import { Bug } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { loginAPI } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormValues, loginSchema } from '@/lib/validators/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();

    const { register, handleSubmit, formState: {
        errors, isSubmitting
    } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (values: LoginFormValues) => {
        try {
            const data = await loginAPI(values);
            login(data.token, data.user);
            toast.success("Welcome back 👋");
            router.push('/projects');
        } catch (error) {
            toast.error("Invalid email or password");
        }
    }

    return (
        <div className="min-h-screen min-w-screen bg-main-gradient flex items-center justify-center text-white select-none flex-col px-4">
            <div className="flex flex-col items-center text-center mb-6">
                <div className='h-10 w-10 rounded-full bg-primary-soft flex items-center justify-center mb-3'>
                    <span className='text-primary text-lg'><Bug /></span>
                </div>

                <h1 className='text-xl font-semibold text-primary'>Welcome back to BugTrack Pro</h1>
                <p className="text-sm text-muted mt-1">
                    Sign in to continue managing your projects and issues.
                </p>
            </div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className='w-full max-w-md rounded-2xl p-8 bg-card text-muted backdrop-blur-xl border border-default shadow-xl'>
                <div className='space-y-4'>
                    <div>
                        <label htmlFor="email" className='block text-xs font-medium text-secondary mb-1'>Email address</label>
                        <input type="email"
                            autoComplete='false'
                            placeholder='name@company.com'
                            className='w-full h-11 rounded-lg px-3 text-sm bg-input border border-default text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary'
                            autoCapitalize='false'
                            autoCorrect='off'
                            // onChange={(e) => { setEmail(e.target.value) }}
                            {...register('email')}
                        />
                        {errors.email && (
                            <p className="text-xs text-danger mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-medium text-secondary mb-1">
                                    Password
                                </label>
                                <button className="block text-xs font-medium text-green hover:underline mb-1">
                                    Forgot password?
                                </button>
                            </div>

                            <div>
                                <input type="password" placeholder='••••••••'
                                    className='w-full h-11 rounded-lg px-3 text-sm bg-input border border-default text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary'
                                    autoComplete='false'
                                    autoCapitalize='none'
                                    autoCorrect='off'
                                    // onChange={(e) => { setPassword(e.target.value) }}
                                    {...register('password')}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-danger mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                    </div>

                    <button
                        className='mt-6 w-full h-11 rounded-lg bg-primary hover:bg-primary-hover text-black font-medium transition text-sm'
                        // onClick={handleLogin}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Signing in..." : "Log in to BugTrack Pro →"}
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
                        New to BugTrack?{" "}
                        <a className="text-green font-medium hover:underline" onClick={() => router.push('/signup')}>
                            Create an account
                        </a>
                    </p>
                </div>
            </form>
        </div>
    )
}
