// Edit form generated from a collection's JSON Schema (z.toJSONSchema of the
// shared Zod schema), using the `.meta()` hints: title, widget, reference, localized.
import { useState, type ReactNode } from "react";
import { locales, sourceLocale } from "@ogreif/shared/i18n";

type JsonSchema = {
	type?: string;
	title?: string;
	format?: string;
	widget?: string;
	reference?: string;
	localized?: boolean;
	properties?: Record<string, JsonSchema>;
	required?: string[];
	items?: JsonSchema;
};
type Option = { value: string; label: string };
type Data = Record<string, any>;

type Props = {
	collection: string;
	id?: string;
	sha?: string;
	schema: JsonSchema;
	initialData: Data;
	referenceOptions: Record<string, Option[]>;
};

// French first, as it's the language the content is written in
const formLocales = [sourceLocale, ...locales.filter((l) => l !== sourceLocale)];

// accents and punctuation are ignored when searching
const normalize = (s: string) =>
	s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const isEmpty = (v: unknown): boolean =>
	v === undefined ||
	v === null ||
	v === "" ||
	(Array.isArray(v) && v.length === 0) ||
	(typeof v === "object" && !Array.isArray(v) && Object.values(v as object).every(isEmpty));

// drop empty optional values (and empty translations) so the YAML stays clean
const clean = (schema: JsonSchema, data: Data) => {
	const out: Data = {};
	for (const [key, prop] of Object.entries(schema.properties ?? {})) {
		let value = data[key];
		if (prop.localized && value) {
			value = Object.fromEntries(Object.entries(value).filter(([, v]) => !isEmpty(v)));
		}
		const required = schema.required?.includes(key);
		if (isEmpty(value) && !required) continue;
		out[key] = prop.localized ? { [sourceLocale]: "", ...value } : (value ?? "");
	}
	return out;
};

export default function EntryForm({ collection, id, sha: initialSha, schema, initialData, referenceOptions }: Props) {
	const [data, setData] = useState<Data>(initialData);
	const [sha, setSha] = useState(initialSha);
	const [status, setStatus] = useState<{ state: "idle" | "saving" | "saved" | "error"; messages?: string[] }>({
		state: "idle",
	});

	const save = async (event: { preventDefault(): void }) => {
		event.preventDefault();
		setStatus({ state: "saving" });
		const res = await fetch(`/api/${collection}/${id ?? "new"}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ data: clean(schema, data), sha }),
		});
		const body = await res.json().catch(() => ({}));
		if (!res.ok) {
			setStatus({ state: "error", messages: body.errors ?? [body.error ?? `Erreur ${res.status}`] });
		} else if (!id) {
			location.href = `/${collection}/${body.id}`;
		} else {
			setSha(body.sha);
			setStatus({ state: "saved" });
		}
	};

	const remove = async () => {
		if (!id || !confirm("Supprimer définitivement cette entrée ?")) return;
		const res = await fetch(`/api/${collection}/${id}?sha=${sha}`, { method: "DELETE" });
		if (res.ok) location.href = `/${collection}`;
		else setStatus({ state: "error", messages: [(await res.json().catch(() => ({}))).error ?? `Erreur ${res.status}`] });
	};

	return (
		<form className="entry-form" onSubmit={save}>
			{Object.entries(schema.properties ?? {}).map(([name, prop]) => (
				<Field
					key={name}
					name={name}
					prop={prop}
					required={!!schema.required?.includes(name)}
					value={data[name]}
					onChange={(value) => {
						setData({ ...data, [name]: value });
						setStatus({ state: "idle" });
					}}
					options={prop.items?.reference ? (referenceOptions[prop.items.reference] ?? []) : []}
				/>
			))}

			{status.state === "error" && (
				<ul className="error" role="alert">
					{status.messages?.map((m) => <li key={m}>{m}</li>)}
				</ul>
			)}
			<div className="actions">
				<button disabled={status.state === "saving"}>
					{status.state === "saving" ? "Enregistrement…" : "Enregistrer"}
				</button>
				{status.state === "saved" && <span role="status">Enregistré ✓</span>}
				{id && (
					<button type="button" className="secondary" onClick={remove}>
						Supprimer
					</button>
				)}
			</div>
		</form>
	);
}

type FieldProps = {
	name: string;
	prop: JsonSchema;
	required: boolean;
	value: any;
	onChange: (value: any) => void;
	options: Option[];
};

function Field({ name, prop, required, value, onChange, options }: FieldProps) {
	const title = `${prop.title ?? name}${required ? " *" : ""}`;

	// one input per language, side by side
	if (prop.localized) {
		return (
			<fieldset className="localized">
				<legend>{title}</legend>
				{formLocales.map((locale) => (
					<label key={locale}>
						<span className="muted">{locale.toUpperCase()}</span>
						<Input
							widget={prop.widget}
							value={value?.[locale] ?? ""}
							onChange={(v) => onChange({ ...value, [locale]: v })}
							required={required && locale === sourceLocale}
						/>
					</label>
				))}
			</fieldset>
		);
	}

	if (prop.type === "array" && prop.items?.reference) {
		return <ReferencePicker title={title} options={options} value={value ?? []} onChange={onChange} />;
	}

	return (
		<label>
			{title}
			<Input
				widget={prop.format === "date" ? "date" : prop.widget}
				value={value ?? ""}
				onChange={onChange}
				required={required}
			/>
		</label>
	);
}

type InputProps = { widget?: string; value: string; onChange: (value: string) => void; required?: boolean };

function Input({ widget, value, onChange, required }: InputProps) {
	const common = { value, required, onChange: (e: { target: { value: string } }) => onChange(e.target.value) };
	switch (widget) {
		case "date":
			return <input type="date" {...common} />;
		case "time":
			return <input type="time" {...common} />;
		case "textarea":
			return <textarea rows={3} {...common} />;
		case "html":
			return (
				<>
					<textarea rows={6} {...common} />
					{value && (
						<details>
							<summary className="muted">Aperçu</summary>
							<div className="preview" dangerouslySetInnerHTML={{ __html: value }} />
						</details>
					)}
				</>
			);
		default:
			return <input {...common} />;
	}
}

type ReferencePickerProps = { title: ReactNode; options: Option[]; value: string[]; onChange: (value: string[]) => void };

// searchable multi-select: selected items as a list, matches appear while typing
function ReferencePicker({ title, options, value, onChange }: ReferencePickerProps) {
	const [query, setQuery] = useState("");
	const labels = new Map(options.map((o) => [o.value, o.label]));
	const matches = query
		? options.filter((o) => !value.includes(o.value) && normalize(o.label).includes(normalize(query))).slice(0, 12)
		: [];
	return (
		<fieldset>
			<legend>{title}</legend>
			{value.length > 0 && (
				<ul className="selected">
					{value.map((v) => (
						<li key={v}>
							{labels.get(v) ?? <span className="error">{v} (introuvable dans le catalogue)</span>}
							<button
								type="button"
								className="secondary"
								aria-label={`Retirer ${labels.get(v) ?? v}`}
								onClick={() => onChange(value.filter((x) => x !== v))}
							>
								×
							</button>
						</li>
					))}
				</ul>
			)}
			<input
				type="search"
				placeholder="Ajouter une œuvre…"
				aria-label="Rechercher une œuvre à ajouter"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>
			{matches.length > 0 && (
				<ul className="matches">
					{matches.map((o) => (
						<li key={o.value}>
							<button
								type="button"
								className="secondary"
								onClick={() => {
									onChange([...value, o.value]);
									setQuery("");
								}}
							>
								{o.label}
							</button>
						</li>
					))}
				</ul>
			)}
		</fieldset>
	);
}
