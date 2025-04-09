'use client';

import { verifyOTPAction } from '@/actions/verifyOTP';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@bitspace/ui/button';
import { cn } from '@bitspace/ui/cn';
import { Form, FormControl, FormField, FormItem } from '@bitspace/ui/form';
import { Input } from '@bitspace/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@bitspace/ui/input-otp';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createClient } from '@/supabase/browser';
import { Spinner } from '@/components/Spinner/Spinner';

const formSchema = z.object({
    value: z.string().min(1)
});

export default function Page() {
    const [isSent, setSent] = useState(false);
    const [email, setEmail] = useState('');

    return (
        <div className="flex flex-col justify-center items-center h-screen w-screen">
            <div className="flex flex-col w-80 gap-y-12">
                <div className="flex flex-col gap-y-2">
                    <h2 className="text-2xl font-medium">
                        Welcome to Bitspace
                    </h2>
                    {isSent ? (
                        <p className="text-lg text-gray-500">
                            Check your email for a 6-digit code
                        </p>
                    ) : (
                        <p className="text-lg text-gray-500">
                            A new era of creative computing for everyone
                        </p>
                    )}
                </div>
                <div className="flex flex-col">
                    {isSent ? (
                        <VerifyOTPForm email={email} />
                    ) : (
                        <LoginForm setEmail={setEmail} setSent={setSent} />
                    )}
                </div>
            </div>
        </div>
    );
}

interface LoginFormProps {
    setEmail: (email: string) => void;
    setSent: (sent: boolean) => void;
}

const LoginForm = ({ setEmail, setSent }: LoginFormProps) => {
    const [isLoading, setLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: ''
        }
    });

    const publicUrl = process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';

    async function onSubmit({ value }: z.infer<typeof formSchema>) {
        setLoading(true);

        setEmail(value);

        const { error } = await supabase.auth.signInWithOtp({
            email: value,
            options: {
                emailRedirectTo: `${publicUrl}/dashboard`
            }
        });

        if (!error) {
            setSent(true);
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className={cn('flex flex-col space-y-4')}>
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        className="w-full"
                                        placeholder="Email"
                                        {...field}
                                        autoCapitalize="false"
                                        autoCorrect="false"
                                        spellCheck="false"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button type="submit">
                        {isLoading ? (
                            <Spinner className="h-4 w-4" />
                        ) : (
                            <span>Continue</span>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

interface VerifyOTPFormProps {
    email: string;
}

const VerifyOTPForm = ({ email }: VerifyOTPFormProps) => {
    const verifyOtp = useAction(verifyOTPAction);

    async function onComplete(token: string) {
        verifyOtp.execute({
            type: 'email',
            token,
            email
        });
    }

    return (
        <div className={cn('flex flex-col space-y-4 items-center')}>
            <InputOTP
                maxLength={6}
                onComplete={onComplete}
                disabled={verifyOtp.status === 'executing'}
                render={({ slots }) => (
                    <InputOTPGroup>
                        {slots.map((slot, index) => (
                            <InputOTPSlot
                                key={index.toString()}
                                {...slot}
                                className="w-[52px] h-[52px] first:rounded-l-xl last:rounded-r-xl"
                            />
                        ))}
                    </InputOTPGroup>
                )}
            />
        </div>
    );
};
