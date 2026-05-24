import { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

function App() {
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(false);

	const handleFileUpload = (e) => {
		const file = e.target.files[0];

		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: async (results) => {
				const rows = results.data;

				setLoading(true);

				try {
					const processed = await Promise.all(
						rows.map(async (row) => {
							const res = await axios.post('http://localhost:3001/categorize', {
								description: row.description,
								amount: row.amount,
							});

							return {
								description: row.description,
								amount: row.amount,
								category: res.data.category,
								confidence: res.data.confidence,
								needsReview: res.data.confidence < 0.8,
								reason: res.data.reason,
							};
						}),
					);

					setTransactions(processed);
				} catch (err) {
					console.error(err);
					alert('Error processing CSV');
				}

				setLoading(false);
			},
		});
	};

	return (
		<div style={{ padding: 30 }}>
			<h1>💸 AI Expense Categorizer</h1>

			<input type='file' accept='.csv' onChange={handleFileUpload} />

			{loading && <p>🤖 AI is analyzing your expenses...</p>}

			<table border='1' cellPadding='10' style={{ marginTop: 20 }}>
				<thead>
					<tr>
						<th>Description</th>
						<th>Amount</th>
						<th>Category</th>
						<th>Confidence</th>
						<th>Reason</th>
						<th>Status</th>
					</tr>
				</thead>

				<tbody>
					{transactions.map((t, i) => (
						<tr key={i}>
							<td>{t.description}</td>
							<td>{t.amount}</td>
							<td>
								<select
									value={t.category}
									onChange={(e) => {
										const updated = [...transactions];
										updated[i].category = e.target.value;
										updated[i].needsReview = false;
										setTransactions(updated);
									}}
								>
									{[
										'Food',
										'Transport',
										'Housing',
										'Utilities',
										'Entertainment',
										'Shopping',
										'Software',
										'Healthcare',
										'Other',
									].map((c) => (
										<option key={c} value={c}>
											{c}
										</option>
									))}
								</select>
							</td>
							<td>{t.confidence}</td>
							<td>{t.reason}</td>
							<td>{t.needsReview ? '⚠️ Needs Review' : '✅ Approved'}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default App;
