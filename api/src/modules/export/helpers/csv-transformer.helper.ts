export class CsvTransformerHelper {
	static transformTransactionsToCSV(transactions: any[]) {
		return transactions.map((t) => ({
			Date: CsvTransformerHelper.formatDate(t.date),
			Title: t.title,
			Category: t.category?.title || 'Unknown',
			Account: t.bankAccount?.name || 'Unknown',
			Card: t.card?.name || 'N/A',
			Type: t.type,
			Amount: Number(t.amount).toFixed(2),
		}))
	}

	static formatDate(date: Date): string {
		const d = new Date(date)
		const day = String(d.getDate()).padStart(2, '0')
		const month = String(d.getMonth() + 1).padStart(2, '0')
		const year = d.getFullYear()
		return `${day}/${month}/${year}`
	}
}
