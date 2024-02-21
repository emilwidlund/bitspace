import { Input, Output } from '@bitspace/circuit';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { ChangeEventHandler, FocusEventHandler, KeyboardEventHandler, useCallback, useEffect, useState } from 'react';

export interface StringControlProps {
    port: Input<number> | Output<number>;
    disabled?: boolean;
    onBlur?: (value: any) => void;
}

export const StringControl = observer(({ port, disabled, onBlur }: StringControlProps) => {
    const [value, setValue] = useState<any>();

    useEffect(() => {
        const subscription = port.subscribe(value => {
            setValue(value);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [port]);

    const handleKeydown: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(e => {
        e.stopPropagation();
    }, []);

    const handleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
        e => {
            if (port.type.name === 'String') {
                const value = port.type.validator.parse(e.target.value);
                setValue(value);
            }
        },
        [port, setValue]
    );

    const handleBlur: FocusEventHandler<HTMLTextAreaElement> = useCallback(
        e => {
            if (port.type.name === 'String') {
                const value = port.type.validator.parse(e.target.value);

                port.next(value);
                onBlur?.(value);
            }
        },
        [onBlur]
    );

    return (
        <textarea
            className={clsx('px-3 py-2 rounded-xl w-full shadow-sm border border-slate-100 min-h-24', {
                'text-slate-400': disabled
            })}
            placeholder={port.type.name}
            onKeyDown={handleKeydown}
            value={value}
            disabled={disabled}
            onChange={handleChange}
            onBlur={handleBlur}
        />
    );
});
