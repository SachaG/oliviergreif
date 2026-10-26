const normalize = (str: string) =>
	str
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");

// Find our component DOM on the page.
const searchField = document.getElementById(
	"searchInput",
) as HTMLInputElement | null;

if (searchField) {
	const items = document.querySelectorAll<HTMLDivElement>(`.search-item`);

	console.log(items);
	items.forEach((item) => {
		console.log(item.dataset);
	});
	searchField.addEventListener("input", (e) => {
		const value = searchField.value;

		console.log(value);
		items.forEach((item) => {
			if (!value || value === "") {
				item.classList.add("visible");
				item.classList.remove("hidden");
			} else {
				const titre = item.dataset.titre;
				const hasMatch =
					titre && normalize(titre).includes(normalize(value));
				console.log(titre, value, hasMatch);
				if (hasMatch) {
					item.classList.remove("hidden");
					item.classList.add("visible");
				} else {
					item.classList.remove("visible");
					item.classList.add("hidden");
				}
			}
		});
	});
}
