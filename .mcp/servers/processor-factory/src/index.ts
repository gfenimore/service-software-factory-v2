#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

// Create server instance
const server = new Server(
  {
    name: 'processor-factory',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'run_processor',
        description: 'Execute a processor and track its execution',
        inputSchema: {
          type: 'object',
          properties: {
            processor: { 
              type: 'string', 
              enum: ['TYPE-PROCESSOR', 'SCAFFOLD-PROCESSOR', 'TEST-PROCESSOR',
                     'REACT-PROCESSOR', 'MODIFY-PROCESSOR', 'API-PROCESSOR'],
              description: 'Processor to run'
            },
            input: { type: 'string', description: 'Input file path' },
            output: { type: 'string', description: 'Output file path' },
            sessionId: { type: 'string', description: 'Optional session ID' }
          },
          required: ['processor', 'input', 'output']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request: any) => {
  if (request.params.name === 'run_processor') {
    const args = request.params.arguments;
    
    console.error(`Running ${args.processor} on ${args.input} -> ${args.output}`);
    
    // Get project root (4 levels up from .mcp/servers/processor-factory/dist/)
    const projectRoot = path.resolve(process.cwd(), '../../../..');
    const scriptPath = path.join(projectRoot, 'invoke-processor.sh');
    
    try {
      const { stdout, stderr } = await execAsync(
        `bash "${scriptPath}" "${args.processor}" "${args.input}" "${args.output}"`,
        { cwd: projectRoot }
      );
      
      // Check if output file was created
      const outputPath = path.join(projectRoot, args.output);
      await fs.access(outputPath);
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ ${args.processor} completed successfully!\nOutput: ${args.output}\n\n${stdout}`
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ ${args.processor} failed!\nError: ${error.message}\n\nStderr: ${error.stderr || ''}`
          }
        ]
      };
    }
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Processor Factory MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
