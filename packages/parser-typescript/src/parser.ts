/**
 * @fileoverview webhint parser needed to analyze TypeScript files.
 */
import { parse, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import { debug as d } from '@hint/utils/dist/src/debug';
import { Parser } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';
import { Node, ScriptEvents } from '@hint/parser-javascript';
import { base, combineWalk } from '@hint/parser-javascript/dist/src/walk';

const debug = d(__filename);

// Extend `walk` to skip over TS-specific nodes.
for (const type of Object.keys(AST_NODE_TYPES)) {
    if (type.startsWith('TS') && !base[type]) {
        base[type] = base.Identifier;
    }
}

export default class TypeScriptParser extends Parser<ScriptEvents> {

    public constructor(engine: Engine<ScriptEvents>) {
        super(engine, 'typescript');

        engine.on('fetch::end::unknown', async ({ resource, response }) => {
            if (!resource.endsWith('.ts') && !resource.endsWith('.tsx')) {
                return;
            }

            debug(`Parsing TypeScript file: ${resource}`);

            const sourceCode = response.body.content;
            const jsx = resource.endsWith('.tsx');

            try {
                await engine.emitAsync('parse::start::javascript', { resource });

                const result = parse(sourceCode, { jsx, loc: true, useJSXTextNode: jsx });

                await combineWalk(async (walk) => {
                    await engine.emitAsync('parse::end::javascript', {
                        ast: result as Node,
                        element: null,
                        resource,
                        sourceCode,
                        tokens: result.tokens as any,
                        walk
                    });
                });

            } catch (err) {
                debug(`Error parsing TypeScript code (${err}): ${sourceCode}`);
            }
        });
    }
}
