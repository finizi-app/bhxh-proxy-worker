const fs = require('fs');
const yaml = require('yaml');

const { execSync } = require('child_process');
execSync('npx tsoa spec 2>&1 | tail -1', { stdio: 'inherit' });

// Read swagger.json which has the raw Swagger 2.0 output from tsoa
const swagger = JSON.parse(fs.readFileSync('src/generated/swagger.json', 'utf8'));

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
    const converted = { description: resp.description || '', content: {} };
    if (resp.schema) {
      converted.content['application/json'] = { schema: convertRefs(resp.schema) };
    }
    // Also convert any $ref in response content (if already in OpenAPI 3.0 format)
    if (resp.content) {
      converted.content = {};
      for (const [contentType, content] of Object.entries(resp.content)) {
        converted.content[contentType] = convertRefs(content);
      }
    }
    result[code] = converted;
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
    const queryParams = (operation.parameters || []).filter(p => p.in === 'query' && p.name !== 'username' && p.name !== 'password');

    // Build operation object
    const operationData = {
      operationId: operation.operationId,
      description: operation.description || '',
      parameters: queryParams.map(convertRefs),
      responses: convertResponses(operation.responses),
      security: [{ api_key: [] }], // Always require API key
      tags: operation.tags || []
    };

    // Add username/password security requirements if endpoint has these params
    const hasUsername = operation.parameters && operation.parameters.some(p => p.name === 'username');
    const hasPassword = operation.parameters && operation.parameters.some(p => p.name === 'password');

    if (hasUsername && hasPassword) {
      operationData.security.push(
        { bhxh_username: [] },
        { bhxh_password: [] }
      );
    }

    // Add headers separately (not in parameters array)
    if (operation.parameters && operation.parameters.some(p => p.name === 'username')) {
      operationData.headers = {
        'X-Username': {
          description: 'BHXH username for authentication',
          required: false,
          schema: { type: 'string' }
        }
      };
    }

    if (operation.parameters && operation.parameters.some(p => p.name === 'password')) {
      if (!operationData.headers) operationData.headers = {};
      operationData.headers['X-Password'] = {
        description: 'BHXH password for authentication',
        required: false,
        schema: { type: 'string' }
      };
    }

    if (bodyParams.length > 0) {
      operationData.requestBody = {
        content: {
          'application/json': {
            schema: convertRefs(bodyParams[0].schema)
          }
        }
      };
    }

    paths[path][method] = operationData;
  }
}

// Build components with schemas and security schemes
const components = {
  schemas: swagger.definitions || {}
};

// Build security schemes - add X-Username and X-Password for Swagger UI
const securitySchemes = swagger.securityDefinitions ? { ...swagger.securityDefinitions } : {};

// Add username and password as security schemes so they appear in Authorize button
securitySchemes.bhxh_username = {
  type: 'apiKey',
  name: 'X-Username',
  description: 'BHXH username for authentication',
  in: 'header'
};

securitySchemes.bhxh_password = {
  type: 'apiKey',
  name: 'X-Password',
  description: 'BHXH password for authentication',
  in: 'header'
};

components.securitySchemes = securitySchemes;

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'BHXH Proxy API',
    version: '1.0.0',
    description: 'Vietnam Social Insurance API Proxy - Headless browser service for BHXH'
  },
  servers: [{ url: '/' }],
  paths,
  components
};

// Convert all $ref from #/definitions/ to #/components/schemas/ in entire spec
function convertAllRefs(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertAllRefs);

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string') {
      result[key] = value.replace('#/definitions/', '#/components/schemas/');
    } else {
      result[key] = convertAllRefs(value);
    }
  }
  return result;
}

const finalSpec = convertAllRefs(openapi);

fs.writeFileSync('src/generated/openapi.json', JSON.stringify(finalSpec, null, 2));
fs.writeFileSync('src/generated/openapi.yaml', yaml.stringify(finalSpec));
console.log('Converted to OpenAPI 3.0.3 with', Object.keys(finalSpec.components.schemas).length, 'schemas');
