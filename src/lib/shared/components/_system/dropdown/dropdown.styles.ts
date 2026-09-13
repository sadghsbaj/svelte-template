import { cva, type VariantProps } from "$utils";

export const dropdownContentStyles = cva({
    base: {
        layout: "overflow-y-auto",
        frame: "bg-elevation-1 shadow-xl rounded-3xl squircle-smooth p-6px",
        sizing: "w-272px max-w-[var(--floating-available-width)] max-h-[var(--floating-available-height)]",
    },
});

export const dropdownItemStyles = cva({
    base: {
        layout: "flex items-center w-full min-w-0 select-none",
        typography: "text-left",
        frame: "rounded-2xl squircle-smooth",
        interaction:
            "cursor-pointer hover:bg-base-soft-1 focus-visible:bg-base-soft-1 outline-none",
        motion: "t:(bg-200-quad-out text-200-quad-out opacity-200-quad-out)",
    },
    options: {
        size: {
            sm: "min-h-32px px-9px gap-6px text-xs [&>svg]:(size-14px stroke-2.5)",
            md: "min-h-36px px-10px gap-8px text-sm [&>svg]:(size-16px stroke-2.5)",
            lg: "min-h-40px px-12px gap-10px text-base [&>svg]:(size-18px stroke-2.5)",
        },
    },
    modifiers: {
        described: "py-6px [&>svg]:self-start",
        submenuOpen: "bg-base-soft-1",
    },
    compounds: [
        { size: "sm", described: true, class: "[&>svg]:mt-1px" },
        { size: "md", described: true, class: "[&>svg]:mt-2px" },
        { size: "lg", described: true, class: "[&>svg]:mt-3px" },
    ],
    defaults: { size: "md" },
});

export const dropdownSeparatorStyles = "mx-6px my-4px h-px bg-base-soft-2";

export type DropdownItemStyleProps = VariantProps<typeof dropdownItemStyles>;
