'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Circuit as CircuitComponent, CanvasStore, StoreContext } from '../../../../circuit';
import { MenuButton } from '../../../../components/Menu/MenuButton/MenuButton';
import { Menu } from '../../../../components/Menu/Menu/Menu';
import { nodeWindowResolver } from '../../../../windows';
import { useHotkeys } from 'react-hotkeys-hook';
import { Journey } from '../../../../components/Onboarding/Journey';
import { PropertyPanel } from '../../../../containers/PropertyPanel/PropertyPanel';
import posthog from 'posthog-js';
import { ExtendedNode, buildCircuit } from '../../../../circuit/utils/circuit/buildCircuit';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Minimap } from '../../../../components/Minimap/Minimap';

export const ClientPage = ({ circuit }: { circuit: ExtendedNode }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    useHotkeys(
        'space',
        e => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(true);

            posthog.capture('Menu invoked from hotkey');
        },
        {
            enabled: !menuOpen
        }
    );

    const onMenuButtonClick = useCallback(() => {
        setMenuOpen(true);

        posthog.capture('Menu invoked from button');
    }, [setMenuOpen]);

    const canvasStore = useMemo(() => {
        if (!circuit) return;

        const c = buildCircuit(circuit);

        if (!c) {
            return;
        }

        const store = new CanvasStore(c);

        return store;
    }, [circuit, buildCircuit]);

    if (!canvasStore) return <></>;

    return (
        <main className="flex flex-row items-stretch h-full w-full gap-x-8">
            <StoreContext.Provider value={{ store: canvasStore }}>
                <div className="relative flex flex-col justify-between h-full w-full cursor-[url('/cursor.svg')_4_4,auto]">
                    <motion.div
                        className="flex flex-row justify-center items-center w-full absolute h-24 top-0 left-0 right-0 z-10"
                        variants={{
                            initial: { opacity: 0 },
                            animate: { opacity: 1, transition: { duration: 1, delay: 1 } }
                        }}
                    >
                        <Link href="/">
                            <h3 className="text-xl">Bitspace</h3>
                        </Link>
                    </motion.div>
                    <CircuitComponent store={canvasStore} nodeWindowResolver={nodeWindowResolver} />
                    {menuOpen && <Menu onClose={() => setMenuOpen(false)} />}
                    {/** <Minimap className="fixed right-12 bottom-20" /> */}
                    <div className="absolute left-1/2 bottom-12 -translate-x-1/2 flex flex-row justify-center">
                        {<MenuButton onClick={onMenuButtonClick} animate={menuOpen} />}
                    </div>
                    <Journey
                        persistenceKey="onboarding-complete"
                        steps={[
                            {
                                title: 'Welcome to Bitspace',
                                description: `A visual programming environment for creative endeavours. Let's go through the basics.`
                            },
                            {
                                title: 'Circuits',
                                description:
                                    'This canvas is known as a Circuit. It contains nodes & connections - the building blocks of Bitspace.'
                            },
                            {
                                title: 'Nodes',
                                description: 'Isolated blocks of computation, operating on inputs to produce outputs.'
                            },
                            {
                                title: 'Connections',
                                description:
                                    'These are used to link data between different nodes. Connections may only be established between outputs & inputs'
                            }
                        ]}
                    />
                    <PropertyPanel className="absolute top-24 right-12 bg-slate-50 h-fit p-8 rounded-[2rem] shadow-2xl" />
                </div>
            </StoreContext.Provider>
        </main>
    );
};
