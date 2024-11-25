import { InputType, ParsedCordSentence } from "@cord/core";

type ExampleFormProps = {
    parsed: ParsedCordSentence | null;
    setValue: (index: number, value: string) => void;
    getInputValue: (index: number) => string | undefined;
    getInputError: (index: number) => ValidationError | undefined;
};

export const ExampleForm = ({
    parsed,
    setValue,
    getInputValue,
    getInputError,
}: ExampleFormProps) => {
    if (!parsed) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm my-6">
            <h2 className="text-lg font-semibold mb-2">Input Values</h2>
            <div className="space-y-4">
                {parsed.inputs.map((input) => {
                    const value = getInputValue(input.index);
                    const error = getInputError(input.index);
                    const hasValue = value !== undefined;

                    return (
                        <div key={input.index} className="flex flex-col gap-1">
                            <div className="flex items-center gap-4">
                                <label className="w-24 font-mono text-sm">
                                    {input.name ?? `Input #${input.index}`}
                                    {input.delimiter && (
                                        <span className="text-gray-500 ml-1">
                                            (:{input.delimiter})
                                        </span>
                                    )}
                                </label>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={value || ""}
                                        onChange={(e) =>
                                            setValue(input.index, e.target.value)
                                        }
                                        className={`
                                            w-full p-2 border rounded-md
                                            ${hasValue 
                                                ? error 
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                    : 'border-green-300 focus:ring-green-500 focus:border-green-500'
                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                            }
                                        `}
                                        placeholder={getInputPlaceholder(input.type)}
                                    />
                                    {hasValue && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            {error ? (
                                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {error && (
                                <div className="ml-28 text-sm text-red-600">
                                    {error.message}
                                </div>
                            )}
                            <div className="ml-28 text-xs text-gray-500">
                                {getTypeDescription(input.type)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Helper function to get input type description
const getTypeDescription = (type: InputType | undefined): string => {
    if (!type) return '';
    
    if (typeof type === 'string') {
        return `Type: ${type}`;
    }
    
    if ('constant' in type) {
        return `Must be: "${type.constant}"`;
    }
    
    if ('baseType' in type) {
        return `Type: ${type.baseType} with ${type.metadata.join(', ')}`;
    }
    
    if ('left' in type) {
        return 'Conditional type';
    }
    
    return '';
};

// Helper function to get input placeholder
const getInputPlaceholder = (type: InputType | undefined): string => {
    if (!type) return '';
    
    if (typeof type === 'string') {
        switch(type) {
            case 'uint256': return 'Enter a positive number';
            case 'address': return '0x...';
            case 'bool': return 'true or false';
            case 'string': return 'Enter text';
            default: return `Enter ${type}`;
        }
    }
    
    if ('constant' in type) {
        return `Must be: ${type.constant}`;
    }
    
    if ('baseType' in type) {
        return `Enter ${type.baseType} value`;
    }
    
    return 'Enter value';
};
