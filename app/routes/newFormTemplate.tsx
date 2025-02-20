import type { Route } from "./+types/newFormTemplate"
import { Select } from "radix-ui"
import { useState, type JSX } from "react"
import {
  CalendarFoldIcon,
  CheckCircle2Icon,
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
        className="mt-8"
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
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 rounded-sm border border-zinc-300 p-2 shadow-sm dark:border-zinc-800">
      <strong className="text-sm text-zinc-500 dark:text-zinc-400">
        Campo:
      </strong>

      <div className="group flex w-fit items-center gap-2 rounded-md px-2 py-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-800">
        <span>{name}</span>
        <PencilIcon className="size-0 transition-all group-hover:size-4" />
      </div>

      <strong className="text-sm text-zinc-500 dark:text-zinc-400">
        Tipo:
      </strong>

      <div className="group flex items-center gap-2">
        <Select.Root value={type}>
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
      </div>

      <strong className="text-sm text-zinc-500 dark:text-zinc-400">
        Obrigatório:
      </strong>
      <div className="flex w-fit items-center gap-2 rounded-md px-2 py-0.5 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-800">
        <input
          type="checkbox"
          checked={required}
          onChange={onChange}
          className=""
        />
        {required ? "Sim" : "Não"}
      </div>
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
