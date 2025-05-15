import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/confirm-password', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                <Head title="Confirm Password" />

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Confirm Password</h2>
                    <p className="text-gray-600 mt-2">
                        This is a secure area of the application. Please confirm your password before continuing.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <PrimaryButton 
                            className="w-full justify-center py-3" 
                            disabled={processing}
                        >
                            {processing ? 'Confirming...' : 'Confirm'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
} 