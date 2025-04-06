

export const formatCurrecy = (amount: number, currency: string): string => {
	return Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency
	}).format(amount)
}
