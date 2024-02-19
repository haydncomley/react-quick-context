import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import React, { createContext, useContext, useMemo, useState } from 'react';

export const createCtx = <T, >(defaultValue: T) => {
    type UpdateType = Dispatch<SetStateAction<typeof defaultValue>>;
    type PartialUpdateType = Dispatch<SetStateAction<Partial<typeof defaultValue>>>;

    const defaultUpdate: UpdateType = () => defaultValue;
    const partialUpdate: PartialUpdateType = () => defaultValue;

    const ctx = createContext({
        set: defaultUpdate,
        state: defaultValue,
        update: partialUpdate,
    });

    const Provider = (props: PropsWithChildren<unknown>) => {
        const [ state, setState ] = useState(defaultValue);
        return (
            <ctx.Provider
                {...props}
                value={{
                    set: setState,
                    state,
                    update: (partialState) => setState(typeof partialState === 'object' ? {
                        ...state,
                        ...partialState,
                    } as T : partialState as T),
                }} />
        );
    };

    function useCtx() {
        const c = useContext(ctx);
        if (c === undefined)
            throw new Error('useCtx must be inside a Provider with a value');
        return [ c.state, { set: c.set, update: c.update } ] as const;
    }

    return [ useCtx, Provider ] as const;
};

export const Providers = ({
    providers,
    children,
}: PropsWithChildren<{ providers: ((props: PropsWithChildren<unknown>) => React.Element)[] }>) => {
    const RootProvider = useMemo(() => {
        return ({ children }: PropsWithChildren<unknown>) => providers.reduce((Acc, Provider) => {
            return (
                <Provider>
                    {Acc}
                </Provider>
            );
        // eslint-disable-next-line react/jsx-no-useless-fragment
        }, <>{children}</>);
    }, []);

    return <RootProvider>{children}</RootProvider>;
};

