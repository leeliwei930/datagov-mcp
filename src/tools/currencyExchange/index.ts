
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js"
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { z, ZodRawShape } from "zod"
import foreignExchangeRepo from "../../repositories/foreignExchange/index.js"
import { formatCurrecy } from '../../utils/index.js'
import _ from 'underscore'

interface McpServerTool {
	name: string,
	description: string,
	paramsSchema: ZodRawShape,
	cb: ToolCallback<ZodRawShape>
}


const currencyExchangeToolParams = {
	date: z.string().describe("Date in YYYY-MM-DD format used to query getMYRToForeignCurrencyByDate resource"),
	sourceCurrency: z.string().length(3).describe(`Three-letter currency code of the source currency (e.g., MYR, SGD, USD)`),
	targetCurrency: z.string().length(3).describe(`Three-letter currency code of the target currency for conversion (e.g., MYR, SGD, USD)`),
	amount: z.number().describe("Amount to convert"),
}

const currencyConverterTool: McpServerTool = {
	name: "currencyConverterTool",
	description: `The tool only convert MYR to foreign currency or foreign currency to MYR`,
	paramsSchema: currencyExchangeToolParams,
	cb: async (cbParams): Promise<CallToolResult> => {


		const paramsSchema = z.object(currencyExchangeToolParams)
		const parsedParams = paramsSchema.parse(cbParams)


		const inDayExchangeRateData = await foreignExchangeRepo.getExchangeRateDataByDate(parsedParams.date);

		let result = "";
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
			exchangeRate = _.get(inDayExchangeRateData, exchangeKey)!
		} else {
			lookupCurrency = targetCurrency.toLowerCase()
			conversionType = "myrToForeign"

			exchangeKey = `myr_${lookupCurrency}`
			exchangeRate = _.get(inDayExchangeRateData, exchangeKey)!
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
					},
					{
						type: "text",
						text: `Exchange rate of ${exchangeKey}, ${exchangeRate}`
					}
				]
			}
		}

	}
}


export default [currencyConverterTool]



