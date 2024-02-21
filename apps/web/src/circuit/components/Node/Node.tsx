/** @jsxImportSource @emotion/react */
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';

import { NODE_POSITION_OFFSET_X } from '../../constants';
import { useHover } from '../../hooks/useHover/useHover';
import { StoreContext } from '../../stores/CanvasStore/CanvasStore';
import { fromCanvasCartesianPoint } from '../../utils/coordinates/coordinates';
import { Port } from '../Port/Port';
import { NodeActionProps, NodePortsProps, NodeProps } from './Node.types';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Circuit } from '@bitspace/circuit';
import { useRouter } from 'next/navigation';
import { moveNode } from '../../../server/mutations/moveNode';
import { removeNode } from '../../../server/mutations/removeNode';

export const Node = observer(({ node, actions, window }: NodeProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const { onMouseEnter, onMouseLeave, isHovered } = useHover();
    const { store } = React.useContext(StoreContext);
    const router = useRouter();

    React.useEffect(() => {
        if (ref.current) {
            store.setNodeElement(node.id, ref.current);

            return () => {
                store.removeNodeElement(node.id);
            };
        }
    }, [ref]);

    const handleOnClick = React.useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!store.selectedNodes?.includes(node)) {
                store.selectNodes([node]);
            }
        },
        [node]
    );

    const handleOnFocus = React.useCallback(() => {
        if (!store.selectedNodes?.includes(node)) {
            store.selectNodes([node]);
        }
    }, [node]);

    const handleOnDrag: DraggableEventHandler = React.useCallback(
        (e, { deltaX, deltaY }) => {
            e.preventDefault();
            e.stopPropagation();

            for (const selectedNode of store.selectedNodes || []) {
                selectedNode.incrementPosition(deltaX, -deltaY);
            }
        },
        [node]
    );

    const handleRemoveNode = React.useCallback(() => {
        node.dispose();

        store.removeNode(node);

        removeNode(node.id);
    }, [node]);

    const handleDoubleClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback(() => {
        if (node instanceof Circuit) {
            router.push(`/circuit/${store.circuit.id}/${node.id}`);
        }
    }, [node, store]);

    const active = store.selectedNodes?.indexOf(node) !== -1;
    const position = node.position || { x: 0, y: 0 };

    const nodeWrapperClassNames = clsx(
        `absolute flex flex-col select-none focus:outline-none w-[260px] bg-[#fcfdff] border-white border rounded-3xl transition-shadow active:shadow-2xl opacity-100`,
        {
            'z-10': !active,
            'z-20': active,
            'shadow-2xl': active
        }
    );

    const nodeHeaderWrapperClassNames = clsx(
        'relative flex flex-row justify-center items-center px-4 pt-4 text-xs font-medium rounded-t-xl handle',
        {
            'text-black': active
        }
    );

    const nodeActionsClassNames = clsx(
        'absolute right-5 top-5 flex flex-row nowrap gap-x-2 align-center transition-opacity',
        {
            'opacity-0': !(isHovered || active),
            'opacity-100': isHovered || active
        }
    );

    const nodeContentWrapperClassNames = clsx(
        `flex flex-row justify-between items-start rounded-b-xl border-b-slate-100`,
        {
            'mt-4': !window
        }
    );

    return (
        <Draggable
            nodeRef={ref}
            position={fromCanvasCartesianPoint(position.x - NODE_POSITION_OFFSET_X, position.y)}
            onDrag={handleOnDrag}
            onStop={e => {
                for (const selectedNode of store.selectedNodes || []) {
                    moveNode(selectedNode.id, { x: selectedNode.position.x, y: selectedNode.position.y });
                }
            }}
        >
            <motion.div
                ref={ref}
                className={nodeWrapperClassNames}
                onClick={handleOnClick}
                onFocus={handleOnFocus}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onDoubleClick={handleDoubleClick}
                tabIndex={0}
                variants={{
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1,
                        transition: {
                            duration: 1.5,
                            ease: [0.75, 0, 0.25, 1]
                        }
                    }
                }}
            >
                <div className={nodeHeaderWrapperClassNames}>
                    {/** @ts-ignore */}
                    <span>{node.constructor.displayName}</span>
                    <div className={nodeActionsClassNames}>
                        <NodeAction color="#ff4444" onClick={handleRemoveNode} />
                    </div>
                </div>
                {window && <div className="m-4">{window}</div>}
                <div className={nodeContentWrapperClassNames}>
                    <NodePorts ports={Object.values(node.inputs)} />
                    <NodePorts ports={Object.values(node.outputs)} isOutputWrapper={true} />
                </div>
            </motion.div>
        </Draggable>
    );
});

const NodeAction = ({ color = '#fff', onClick }: NodeActionProps) => {
    return (
        <div
            className="opacity-100 transition-opacity ml-1.5 w-2 h-2 rounded-md bg-red-400 hover:opactiy-40"
            color={color}
            onClick={onClick}
        />
    );
};

const NodePorts = ({ ports, isOutputWrapper }: NodePortsProps) => {
    const nodePortsWrapperClassNames = clsx(
        'flex flex-col flex-grow px-4 pb-5',
        isOutputWrapper ? 'items-end' : 'items-start'
    );
    return (
        <div className={nodePortsWrapperClassNames}>
            {ports.map(port => (
                <Port key={port.id} port={port} isOutput={!!isOutputWrapper} />
            ))}
        </div>
    );
};

export const NodeWindow = React.forwardRef<HTMLDivElement, React.PropsWithChildren<{ className?: string }>>(
    ({ children, className }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(
                    'relative flex flex-col rounded-3xl overflow-hidden shadow-xl max-h-[226px] h-full',
                    className
                )}
                onMouseDown={e => e.stopPropagation()}
            >
                {children}
            </div>
        );
    }
);
