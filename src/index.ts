import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import tools from './tools/index.js'

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import _ from "underscore"


const server = new McpServer({
	name: "datagov-mcp",
	version: "1.0.0",
	capabilities: {
		resources: {},
		tools: {},
	}
});

tools.register(server)




async function main() {

	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error("datagov.my MCP Server running on stdio");
}

main().catch((error) => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});
