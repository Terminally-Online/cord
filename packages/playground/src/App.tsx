import { useCord } from "@terminallyonline/cord/react";
import { ExampleForm } from "@/components/ExampleForm";
import { ParsedView } from "@/components/ParsedView";
import { useState } from "react";

const SENTENCE =
	"Transfer {0<amount:[(1.1)===721?1:uint256]>} {1<token:address=0x62180042606624f02d8a130da8a3171e9b33894d:uint256=721>} {2<id:[(1.1)>20?uint256:null]>}";

export const App = () => {
	const [sentence, setSentence] = useState(SENTENCE);
	const {
		state: { parsed, resolvedSentence, error, values },
		actions: { setValue },
		helpers: { getInputValue, getInputError, isComplete, isValid },
	} = useCord(sentence);

	return (
		<div className="min-h-screen p-8">
			<div className="mx-auto px-4">
				<h1 className="text-2xl font-bold mb-8">Cord Playground</h1>
				<div className="flex flex-row gap-8">
					<div className="w-1/2">
						<h2 className="text-lg font-semibold mb-2">Sentence</h2>
						<input
							className="w-full py-4 border-[1px] border-black/10 px-2"
							type="text"
							value={sentence}
							onChange={(e) => setSentence(e.target?.value)}
							placeholder="Sentence"
						/>
						<ExampleForm
							parsed={parsed}
							setValue={setValue}
							getInputValue={getInputValue}
							getInputError={getInputError}
						/>
					</div>
					<div className="w-1/2">
						{error && error.type !== "validation" && (
							<>
								<h2 className="text-lg font-semibold mb-2">
									Error
								</h2>
								<div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
									{error.message}
								</div>
							</>
						)}
						<ParsedView
							parsed={parsed}
							resolvedSentence={resolvedSentence}
							values={values}
						/>

						<p>{isComplete ? "Is Complete" : "Is Incomplete"}</p>
						<p>{isValid ? "Is Valid" : "Is Invalid"}</p>
					</div>
				</div>
			</div>
		</div>
	);
};
