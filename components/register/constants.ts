export const DOCUMENT_TYPES = [
    { value: "pasaporte", label: "Pasaporte" },
    { value: "ine", label: "INE" },
    { value: "licencia", label: "Licencia" },
    { value: "cartilla_militar", label: "Cartilla Militar" },
] as const;

export const ACCOUNT_TYPES = [
    { value: "moral", label: "Persona Moral" },
    { value: "fisica", label: "Persona Física" },
] as const;

export const ORIGEN_RECURSOS_OPTIONS = [
    { value: "capital de la empresa", label: "Capital de la Empresa" },
    { value: "utilidades", label: "Utilidades" },
    { value: "actividad propia de la empresa", label: "Actividad Propia de la Empresa" },
    { value: "pagos de servicios", label: "Pagos de Servicios" },
    { value: "inversion", label: "Inversión" },
    { value: "otros", label: "Otros" },
] as const;

export const DESTINO_RECURSOS_OPTIONS = [
    { value: "fondeo a cuentas propias", label: "Fondeo a cuentas propias" },
    { value: "pago a proveedores", label: "Pago a Proveedores" },
    { value: "pagos de servicios", label: "Pagos de Servicios" },
    { value: "inversion", label: "Inversión" },
    { value: "otros", label: "Otros" },
] as const;

export const CRYPTO_CURRENCIES = [
    { value: "BTC", label: "BTC" },
    { value: "ETH", label: "ETH" },
    { value: "USDT", label: "USDT" },
    { value: "USDC", label: "USDC" },
    { value: "SOL", label: "SOL" },
    { value: "XRP", label: "XRP" },
] as const;

export const OPERACIONES_OPTIONS = [
    { value: "1-5", label: "1-5" },
    { value: "6-10", label: "6-10" },
    { value: "11-20", label: "11-20" },
    { value: "21-50", label: "21-50" },
    { value: "51-100", label: "51-100" },
    { value: "100+", label: "100+" },
] as const;

export const COMPANY_GENERAL_FIELDS = [
    "nombre_compañia",
    "nombre_legal_compañia",
    "fecha_de_constitucion",
    "acta_constitutiva",
    "rfc_entidad_legal",
    "correo",
    "giro_mercantil",
    "csf",
    "e_firma",
    "no_sello",
] as const;

export const PERSON_GENERAL_FIELDS = [
    "nombre_completo",
    "fecha_nacimiento",
    "nacionalidad",
    "pais_nacimiento",
    "nombre_completo_ordenante",
    "ine",
] as const;

export const REPRESENTATIVE_FIELDS = [
    "nombre_representante_legal",
    "apellido_representante_legal",
] as const;
