import { ParsedCordSentence } from "@cord/core";

type ExampleFormProps = {
    parsed: ParsedCordSentence | null;
    setValue: (index: number, value: string) => void;
    getInputValue: (index: number) => string | undefined;
};

export const ExampleForm = ({
    parsed,
    setValue,
    getInputValue,
}: ExampleFormProps) => {
    if (!parsed) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm my-6">
            <h2 className="text-lg font-semibold mb-2">Input Values</h2>
            <div className="space-y-4">
                {parsed.inputs.map((input) => (
                    <div key={input.index} className="flex items-center gap-4">
                        <label className="w-24 font-mono text-sm">
                            {input.name ?? `Input #${input.index}`}
                            {input.delimiter && (
                                <span className="text-gray-500 ml-1">
                                    (:{input.delimiter})
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={getInputValue(input.index) || ""}
                            onChange={(e) =>
                                setValue(input.index, e.target.value)
                            }
                            className="flex-1 p-2 border rounded-md"
                            placeholder={`Value for input ${input.index}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
