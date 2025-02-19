import type { Route } from "./+types/newFormTemplate"
import { useState, type JSX } from "react"
import {
  CalendarFoldIcon,
  CheckCircle2Icon,
  FileDigitIcon,
  LetterTextIcon,
  PencilIcon,
  ScrollTextIcon,
  TextIcon,
} from "lucide-react/icons"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"

import type { FormField } from "./home"

export async function loader() {
  return {}
}

export default function NewFormTemplate({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Novo template</h1>

        <Button>Salvar</Button>
      </header>

      <div>
        <div className="grid grid-cols-2 gap-4">
          <label>
            <span>Nome</span>
            <Input placeholder="Nome..." type="text" />
          </label>

          <label>
            <span>Descrição</span>
            <Input placeholder="Descição..." type="text" />
          </label>
        </div>

        <div className="mt-4">
          <Fields />
        </div>
      </div>
    </>
  )
}

type PartialFormField = Omit<FormField, "id" | "formTemplateId">

function Fields() {
  const [fields, setFields] = useState<PartialFormField[]>([
    {
      name: "Campo 1",
      order: 1,
      required: true,
      type: "text",
    },
    {
      name: "Campo 2",
      order: 2,
      required: false,
      type: "textarea",
    },

    {
      name: "Campo 3",
      order: 3,
      required: false,
      type: "number",
    },
    {
      name: "Campo 4",
      order: 4,
      required: false,
      type: "date",
    },
    {
      name: "Campo 5",
      order: 5,
      required: false,
      type: "checkbox",
    },
  ])

  return (
    <div>
      <span>Campos</span>

      <div className="grid grid-cols-2 gap-4">
        {fields.map((field, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Field key={i} {...field} onChange={() => {}} />
        ))}
      </div>

      <Button
        onClick={() => {
          setFields([
            ...fields,
            {
              type: "text",
              name: "Campo novo",
              required: false,
              order: fields.length,
            },
          ])
        }}
      >
        Adicionar campo
      </Button>
    </div>
  )
}

type FieldProps = PartialFormField & {
  onChange: () => void
}

function Field({ type, name, onChange, required }: FieldProps) {
  return (
    <div className="rounded-sm bg-zinc-300 p-2">
      <div className="group flex items-center gap-2">
        <span>{name}</span>
        <PencilIcon className="size-0 transition-all group-hover:size-4" />
      </div>

      <div className="group flex items-center gap-2">
        <TypeComponent type={type} />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={required}
            onChange={onChange}
            className="mr-2"
          />
          Obrigatório
        </label>
      </div>
    </div>
  )
}

function TypeComponent({ type }: { type: FormField["type"] }) {
  const typeMap: Record<
    FormField["type"],
    { icon: JSX.Element; label: string }
  > = {
    text: { icon: <LetterTextIcon className="size-4" />, label: "Texto" },
    textarea: {
      icon: <ScrollTextIcon className="size-4" />,
      label: "Texto grande",
    },
    number: { icon: <FileDigitIcon className="size-4" />, label: "Número" },
    date: { icon: <CalendarFoldIcon className="size-4" />, label: "Data" },
    checkbox: {
      icon: <CheckCircle2Icon className="size-4" />,
      label: "Checkbox",
    },
  }

  const { icon, label } = typeMap[type]
  return (
    <>
      {icon}
      <span>{label}</span>
    </>
  )
}
