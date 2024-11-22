import { useCord } from "@cord/core/react";
import { ExampleForm } from "@/components/ExampleForm";
import { ParsedView } from "@/components/ParsedView";
import { useState } from "react";

const SENTENCE = "Transfer {0<amount:uint256>} {1<token:address>} {2<id:uint256>} to {3<recipient:address>}";

export const App = () => {
	const [sentence, setSentence] = useState(SENTENCE)

	const {
		state: { parsed, resolvedSentence, error },
		actions: { setValue },
		helpers: { getInputValue },
	} = useCord(sentence);

	return (
		<div className="min-h-screen py-8">
			<div className="max-w-4xl mx-auto px-4">
				<h1 className="text-2xl font-bold mb-8">Cord Playground</h1>

				<input
					className="w-full py-4 border-[1px] border-black/10 px-2"
					type="text"
					value={sentence}
					onChange={e => setSentence(e.target?.value)}
					placeholder="Sentence"
				/>

				{error && (
					<div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
						{error.message}
					</div>
				)}

				<ExampleForm
					parsed={parsed}
					setValue={setValue}
					getInputValue={getInputValue}
				/>
				<ParsedView parsed={parsed} resolvedSentence={resolvedSentence} />
			</div>
		</div>
	);
};
