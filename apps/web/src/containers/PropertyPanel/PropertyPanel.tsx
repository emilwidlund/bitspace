import { observer } from 'mobx-react-lite';
import { ComponentProps, useContext, useMemo } from 'react';
import { Control } from '../../components/Controls/Control/Control';
import { StoreContext } from '../../circuit';
import clsx from 'clsx';
import { updateInput } from '../../server/mutations/updateInput';
import { NodeDescriptionsMap } from '../../nodes/descriptions';
import { NodeType } from '@prisma/client';
import { nodeWindowResolver } from '../../windows';

export const PropertyPanel = observer(({ className, ...props }: ComponentProps<'div'>) => {
    const { store } = useContext(StoreContext);
    const selectedNode = store.selectedNodes[0];

    const inputs = useMemo(() => Object.values(selectedNode?.inputs ?? {}), [selectedNode]);
    const outputs = useMemo(() => Object.values(selectedNode?.outputs ?? {}), [selectedNode]);

    if (!selectedNode) {
        return null;
    }

    const window = nodeWindowResolver?.(selectedNode);

    return (
        <div className={clsx('flex flex-col gap-y-8 w-72 py-8', className)} {...props}>
            <div className="flex flex-col gap-y-2">
                <h2 className="font-semibold">{selectedNode.name}</h2>
                <p className="text-sm text-slate-500 leading-relaxed text-pretty">
                    {NodeDescriptionsMap[selectedNode.type as NodeType]}
                </p>
            </div>
            {window && <div>{window}</div>}
            {inputs.length > 0 && (
                <div className="flex flex-col gap-y-4">
                    <h4 className="font-medium">Inputs</h4>
                    <div className="flex flex-col gap-y-4">
                        {inputs.map(input => (
                            <div key={input.id} className="flex flex-col gap-y-2 text-sm">
                                <h3 className="font-medium w-full text-slate-700">{input.name}</h3>
                                <Control
                                    port={input}
                                    disabled={input.connected}
                                    onBlur={value => updateInput(input.id, value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {outputs.length > 0 && (
                <div className="flex flex-col gap-y-4">
                    <h4 className="font-medium">Outputs</h4>
                    <div className="flex flex-col gap-y-4">
                        {outputs.map(output => (
                            <div key={output.id} className="flex flex-col gap-y-2 text-sm">
                                <h3 className="font-medium w-full text-slate-700">{output.name}</h3>
                                <Control port={output} disabled />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
