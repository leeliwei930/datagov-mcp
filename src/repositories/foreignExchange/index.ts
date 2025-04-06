import z from 'zod'
import _ from 'underscore'

export const ForeignExchangeDataResponseSchema = z.array(
	z.object({
		date: z.string(),
		myr_aed: z.number(),
		myr_aud: z.number(),
		myr_bdt: z.number(),
		myr_brl: z.number(),
		myr_cad: z.number(),
		myr_chf: z.number(),
		myr_eur: z.number(),
		myr_gbp: z.number(),
		myr_hkd: z.number(),
		myr_idr: z.number(),
		myr_inr: z.number(),
		myr_jpy: z.number(),
		myr_krw: z.number(),
		myr_mxn: z.number(),
		myr_php: z.number(),
		myr_rmb: z.number(),
		myr_rub: z.number(),
		myr_sar: z.number(),
		myr_sgd: z.number(),
		myr_thb: z.number(),
		myr_try: z.number(),
		myr_twd: z.number(),
		myr_usd: z.number(),
		myr_vnd: z.number(),
	})
)

export const ForeignExchangeDataSchema = z.object({
	myr_aed: z.number(),
	myr_aud: z.number(),
	myr_bdt: z.number(),
	myr_brl: z.number(),
	myr_cad: z.number(),
	myr_chf: z.number(),
	myr_eur: z.number(),
	myr_gbp: z.number(),
	myr_hkd: z.number(),
	myr_idr: z.number(),
	myr_inr: z.number(),
	myr_jpy: z.number(),
	myr_krw: z.number(),
	myr_mxn: z.number(),
	myr_php: z.number(),
	myr_rmb: z.number(),
	myr_rub: z.number(),
	myr_sar: z.number(),
	myr_sgd: z.number(),
	myr_thb: z.number(),
	myr_try: z.number(),
	myr_twd: z.number(),
	myr_usd: z.number(),
	myr_vnd: z.number(),
})


interface DataStore {
	[key: string]: z.infer<typeof ForeignExchangeDataSchema> | any
}


let dataStore: DataStore = {}

const getExchangeRateData = async (uri: URL): Promise<DataStore> => {
	if (Object.keys(dataStore).length > 0) {
		return dataStore;
	}


	const dataGovExchangeRateResponse = await fetch(uri)
	const dataGovExchangeRateResponseBody = await dataGovExchangeRateResponse.json()
	const parsedResponse = ForeignExchangeDataResponseSchema.parse(dataGovExchangeRateResponseBody)

	_.each(parsedResponse, (dataRecord) => {
		dataStore[dataRecord.date] = ForeignExchangeDataSchema.parse(dataRecord)
	})

	return dataStore
}

export default { getExchangeRateData }
