"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface WatchFormValues {
  brand: string;
  model: string;
  price: string;
  compare_at_price: string;
  stock: string;
  stock_min_threshold: string;
  condition: string;
  style: string;
  movement: string;
  case_diameter_mm: string;
  case_material: string;
  strap_material: string;
  dial_color: string;
  water_resistance_m: string;
  gender: string;
  description: string;
  image_url: string;
  available: boolean;
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  defaultValues?: Partial<WatchFormValues>;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#475569" }}>
      {children}{required && <span style={{ color: "#f87171" }}> *</span>}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <div className="h-px flex-1" style={{ background: "rgba(59,130,246,0.15)" }} />
      <span className="text-[10px] font-mono font-semibold uppercase tracking-widest" style={{ color: "#1e3a5f" }}>
        {children}
      </span>
      <div className="h-px flex-1" style={{ background: "rgba(59,130,246,0.15)" }} />
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e8f0",
  borderRadius: "0.625rem",
  padding: "0.6rem 0.875rem",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "rgba(59,130,246,0.5)"),
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "rgba(255,255,255,0.08)"),
};

const SELECT_STYLE = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none" as const,
};

function SelectField({
  name, value, onChange, options, placeholder,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select name={name} value={value} onChange={onChange} style={SELECT_STYLE} {...focusHandlers}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#0f172a" }}>
          {o}
        </option>
      ))}
    </select>
  );
}

const EMPTY: WatchFormValues = {
  brand: "", model: "", price: "", compare_at_price: "", stock: "",
  stock_min_threshold: "5",
  condition: "", style: "", movement: "", case_diameter_mm: "",
  case_material: "", strap_material: "", dial_color: "",
  water_resistance_m: "", gender: "", description: "", image_url: "",
  available: true,
};

export function ProductForm({ mode, productId, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<WatchFormValues>({ ...EMPTY, ...defaultValues });
  const [preview, setPreview] = useState<string>(defaultValues?.image_url ?? "");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleToggleAvailable() {
    setForm((prev) => ({ ...prev, available: !prev.available }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error ?? "Error al subir la imagen."); return; }
    setForm((prev) => ({ ...prev, image_url: data.url }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uploading) return;
    setLoading(true);
    setError("");

    const payload: Record<string, unknown> = {
      brand: form.brand,
      model: form.model,
      price: parseFloat(form.price),
      stock: form.stock !== "" ? parseInt(form.stock) : 0,
      stock_min_threshold: form.stock_min_threshold !== "" ? parseInt(form.stock_min_threshold) : 5,
      condition: form.condition,
      style: form.style,
      available: form.available,
    };
    if (form.compare_at_price !== "") payload.compare_at_price = parseFloat(form.compare_at_price);
    if (form.movement) payload.movement = form.movement;
    if (form.case_diameter_mm !== "") payload.case_diameter_mm = parseInt(form.case_diameter_mm);
    if (form.case_material) payload.case_material = form.case_material;
    if (form.strap_material) payload.strap_material = form.strap_material;
    if (form.dial_color) payload.dial_color = form.dial_color;
    if (form.water_resistance_m !== "") payload.water_resistance_m = parseFloat(form.water_resistance_m);
    if (form.gender) payload.gender = form.gender;
    if (form.description) payload.description = form.description;
    if (form.image_url) payload.image_url = form.image_url;

    const url = mode === "create" ? "/api/products" : `/api/products/${encodeURIComponent(productId!)}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Error al guardar el producto.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl p-7 max-w-2xl"
      style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <SectionTitle>Identificación</SectionTitle>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Marca</FieldLabel>
          <input name="brand" value={form.brand} onChange={handleChange} required placeholder="Casio, Seiko..." style={inputStyle} {...focusHandlers} />
        </div>
        <div>
          <FieldLabel required>Modelo</FieldLabel>
          <input name="model" value={form.model} onChange={handleChange} required placeholder="G-Shock GA-2100" style={inputStyle} {...focusHandlers} />
        </div>
      </div>

      <SectionTitle>Precio y Stock</SectionTitle>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <FieldLabel required>Precio (S/)</FieldLabel>
          <input name="price" value={form.price} onChange={handleChange} type="number" step="0.01" min="0" required placeholder="0.00" style={inputStyle} {...focusHandlers} />
        </div>
        <div>
          <FieldLabel>Precio original (S/)</FieldLabel>
          <input name="compare_at_price" value={form.compare_at_price} onChange={handleChange} type="number" step="0.01" min="0" placeholder="0.00" style={inputStyle} {...focusHandlers} />
        </div>
        <div>
          <FieldLabel>Stock actual</FieldLabel>
          <input name="stock" value={form.stock} onChange={handleChange} type="number" step="1" min="0" placeholder="0" style={inputStyle} {...focusHandlers} />
        </div>
        <div>
          <FieldLabel>Alerta de stock mínimo</FieldLabel>
          <input name="stock_min_threshold" value={form.stock_min_threshold} onChange={handleChange} type="number" step="1" min="0" placeholder="5" style={inputStyle} {...focusHandlers} />
        </div>
      </div>

      <SectionTitle>Clasificación</SectionTitle>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <FieldLabel required>Condición</FieldLabel>
          <SelectField name="condition" value={form.condition} onChange={handleChange} options={["Nuevo", "Vintage"]} placeholder="Seleccionar..." />
        </div>
        <div>
          <FieldLabel required>Estilo</FieldLabel>
          <SelectField name="style" value={form.style} onChange={handleChange} options={["Sport", "Dress", "Casual"]} placeholder="Seleccionar..." />
        </div>
        <div>
          <FieldLabel>Género</FieldLabel>
          <SelectField name="gender" value={form.gender} onChange={handleChange} options={["Hombre", "Mujer", "Unisex"]} placeholder="Seleccionar..." />
        </div>
      </div>

      <SectionTitle>Características técnicas</SectionTitle>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Movimiento</FieldLabel>
          <SelectField name="movement" value={form.movement} onChange={handleChange} options={["Cuarzo", "Automático", "Solar"]} placeholder="Seleccionar..." />
        </div>
        <div>
          <FieldLabel>Diámetro caja (mm)</FieldLabel>
          <input name="case_diameter_mm" value={form.case_diameter_mm} onChange={handleChange} type="number" step="0.1" min="0" placeholder="44.5" style={inputStyle} {...focusHandlers} />
        </div>
        <div>
          <FieldLabel>Material caja</FieldLabel>
          <input name="case_material" value={form.case_material} onChange={handleChange} placeholder="Acero inox, Resina..." style={inputStyle} {...focusHandlers} />
        </div>
        <div>
          <FieldLabel>Material correa</FieldLabel>
          <input name="strap_material" value={form.strap_material} onChange={handleChange} placeholder="Cuero, Metal, Resina..." style={inputStyle} {...focusHandlers} />
        </div>
        <div>
          <FieldLabel>Color esfera</FieldLabel>
          <input name="dial_color" value={form.dial_color} onChange={handleChange} placeholder="Negro, Azul..." style={inputStyle} {...focusHandlers} />
        </div>
        <div>
          <FieldLabel>Resistencia al agua (m)</FieldLabel>
          <input name="water_resistance_m" value={form.water_resistance_m} onChange={handleChange} type="number" step="0.1" min="0" placeholder="100" style={inputStyle} {...focusHandlers} />
        </div>
      </div>

      <SectionTitle>Contenido</SectionTitle>

      <div>
        <FieldLabel>Descripción</FieldLabel>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe el reloj..." style={{ ...inputStyle, resize: "vertical" }} {...focusHandlers} />
      </div>

      {/* Imagen */}
      <div>
        <FieldLabel>Foto del reloj</FieldLabel>
        <label
          className="relative rounded-xl cursor-pointer block text-center transition-all duration-150"
          style={{ border: "2px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", padding: preview ? "1rem" : "2rem 1rem" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLLabelElement).style.borderColor = "rgba(59,130,246,0.4)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLLabelElement).style.borderColor = "rgba(255,255,255,0.1)")}
        >
          {preview ? (
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Vista previa" className="h-32 w-32 object-cover rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
              <span className="text-xs" style={{ color: "#475569" }}>{uploading ? "Subiendo..." : "Click para cambiar"}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-400">Click para subir una foto</p>
              <p className="text-xs" style={{ color: "#334155" }}>JPG, PNG, WEBP · máx 10MB</p>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ background: "rgba(6,11,24,0.8)" }}>
              <span className="text-sm font-medium" style={{ color: "#3b82f6" }}>Subiendo imagen...</span>
            </div>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {/* Disponible toggle */}
      <div className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-sm font-medium" style={{ color: "#94a3b8" }}>Disponible para venta</span>
        <button
          type="button"
          onClick={handleToggleAvailable}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          style={{ background: form.available ? "#3b82f6" : "rgba(255,255,255,0.1)" }}
        >
          <span
            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            style={{ transform: form.available ? "translateX(1.375rem)" : "translateX(0.125rem)" }}
          />
        </button>
      </div>

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading || uploading}
          className="flex-1 py-2.5 px-5 rounded-lg text-sm font-semibold text-white transition-all duration-150 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 4px 15px rgba(59,130,246,0.25)" }}
        >
          {loading ? "Guardando..." : mode === "create" ? "Crear reloj" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
