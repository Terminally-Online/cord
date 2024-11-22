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
		<div className="min-h-screen p-8">
			<div className="mx-auto px-4">
				<h1 className="text-2xl font-bold mb-8">Cord Playground</h1>

				<div className="flex flex-row gap-8">
					<div className="w-full">
						<h2 className="text-lg font-semibold mb-2">Sentence</h2>
						<input
							className="w-full py-4 border-[1px] border-black/10 px-2"
							type="text"
							value={sentence}
							onChange={e => setSentence(e.target?.value)}
							placeholder="Sentence"
						/>


						<ExampleForm
							parsed={parsed}
							setValue={setValue}
							getInputValue={getInputValue}
						/>
					</div>
					<div className="w-full">
						{error && (
							<>
								<h2 className="text-lg font-semibold mb-2">Error</h2>
								<div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
									{error.message}
								</div>
							</>
						)}

						<ParsedView parsed={parsed} resolvedSentence={resolvedSentence} />
					</div>
				</div>
			</div>
		</div>
	);
};
