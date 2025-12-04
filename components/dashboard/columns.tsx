"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CompanyFormData } from "@/lib/entities/company"

export const columns: ColumnDef<CompanyFormData>[] = [
  {
    accessorKey: "nombre_compañia",
    header: "Company Name",
  },
  {
    accessorKey: "rfc",
    header: "RFC",
  },
  {
    accessorKey: "correo",
    header: "Email",
  },
  {
    accessorKey: "nombre_representante_legal",
    header: "Representative",
    cell: ({ row }) => {
      return `${row.original.nombre_representante_legal} ${row.original.apellido_representante_legal}`
    }
  },
  {
    accessorKey: "origen",
    header: "Origin",
  },
]