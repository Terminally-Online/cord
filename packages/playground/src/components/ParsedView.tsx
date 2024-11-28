import { InputValues, ParsedCordSentence } from "@terminallyonline/cord";

type ParsedViewProps = {
	parsed: ParsedCordSentence | null;
	resolvedSentence: string | null;
	values: InputValues;
};

export const ParsedView = ({
	parsed,
	resolvedSentence,
	values,
}: ParsedViewProps) => {
	if (!parsed) return null;

	return (
		<div className="space-y-6">
			{resolvedSentence && (
				<div className="bg-white rounded-lg shadow-sm">
					<h2 className="text-lg font-semibold mb-2">
						Resolved Sentence
					</h2>
					<div className="bg-green-50 p-4 rounded-md text-green-700">
						{resolvedSentence}
					</div>
				</div>
			)}

			<div className="bg-white rounded-lg shadow-sm">
				<h2 className="text-lg font-semibold mb-2">Parsed Structure</h2>
				<pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
					{JSON.stringify(
						{
							...parsed,
							values: Object.fromEntries(values),
						},
						null,
						2,
					)}
				</pre>
			</div>
		</div>
	);
};
