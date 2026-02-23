import { defineConfig } from "vitepress";

export default defineConfig({
	base: "/ok-fp/",
	title: "OK-FP",
	description: "Essential Effect Data Types for TypeScript",
	themeConfig: {
		sidebar: [
			{
				text: "Guide",
				items: [
					{ text: "Getting Started", link: "/" },
					{ text: "Option", link: "/option" },
					{ text: "Either", link: "/either" },
					{ text: "Validation", link: "/validation" },
					{ text: "Task", link: "/task" },
					{ text: "TaskEither", link: "/task-either" },
				],
			},
		],
		socialLinks: [{ icon: "github", link: "https://github.com/pwlmc/ok-fp" }],
		outline: {
			level: [2, 3],
		},
	},
});
