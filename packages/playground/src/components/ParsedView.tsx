import { ParsedCordSentence } from "@cord/core";

type ParsedViewProps = {
    parsed: ParsedCordSentence | null;
    resolvedSentence: string | null;
};

export const ParsedView = ({ parsed, resolvedSentence }: ParsedViewProps) => {
    if (!parsed) return null;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Parsed Structure</h2>
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
                    {JSON.stringify(parsed, null, 2)}
                </pre>
            </div>

            {resolvedSentence && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">
                        Resolved Sentence
                    </h2>
                    <div className="bg-green-50 p-4 rounded-md text-green-700">
                        {resolvedSentence}
                    </div>
                </div>
            )}
        </div>
    );
};
