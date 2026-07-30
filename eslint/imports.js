export const restrictedImportsConfig = [
    {
        files: ["**/core/**/*.{ts,js,svelte}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["$features", "$features/**", "$views", "$views/**"],
                            message: "Core must not depend from features/views.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["**/*.ts", "**/*.js", "**/*.svelte"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        {
                            name: "svelte/action",
                            message:
                                "Imports from 'svelte/action' are forbidden. Use Svelte 5 attachments or element functionsinstead.",
                        },
                        {
                            name: "svelte",
                            importNames: ["setContext", "getContext"],
                            message:
                                "Raw 'setContext' and 'getContext' are forbidden. Use 'createContext' from 'svelte'instead.",
                        },
                    ],
                    patterns: [
                        {
                            regex: String.raw`^\.\./`,
                            message:
                                "Relative parent imports via '../' are forbidden. Please use path aliases ($components, $utils, $core, $views etc.).",
                        },
                        {
                            group: ["$lib/core", "$lib/core/**"],
                            message:
                                "Please use the specific '$core' alias instead of '$lib/core'.",
                        },
                        {
                            group: ["$lib/modules", "$lib/modules/**"],
                            message:
                                "Please use the specific '$modules' alias instead of '$lib/modules'.",
                        },
                        {
                            group: ["$lib/views", "$lib/views/**"],
                            message:
                                "Please use the specific '$views' alias instead of '$lib/views'.",
                        },
                        {
                            group: ["$lib/features", "$lib/features/**"],
                            message:
                                "Please use the specific '$features' alias instead of '$lib/features'.",
                        },
                        {
                            group: [
                                "$lib/components",
                                "$lib/components/**",
                                "$lib/shared/components",
                                "$lib/shared/components/**",
                            ],
                            message:
                                "Please use the specific '$components' alias instead of '$lib/components' or '$lib/shared/components'.",
                        },
                        {
                            group: [
                                "$lib/utils",
                                "$lib/utils/**",
                                "$lib/shared/utils",
                                "$lib/shared/utils/**",
                            ],
                            message:
                                "Please use the specific '$utils' alias instead of '$lib/utils' or '$lib/shared/utils'.",
                        },
                        {
                            group: [
                                "$lib/styles",
                                "$lib/styles/**",
                                "$lib/shared/styles",
                                "$lib/shared/styles/**",
                            ],
                            message:
                                "Please use the specific '$styles' alias instead of '$lib/styles' or '$lib/shared/styles'.",
                        },
                        {
                            group: [
                                "$lib/transitions",
                                "$lib/transitions/**",
                                "$lib/shared/transitions",
                                "$lib/shared/transitions/**",
                            ],
                            message:
                                "Please use the specific '$transitions' alias instead of '$lib/transitions' or '$lib/shared/transitions'.",
                        },
                        {
                            group: [
                                "$lib/types",
                                "$lib/types/**",
                                "$lib/shared/types",
                                "$lib/shared/types/**",
                            ],
                            message:
                                "Please use the specific '$types' alias instead of '$lib/types' or '$lib/shared/types'.",
                        },
                        {
                            group: [
                                "$lib/attachments",
                                "$lib/attachments/**",
                                "$lib/shared/attachments",
                                "$lib/shared/attachments/**",
                            ],
                            message:
                                "Please use the specific '$attachments' alias instead of '$lib/attachments' or '$lib/shared/attachments'.",
                        },
                        {
                            group: ["$lib/shared", "$lib/shared/**"],
                            message:
                                "Please use specific sub-aliases ($components, $utils, $styles, $transitions, $types, $attachments) instead of '$lib/shared'.",
                        },
                    ],
                },
            ],
        },
    },
];
