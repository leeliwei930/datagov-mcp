
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js"
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { z, ZodRawShape } from "zod"
import foreignExchangeRepo from "../../repositories/foreignExchange/index.js";
import { formatCurrecy } from '../../utils/index.js'

interface McpServerTool {
	name: string,
	description: string,
	paramsSchema: ZodRawShape,
	cb: ToolCallback<ZodRawShape>
}


const currencyExchangeToolParams = {
	date: z.string().describe("The date formatted in YYYY-MM-DD"),
	sourceCurrency: z.string().length(3).describe(`The conversion of the source currency, three digits code eg (MYR, SGD, USD)`),
	targetCurrency: z.string().length(3).describe(`The target currency that convert from source currency, three digits code eg (MYR, SGD, USD)`),
	amount: z.number().describe("The given amount in number"),
}

const currencyConverterTool: McpServerTool = {
	name: "currencyConverterTool",
	description: `The tool only convert MYR to foreign currency or foreign currency to MYR`,
	paramsSchema: currencyExchangeToolParams,
	cb: async (cbParams): Promise<CallToolResult> => {


		const paramsSchema = z.object(currencyExchangeToolParams)
		const parsedParams = paramsSchema.parse(cbParams)
		const dataStore = await foreignExchangeRepo.getExchangeRateData(URL.parse("https://api.data.gov.my/data-catalogue/?id=exchangerates")!)



		let result = "";
		const inDayExchangeRateData = dataStore[parsedParams.date]
		if (inDayExchangeRateData == null) {
			result = `Unable to pull exchange rate data on ${parsedParams.date} `
			return {
				content: [
					{
						type: "text",
						text: result,
					}
				]
			}
		}
		let exchangeRate = 0;
		let exchangeKey = "";
		let lookupCurrency = "";
		let conversionType = ""
		let { targetCurrency, sourceCurrency } = parsedParams

		if (targetCurrency.toLowerCase() == 'myr' && sourceCurrency.toLowerCase() == 'myr') {
			exchangeRate = 1
			conversionType = "myrToForeign"
		} else if (sourceCurrency.toLowerCase() != 'myr' && targetCurrency.toLowerCase() == 'myr') {
			lookupCurrency = sourceCurrency.toLowerCase()
			conversionType = "foreignToMyr"

			exchangeKey = `myr_${lookupCurrency}`
			exchangeRate = inDayExchangeRateData[exchangeKey]
		} else {
			lookupCurrency = targetCurrency.toLowerCase()
			conversionType = "myrToForeign"

			exchangeKey = `myr_${lookupCurrency}`
			exchangeRate = inDayExchangeRateData[exchangeKey]
		}


		let convertedAmount = conversionType == "myrToForeign" ? parsedParams.amount * exchangeRate : parsedParams.amount / exchangeRate
		if (exchangeRate == null) {
			result = `Unable to get exchange rate data for ${lookupCurrency} on ${parsedParams.date} `
			return {
				content: [
					{
						type: "text",
						text: result,
					}
				]
			}
		} else {

			let formattedSourceAmount = formatCurrecy(parsedParams.amount, sourceCurrency)
			let formattedConvertedAmount = formatCurrecy(convertedAmount, targetCurrency)

			result = `According on datagov.my currency exchange data, ${formattedSourceAmount} on ${parsedParams.date} is ${formattedConvertedAmount}`

			return {
				content: [
					{
						type: "text",
						text: result,
					}
				]
			}
		}

	}
}


export default [currencyConverterTool]



