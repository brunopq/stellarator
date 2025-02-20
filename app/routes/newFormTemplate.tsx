import type { Route } from "./+types/newFormTemplate"
import { Select } from "radix-ui"
import { useState, type JSX } from "react"
import {
  CalendarFoldIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronDownIcon,
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

type PartialFormField = Omit<FormField, "id" | "formTemplateId"> & {
  id: number
}

function Fields() {
  const [fields, setFields] = useState<PartialFormField[]>([
    {
      id: Math.random(),
      name: "Campo 1",
      order: 1,
      required: true,
      type: "text",
    },
    {
      id: Math.random(),
      name: "Campo 2",
      order: 2,
      required: false,
      type: "textarea",
    },

    {
      id: Math.random(),
      name: "Campo 3",
      order: 3,
      required: false,
      type: "number",
    },
    {
      id: Math.random(),
      name: "Campo 4",
      order: 4,
      required: false,
      type: "date",
    },
    {
      id: Math.random(),
      name: "Campo 5",
      order: 5,
      required: false,
      type: "checkbox",
    },
  ])

  function handleChange(
    id: number,
    field: keyof PartialFormField,
    value: PartialFormField[typeof field],
  ) {
    setFields((fields) =>
      fields.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    )
  }

  return (
    <div className="grid grid-cols-[auto_1fr] gap-12">
      <div>
        <h3 className="mb-4 font-semibold text-xl">Campos</h3>

        <div className="space-y-4">
          {fields.map((field) => (
            <Field key={field.id} {...field} onChange={handleChange} />
          ))}
        </div>

        <Button
          className="mt-8"
          onClick={() => {
            setFields([
              ...fields,
              {
                id: Math.random(),
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

      <div>
        <h3 className="mb-4 font-semibold text-xl">Prévia</h3>

        <div className="space-y-4">prévia do formulário</div>
      </div>
    </div>
  )
}

type FieldProps = PartialFormField & {
  onChange: (
    id: number,
    field: keyof PartialFormField,
    value: PartialFormField[typeof field],
  ) => void
}

function Field({ id, type, name, onChange, required }: FieldProps) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 rounded-sm border border-zinc-300 p-2 shadow-sm dark:border-zinc-800">
      <strong className="text-sm text-zinc-500 dark:text-zinc-400">
        Campo:
      </strong>

      <NameInput id={id} name={name} onChange={onChange} />

      <strong className="text-sm text-zinc-500 dark:text-zinc-400">
        Tipo:
      </strong>

      <div className="group flex items-center gap-2">
        <TypeSelect id={id} value={type} onChange={onChange} />
      </div>

      <strong className="text-sm text-zinc-500 dark:text-zinc-400">
        Obrigatório:
      </strong>
      <label className="flex w-fit select-none items-center gap-2 rounded-md px-2 py-0.5 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-800">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => onChange(id, "required", e.target.checked)}
          className=""
        />
        {required ? "Sim" : "Não"}
      </label>
    </div>
  )
}

const typeMap: Record<FormField["type"], JSX.Element> = {
  text: (
    <div className="flex items-center gap-2">
      <span>Texto</span>
      <LetterTextIcon className="size-4" />
    </div>
  ),
  textarea: (
    <div className="flex items-center gap-2">
      <span>Texto grande</span>
      <ScrollTextIcon className="size-4" />
    </div>
  ),
  number: (
    <div className="flex items-center gap-2">
      <span>Número</span>
      <FileDigitIcon className="size-4" />
    </div>
  ),
  date: (
    <div className="flex items-center gap-2">
      <span>Data</span>
      <CalendarFoldIcon className="size-4" />
    </div>
  ),
  checkbox: (
    <div className="flex items-center gap-2">
      <span>Checkbox</span>
      <CheckCircle2Icon className="size-4" />
    </div>
  ),
}

type TypeSelectProps = {
  id: number
  value: FormField["type"]
  onChange: FieldProps["onChange"]
}

function TypeSelect({ id, value, onChange }: TypeSelectProps) {
  return (
    <Select.Root
      onValueChange={(value) =>
        onChange(id, "type", value as FormField["type"])
      }
      value={value}
    >
      <Select.Trigger className="group flex items-center justify-between gap-4 rounded-md px-2 py-0.5 outline-0 transition-colors hover:bg-zinc-300 focus-visible:bg-zinc-300 data-[state='open']:bg-zinc-300 dark:data-[state='open']:bg-zinc-800 dark:focus-visible:bg-zinc-800 dark:hover:bg-zinc-800">
        <Select.Value placeholder="Selecione..." />
        <Select.Icon className="">
          <ChevronDownIcon className="size-0 transition-all group-hover:size-5 group-focus:size-5 group-data-[state='open']:size-5" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          className="mt-2 space-y-0.5 rounded-md border border-zinc-400/50 bg-zinc-300 p-0.5 shadow-md dark:border-zinc-700/50 dark:bg-zinc-800"
        >
          {Object.entries(typeMap).map(([key, value]) => (
            <Select.Item
              className="rounded-sm px-1 py-0.5 outline-0 transition-colors hover:bg-zinc-400 data-[state='checked']:bg-primary-400 data-[state='checked']:hover:bg-primary-500 dark:data-[state='checked']:bg-primary-700/50 dark:hover:bg-zinc-700 dark:hover:data-[state='checked']:bg-primary-800"
              key={key}
              value={key}
            >
              <Select.ItemText>{value}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

type NameInputProps = {
  id: number
  name: string
  onChange: (id: number, field: "name", value: string) => void
}

function NameInput({ id, name, onChange }: NameInputProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        type="button"
        className="group flex w-fit items-center gap-2 rounded-md px-2 py-0.5 outline-0 hover:bg-zinc-300 focus-visible:bg-zinc-300 dark:focus-visible:bg-zinc-800 dark:hover:bg-zinc-800"
      >
        <span>{name}</span>
        <PencilIcon className="size-0 transition-all group-hover:size-4" />
      </button>
    )
  }

  return (
    <div className="flex w-full rounded-md bg-primary-300 p-0.5 pl-2 dark:bg-primary-800/50 ">
      <input
        className="flex-1 outline-0"
        type="text"
        value={name}
        onChange={(e) => {
          onChange(id, "name", e.target.value)
        }}
        onBlur={() => setIsEditing(false)}
      />
      <button
        type="button"
        className="cursor-pointer rounded-sm bg-zinc-400/25 p-1 transition-colors hover:bg-zinc-400/50"
        onClick={() => setIsEditing(false)}
      >
        <CheckIcon className="size-4" />
      </button>
    </div>
  )
}
