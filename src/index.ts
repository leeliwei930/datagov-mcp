import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import tools from './tools/index.js'

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import _ from "underscore"
import foreignExchangeRepo from "./repositories/foreignExchange/index.js";

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
	await foreignExchangeRepo.getExchangeRateData(URL.parse("https://api.data.gov.my/data-catalogue/?id=exchangerates")!)

	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error("datagov.my MCP Server running on stdio");
}

main().catch((error) => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});
