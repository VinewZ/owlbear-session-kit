import { Editable } from "@ark-ui/react/editable";

import { useHighlightDice } from "@/hooks/dice/highlight-dice";
import { cn } from "@/lib/utils";

type JsonInputPropsT = {
	className?: string;
	value?: string | number;
	onChange?: (value: string) => void;
	renderValue?: (value: string | number) => React.ReactNode;
};

export function JsonInput({
	className,
	value,
	onChange,
	renderValue,
}: JsonInputPropsT) {
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
			{/* Invisible sizer — occupies same grid cell as preview/input,
			    drives the height so both always match the text content */}
			<span
				aria-hidden
				className="invisible whitespace-pre-wrap break-words p-1 [grid-area:1/1] pointer-events-none select-none"
			>
				{stringValue}{" "}
			</span>
			<Editable.Preview className="text-start whitespace-pre-wrap break-words cursor-pointer focus:bg-white/10 rounded-md p-1 [grid-area:1/1]">
				{displayContent}
			</Editable.Preview>
			<Editable.Input
				className="bg-transparent focus:bg-white/10 focus:outline-none rounded-md p-1 min-w-0 overflow-hidden resize-none [grid-area:1/1]"
				asChild
			>
				<textarea />
			</Editable.Input>
		</Editable.Root>
	);
}
