/**
 * Generate API documentation from OpenAPI spec
 * Usage: node scripts/generate-api-docs.js
 */

const fs = require('fs');
const path = require('path');

const OPENAPI_PATH = path.join(__dirname, '..', 'api-docs', 'openapi.yaml');
const OUTPUT_PATH = path.join(__dirname, '..', 'docs', 'api-reference.md');

function formatType(schema) {
    if (!schema) return 'any';
    if (schema.$ref) {
        return schema.$ref.replace('#/components/schemas/', '');
    }
    if (schema.type === 'array' && schema.items) {
        return `${formatType(schema.items)}[]`;
    }
    if (schema.type === 'object' || schema.additionalProperties) {
        return 'object';
    }
    return schema.type || 'any';
}

function formatDescription(description) {
    return description || '';
}

function generateMarkdown(spec) {
    const lines = [];

    lines.push('# API Reference');
    lines.push('');
    lines.push(`> Generated from [openapi.yaml](../api-docs/openapi.yaml)`);
    lines.push('');
    lines.push(`**Version:** ${spec.info.version}`);
    lines.push('');
    lines.push(spec.info.description.replace(/\n/g, '\n\n'));
    lines.push('');
    lines.push('## Servers');
    lines.push('');
    lines.push('| URL | Description |');
    lines.push('|-----|-------------|');
    spec.servers.forEach(server => {
        lines.push(`| \`${server.url}\` | ${server.description || ''} |`);
    });
    lines.push('');

    // Sort paths by method priority: get, post, put, delete
    const methodOrder = { get: 1, post: 2, put: 3, delete: 4, patch: 5 };

    Object.keys(spec.paths).sort().forEach(pathname => {
        const pathItem = spec.paths[pathname];
        const methods = Object.keys(pathItem)
            .filter(m => m !== 'summary' && m !== 'description' && m !== 'parameters' && m !== 'requestBody')
            .sort((a, b) => (methodOrder[a] || 99) - (methodOrder[b] || 99));

        methods.forEach(method => {
            const operation = pathItem[method];
            const upperMethod = method.toUpperCase();

            lines.push(`## ${upperMethod} ${pathname}`);
            lines.push('');
            lines.push(`**${operation.summary}**`);
            lines.push('');
            lines.push(formatDescription(operation.description));
            lines.push('');

            // Parameters
            const params = [
                ...(operation.parameters || []),
                ...(pathItem.parameters || [])
            ];

            if (params.length > 0) {
                lines.push('### Parameters');
                lines.push('');
                lines.push('| Name | In | Type | Required | Description |');
                lines.push('|------|-----|------|----------|-------------|');
                params.forEach(param => {
                    lines.push(`| \`${param.name}\` | ${param.in} | ${formatType(param.schema)} | ${param.required ? 'Yes' : 'No'} | ${formatDescription(param.description)} |`);
                });
                lines.push('');
            }

            // Request Body
            if (operation.requestBody) {
                lines.push('### Request Body');
                lines.push('');
                const content = operation.requestBody.content?.['application/json'];
                if (content?.schema) {
                    const schema = content.schema;
                    lines.push(`\`\`\`json`);
                    lines.push(`{`);
                    if (schema.$ref) {
                        lines.push(`  "$ref": "${schema.$ref}"`);
                    } else if (schema.type === 'object' && schema.properties) {
                        Object.entries(schema.properties).forEach(([key, prop], i, arr) => {
                            const required = schema.required?.includes(key) ? ' // required' : '';
                            lines.push(`  "${key}": ${formatType(prop)}${required}${i < arr.length - 1 ? ',' : ''}`);
                        });
                    }
                    lines.push(`}`);
                    lines.push(`\`\`\``);
                    lines.push('');
                }
            }

            // Responses
            lines.push('### Responses');
            lines.push('');
            Object.entries(operation.responses).forEach(([code, response]) => {
                const description = response.description || '';
                const content = response.content?.['application/json'];
                const schema = content?.schema;

                lines.push(`| \`${code}\` | ${description}`);
                if (schema) {
                    lines.push(`    | Schema: \`${formatType(schema)}\``);
                }
            });
            lines.push('');

            lines.push('---');
            lines.push('');
        });
    });

    // Components
    if (spec.components?.schemas) {
        lines.push('## Schemas');
        lines.push('');
        Object.entries(spec.components.schemas).forEach(([name, schema]) => {
            lines.push(`### ${name}`);
            lines.push('');
            lines.push('```json');
            lines.push('{');

            if (schema.type === 'object' && schema.properties) {
                Object.entries(schema.properties).forEach(([key, prop], i, arr) => {
                    const example = prop.example ? ` // example: ${JSON.stringify(prop.example)}` : '';
                    const optional = schema.required?.includes(key) ? '' : '?';
                    lines.push(`  "${key}${optional}": ${formatType(prop)}${example}${i < arr.length - 1 ? ',' : ''}`);
                });
            }

            lines.push('}');
            lines.push('```');
            lines.push('');
        });
    }

    return lines.join('\n');
}

function main() {
    console.log('Generating API docs...');

    // Read OpenAPI spec
    if (!fs.existsSync(OPENAPI_PATH)) {
        console.error(`Error: OpenAPI spec not found at ${OPENAPI_PATH}`);
        process.exit(1);
    }

    const spec = require('js-yaml').load(fs.readFileSync(OPENAPI_PATH, 'utf8'));

    // Generate Markdown
    const markdown = generateMarkdown(spec);

    // Write output
    fs.writeFileSync(OUTPUT_PATH, markdown, 'utf8');

    console.log(`Generated: ${OUTPUT_PATH}`);
    console.log(`${markdown.split('\n').length} lines`);
}

main();
