import { Editable } from "@ark-ui/react/editable";

import { useHighlightDice } from "@/hooks/dice/highlight-dice";
import { cn } from "@/lib/utils";

type JsonInputProps = {
	className?: string;
	previewClassName?: string;
	inputClassName?: string;
	value?: string | number;
	onChange?: (value: string) => void;
	renderValue?: (value: string | number) => React.ReactNode;
};

export function JsonInput({
	className,
	previewClassName,
	inputClassName,
	value,
	onChange,
	renderValue,
}: JsonInputProps) {
	const highlight = useHighlightDice();

	const stringValue =
		value === null || value === undefined ? "" : String(value);

	const displayContent = renderValue
		? renderValue(stringValue)
		: highlight(stringValue);

	return (
		<Editable.Root
			value={stringValue}
			onValueChange={({ value }) => onChange?.(value)}
			activationMode="click"
			submitMode="blur"
			className={cn("inline-grid max-w-full", className)}
		>
			<span
				aria-hidden
				className={cn(
					"invisible whitespace-pre-wrap wrap-break-word p-1 [grid-area:1/1] pointer-events-none select-none",
					previewClassName,
				)}
			>
				{stringValue}
			</span>
			<Editable.Preview
				className={cn(
					"p-2 bg-black/40 text-start whitespace-pre-wrap wrap-break-word cursor-pointer focus:bg-white/10 rounded-md [grid-area:1/1]",
					previewClassName,
				)}
			>
				{displayContent}
			</Editable.Preview>
			<Editable.Input
				className={cn(
					"bg-transparent focus:bg-white/10 focus:outline-none rounded-md p-1 min-w-0 overflow-hidden resize-none [grid-area:1/1]",
					inputClassName,
				)}
				asChild
			>
				<textarea />
			</Editable.Input>
		</Editable.Root>
	);
}
