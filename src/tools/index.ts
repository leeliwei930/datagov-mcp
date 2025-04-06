import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import currencyExchangeTools from "./currencyExchange/index.js"

const register = (server: McpServer) => {
	currencyExchangeTools.forEach((tool) => server.tool(tool.name, tool.description, tool.paramsSchema, tool.cb))
}

export default { register }
