import { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

interface Props {
    status?: string;
}

export default function VerifyEmail({ status }: Props) {
    const { post, processing } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                <Head title="Email Verification" />

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Verify Email</h2>
                    <p className="text-gray-600 mt-2">
                        Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another.
                    </p>
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        A new verification link has been sent to the email address you provided during registration.
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <PrimaryButton 
                            className="w-full justify-center py-3" 
                            disabled={processing}
                        >
                            {processing ? 'Sending...' : 'Resend Verification Email'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
} 