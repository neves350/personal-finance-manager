import PDFDocument from 'pdfkit'

interface TransactionRow {
	date: Date
	title: string
	category?: { title: string } | null
	bankAccount?: { name: string } | null
	card?: { name: string } | null
	type: string
	amount: { toNumber(): number }
}

const COLUMNS = [
	{ label: 'Date', width: 70, align: 'left' as const },
	{ label: 'Title', width: 120, align: 'left' as const },
	{ label: 'Category', width: 80, align: 'left' as const },
	{ label: 'Account', width: 80, align: 'left' as const },
	{ label: 'Card', width: 70, align: 'left' as const },
	{ label: 'Type', width: 60, align: 'left' as const },
	{ label: 'Amount', width: 70, align: 'right' as const },
]

const COLORS = {
	header: '#1a1a2e',
	headerText: '#ffffff',
	zebraLight: '#ffffff',
	zebraDark: '#f3f4f6',
	income: '#16a34a',
	expense: '#dc2626',
}

export class PdfGeneratorHelper {
	static async generateTransactionsPdf(
		transactions: TransactionRow[],
		dateRange?: { startDate?: string; endDate?: string },
	): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const doc = new PDFDocument({
				size: 'A4',
				layout: 'landscape',
				margin: 40,
			})

			const chunks: Buffer[] = []
			doc.on('data', (chunk) => chunks.push(chunk))
			doc.on('end', () => resolve(Buffer.concat(chunks)))
			doc.on('error', reject)

			PdfGeneratorHelper.drawHeader(doc, dateRange)
			PdfGeneratorHelper.drawTable(doc, transactions)
			PdfGeneratorHelper.drawSummary(doc, transactions)

			doc.end()
		})
	}

	private static drawHeader(
		doc: PDFKit.PDFDocument,
		dateRange?: { startDate?: string; endDate?: string },
	) {
		doc
			.fontSize(20)
			.font('Helvetica-Bold')
			.text('Transactions Report', { align: 'center' })

		if (dateRange?.startDate || dateRange?.endDate) {
			const from = dateRange.startDate || '...'
			const to = dateRange.endDate || '...'

			doc
				.fontSize(10)
				.font('Helvetica')
				.text(`Period: ${from} to ${to}`, { align: 'center' })
		}

		doc.moveDown(1.5)
	}

	private static drawTable(
		doc: PDFKit.PDFDocument,
		transactions: TransactionRow[],
	) {
		const startX = doc.page.margins.left
		const tableWidth = COLUMNS.reduce((sum, col) => sum + col.width, 0)
		let y = doc.y

		// table header
		doc.rect(startX, y, tableWidth, 20).fill(COLORS.header)

		let x = startX
		doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.headerText)

		for (const col of COLUMNS) {
			doc.text(col.label, x + 4, y + 5, {
				width: col.width - 8,
				align: col.align,
			})
			x += col.width
		}

		y += 20

		// table rows
		doc.font('Helvetica').fontSize(7).fillColor('#000000')

		for (let i = 0; i < transactions.length; i++) {
			if (y + 18 > doc.page.height - doc.page.margins.bottom - 60) {
				doc.addPage()
				y = doc.page.margins.top
			}

			const bgColor = i % 2 === 0 ? COLORS.zebraLight : COLORS.zebraDark
			doc.rect(startX, y, tableWidth, 18).fill(bgColor)

			const t = transactions[i]
			const row = [
				PdfGeneratorHelper.formatDate(t.date),
				t.title,
				t.category?.title || 'Unknown',
				t.bankAccount?.name || 'Unknown',
				t.card?.name || 'N/A',
				t.type,
				t.amount.toNumber().toFixed(2),
			]

			x = startX
			for (let j = 0; j < COLUMNS.length; j++) {
				const isAmount = j === COLUMNS.length - 1
				const color = isAmount
					? t.type === 'INCOME'
						? COLORS.income
						: COLORS.expense
					: '#000000'

				doc.fillColor(color).text(row[j], x + 4, y + 5, {
					width: COLUMNS[j].width - 8,
					align: COLUMNS[j].align,
				})
				x += COLUMNS[j].width
			}

			y += 18
		}

		doc.y = y
	}

	private static drawSummary(
		doc: PDFKit.PDFDocument,
		transactions: TransactionRow[],
	) {
		let totalIncome = 0
		let totalExpense = 0

		for (const t of transactions) {
			const amount = t.amount.toNumber()
			if (t.type === 'INCOME') {
				totalIncome += amount
			} else {
				totalExpense += amount
			}
		}

		const netBalance = totalIncome - totalExpense

		doc.moveDown(1)

		const startX = doc.page.margins.left

		doc
			.fontSize(10)
			.font('Helvetica-Bold')
			.fillColor('#000000')
			.text('Summary', startX, doc.y)

		doc.moveDown(0.5)
		doc
			.fontSize(9)
			.font('Helvetica')
			.fillColor(COLORS.income)
			.text(`Total Income: ${totalIncome.toFixed(2)}`, startX, doc.y)

		doc
			.fillColor(COLORS.expense)
			.text(`Total Expenses: ${totalExpense.toFixed(2)}`, startX, doc.y)

		const balanceColor = netBalance >= 0 ? COLORS.income : COLORS.expense
		doc
			.font('Helvetica-Bold')
			.fillColor(balanceColor)
			.text(`Net Balance: ${netBalance.toFixed(2)}`, startX, doc.y)
	}

	private static formatDate(date: Date): string {
		const d = new Date(date)
		const day = String(d.getDate()).padStart(2, '0')
		const month = String(d.getMonth() + 1).padStart(2, '0')
		const year = d.getFullYear()
		return `${day}/${month}/${year}`
	}
}
