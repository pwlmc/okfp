import { defineConfig } from "vitepress";

export default defineConfig({
	title: "OKFP",
	description: "Essential typed effects for TypeScript.",
	themeConfig: {
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Getting Started", link: "/getting-started" },
		],
		sidebar: [
			{
				text: "Guide",
				items: [
					{ text: "Getting Started", link: "/getting-started" },
					{ text: "Option", link: "/option" },
					{ text: "Either", link: "/either" },
				],
			},
		],
		socialLinks: [{ icon: "github", link: "https://github.com/pwlmc/okfp" }],
	},
});
