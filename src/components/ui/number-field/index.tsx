import { cn } from "@/lib/utils";
import { Add, Remove } from "@mui/icons-material";
import { Box, Divider } from "@mui/material";
import { useId } from "react";

type NumberFieldPropsT = {
  label: string;
  placeholder?: string;
  labelOn: "TOP" | "BOTTOM";
};

export function NumberField({
  label,
  placeholder = "10",
  labelOn,
}: NumberFieldPropsT) {
  const id = useId();

  return (
    <Box>
      {labelOn === "TOP" && (
        <label htmlFor={id} className="block text-sm mb-1">
          {label}
        </label>
      )}
      <Box
        className={cn(
          "relative flex items-center shadow-xs rounded-base h-14 border border-black",
          labelOn === "BOTTOM" && "border-t-0",
        )}
      >
        <input
          type="text"
          id={id}
          className="border-r h-full placeholder:text-heading text-center w-full bg-neutral-secondary-medium border-default-medium py-2.5 placeholder:text-body"
          placeholder={placeholder}
        />
        <Box className="flex flex-col">
          <button
            type="button"
            className="cursor-pointer focus:outline-none h-7 hover:bg-gray-100 hover:border-t border-black"
          >
            <Add className="text-base mx-1" />
          </button>
          <Divider />
          <button
            type="button"
            className="cursor-pointer focus:outline-none h-7 hover:bg-gray-100 hover:border-b border-black"
          >
            <Remove className="text-base mx-1" />
          </button>
        </Box>
      </Box>
      {labelOn === "BOTTOM" && (
        <label htmlFor={id} className="block text-sm mt-1">
          {label}
        </label>
      )}
    </Box>
  );
}
