import { useCord } from "@cord/core/react";
import { ExampleForm } from "@/components/ExampleForm";
import { ParsedView } from "@/components/ParsedView";

// This is the sentence we are working towards:
// Transfer {0<amount:[if:1|1=721:1:else:uint256]=1>} {1<token:address>|:} {2<id:uint256>} to {3<recipient:address>}.

const SENTENCE = "Transfer {0<amount>} {1<token>} {2<id>} to {3<recipient>}";

export const App = () => {
    const {
        state: { parsed, resolvedSentence, error },
        actions: { setValue },
        helpers: { getInputValue },
    } = useCord(SENTENCE);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-8">Cord Playground</h1>

                {resolvedSentence}

                {error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
                        {error.message}
                    </div>
                ) : (
                    <>
                        <ExampleForm
                            parsed={parsed}
                            setValue={setValue}
                            getInputValue={getInputValue}
                        />
                        <ParsedView
                            parsed={parsed}
                            resolvedSentence={resolvedSentence}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
