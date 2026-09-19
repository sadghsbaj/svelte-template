import { cva, type VariantProps } from "$utils";

export const bottomNavbarStyles = cva({
    base: {
        layout: "relative flex w-full min-w-0 items-center",
        frame: "bg-elevation-1 rounded-full squircle-smooth shadow-lg",
        motion: "transform-gpu backface-hidden",
        misc: "isolate pointer-events-auto",
    },
    options: {
        size: {
            sm: "h-48px max-w-480px p-3px",
            md: "h-56px max-w-560px p-4px",
            lg: "h-60px max-w-620px p-4px",
            responsive: "h-52px max-w-560px p-4px md:(h-58px max-w-620px)",
        },
    },
    defaults: {
        size: "responsive",
    },
});

export const bottomNavbarItemStyles = cva({
    base: {
        layout: "relative z-1 flex-center h-full w-0 min-w-0 flex-1 gap-6px px-8px",
        typography: "text-sm font-500 leading-normal",
        frame: "rounded-full squircle-smooth bg-transparent",
        interaction: "select-none",
        motion: "t:text-200-cubic-out",
        misc: "[&>svg]:size-18px [&>svg]:shrink-0 [&>svg]:stroke-[2.25px]",
    },
});

export type BottomNavbarStyleProps = VariantProps<typeof bottomNavbarStyles>;
export type BottomNavbarItemStyleProps = VariantProps<typeof bottomNavbarItemStyles>;
