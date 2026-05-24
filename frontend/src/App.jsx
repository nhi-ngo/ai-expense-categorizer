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
					</tr>
				</thead>

				<tbody>
					{transactions.map((t, i) => (
						<tr key={i}>
							<td>{t.description}</td>
							<td>{t.amount}</td>
							<td>{t.category}</td>
							<td>{t.confidence}</td>
							<td>{t.reason}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default App;
