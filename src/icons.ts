import DiscsIcon from "./components/icons/DiscsIcon.astro";
import ArrowIcon from "./components/icons/ArrowIcon.astro";
import PhotosIcon from "./components/icons/PhotosIcon.astro";
import CatalogIcon from "./components/icons/CatalogIcon.astro";
import BiographyIcon from "./components/icons/BiographyIcon.astro";
import ConcertsIcon from "./components/icons/ConcertsIcon.astro";
import ActualitesIcon from "./components/icons/ActualitesIcon.astro";
import { SectionId } from "./content";

const sectionIcons: { [key in SectionId]?: typeof DiscsIcon } = {
	[SectionId.DISQUES]: DiscsIcon,
	[SectionId.PHOTOS]: PhotosIcon,
	[SectionId.CATALOGUE]: CatalogIcon,
	[SectionId.BIOGRAPHIE]: BiographyIcon,
	[SectionId.ACTUALITES]: ActualitesIcon,
	[SectionId.CONCERTS]: ConcertsIcon,
};

export const getSectionIcon = (sectionId: SectionId) =>
	sectionIcons[sectionId] || ArrowIcon;
