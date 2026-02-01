const fs = require('fs');
const yaml = require('yaml');

// Read the Swagger 2.0 spec (regenerate first)
const { execSync } = require('child_process');
execSync('npx tsoa spec 2>&1 | tail -1', { stdio: 'inherit' });

const swagger = JSON.parse(fs.readFileSync('src/generated/openapi.json', 'utf8'));

// Helper functions
function convertRefs(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertRefs);
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string') {
      result[key] = value.replace('#/definitions/', '#/components/schemas/');
    } else {
      result[key] = convertRefs(value);
    }
  }
  return result;
}

function convertResponses(responses) {
  const result = {};
  for (const [code, resp] of Object.entries(responses)) {
    result[code] = { description: resp.description || '', content: {} };
    if (resp.schema) {
      result[code].content['application/json'] = { schema: convertRefs(resp.schema) };
    }
  }
  return result;
}

const paths = {};
for (const [path, pathItem] of Object.entries(swagger.paths || {})) {
  paths[path] = {};
  for (const [method, operation] of Object.entries(pathItem)) {
    if (method === 'parameters' || method === '$ref') {
      paths[path][method] = operation;
      continue;
    }
    const bodyParams = (operation.parameters || []).filter(p => p.in === 'body');
    paths[path][method] = {
      operationId: operation.operationId,
      description: operation.description || '',
      parameters: (operation.parameters || []).filter(p => p.in !== 'body').map(convertRefs),
      responses: convertResponses(operation.responses),
      security: operation.security || [],
      tags: operation.tags || []
    };
    if (bodyParams.length > 0) {
      paths[path][method].requestBody = {
        content: {
          'application/json': {
            schema: convertRefs(bodyParams[0].schema)
          }
        }
      };
    }
  }
}

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'BHXH Proxy API',
    version: '1.0.0',
    description: 'Vietnam Social Insurance API Proxy - Headless browser service for BHXH'
  },
  servers: [{ url: '/' }],
  paths,
  components: {
    schemas: swagger.definitions || {}
  }
};

fs.writeFileSync('src/generated/openapi.json', JSON.stringify(openapi, null, 2));
fs.writeFileSync('src/generated/openapi.yaml', yaml.stringify(openapi));
console.log('Converted to OpenAPI 3.0.3 with', Object.keys(openapi.components.schemas).length, 'schemas');
