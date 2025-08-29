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
	// Add event listeners to fire confetti when a button is clicked.
	searchField.addEventListener("input", (e) => {
		const value = searchField.value;
		const oeuvres =
			document.querySelectorAll<HTMLDivElement>(`.catalogue-oeuvre`);

		oeuvres.forEach((oeuvre) => {
			if (!value || value === "") {
				oeuvre.classList.add("visible");
				oeuvre.classList.remove("hidden");
			} else {
				const titre = oeuvre.dataset.titre;
				const hasMatch =
					titre && normalize(titre).includes(normalize(value));
				if (hasMatch) {
					oeuvre.classList.remove("hidden");
					oeuvre.classList.add("visible");
				} else {
					oeuvre.classList.remove("visible");
					oeuvre.classList.add("hidden");
				}
			}
		});
	});
}
