import {
	getInputPlaceholder,
	getTypeDescription,
	InputState,
	ParsedCordSentence,
	ValidationError,
} from "@terminallyonline/cord";

type ExampleFormProps = {
	parsed: ParsedCordSentence | null;
	setValue: (index: number, value: string) => void;
	getInputValue: (index: number) => InputState | undefined;
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
					const isEmpty = !value?.value.trim();
					const isValid = !isEmpty && !error;

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
										value={value?.value}
										onChange={(e) =>
											setValue(
												input.index,
												e.target.value
											)
										}
										disabled={value?.isDisabled}
										className={`
                                            w-full p-2 border rounded-md
                                            ${
												value?.isDisabled
													? "bg-gray-100 cursor-not-allowed border-gray-300"
													: isEmpty
													? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
													: isValid
													? "border-green-300 focus:ring-green-500 focus:border-green-500"
													: "border-red-300 focus:ring-red-500 focus:border-red-500"
											}
                                        `}
										placeholder={getInputPlaceholder(
											input.type
										)}
									/>

									{value && !value?.isDisabled && (
										<div className="absolute right-2 top-1/2 -translate-y-1/2">
											{isValid ? (
												<svg
													className="w-5 h-5 text-green-500"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 13l4 4L19 7"
													/>
												</svg>
											) : (
												<svg
													className="w-5 h-5 text-red-500"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											)}
										</div>
									)}
								</div>
							</div>
							{(isEmpty || error) && !value?.isDisabled && (
								<div className="ml-28 text-sm text-red-600">
									{error?.message || "This field is required"}
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
