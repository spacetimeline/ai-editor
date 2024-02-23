import {
    callOrReturn,
    ExtendedRegExpMatchArray,
    InputRule,
    InputRuleFinder,
} from '@tiptap/core';
import { NodeType } from '@tiptap/pm/model';

export function textblockTypeInputRule(config: {
    find: InputRuleFinder;
    type: NodeType;
    getAttributes?:
        | Record<string, any>
        | ((match: ExtendedRegExpMatchArray) => Record<string, any>)
        | false
        | null;
}) {
    return new InputRule({
        find: config.find,
        handler: ({ state, range, match, commands }) => {
            const $start = state.doc.resolve(range.from);
            const attributes =
                callOrReturn(config.getAttributes, undefined, match) || {};

            if (
                !$start
                    .node(-1)
                    .canReplaceWith($start.index(-1), $start.indexAfter(-1), config.type)
            ) {
                return null;
            }

            state.tr
                .delete(range.from, range.to)
                .setBlockType(range.from, range.from, config.type, attributes);

            // invoke focus command
            setTimeout(() => commands.focus(true), 0);
        },
    });
}
