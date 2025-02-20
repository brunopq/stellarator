import type { Route } from "./+types/newFormTemplate"
import { memo, useState, type JSX } from "react"
import { Select } from "radix-ui"
import { useFetcher } from "react-router"
import { useShallow } from "zustand/react/shallow"
import { combine } from "zustand/middleware"
import { create } from "zustand/react"
import {
  AsteriskIcon,
  CalendarFoldIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronDownIcon,
  FileDigitIcon,
  LetterTextIcon,
  PencilIcon,
  ScrollTextIcon,
  Trash2Icon,
} from "lucide-react/icons"

import FormTemplateService, {
  newFormTemplateWithFieldsSchema,
  type FormField,
} from "~/.server/services/FormTemplateService"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"

export async function loader() {
  return {}
}

export async function action({ request }: Route.ActionArgs) {
  console.log("action running hopefully")
  const body = await request.json()

  const parsed = newFormTemplateWithFieldsSchema.safeParse(body)

  if (!parsed.success) {
    console.log(parsed.error)
    return { error: "Invalid body" }
  }

  const a = await FormTemplateService.create(parsed.data)

  return {}
}

const useNewFormTemplateStore = create(
  combine(
    {
      templateName: "",
      templateDescription: "",
      fields: [] as PartialFormField[],
    },
    (set, get) => ({
      setTemplateName: (name: string) => set({ templateName: name }),
      setTemplateDescription: (description: string) =>
        set({ templateDescription: description }),
      addField: () =>
        set((state) => ({
          fields: [
            ...state.fields,
            {
              id: Math.random(),
              order: state.fields.length + 1,
              name: "Campo novo",
              type: "text",
              required: false,
            },
          ],
        })),
      setFieldName: (id: number, name: string) =>
        set((state) => ({
          fields: state.fields.map((field) =>
            field.id === id ? { ...field, name } : field,
          ),
        })),
      setFieldType: (id: number, type: PartialFormField["type"]) =>
        set((state) => ({
          fields: state.fields.map((field) =>
            field.id === id ? { ...field, type } : field,
          ),
        })),
      setFieldRequired: (id: number, required: boolean) =>
        set((state) => ({
          fields: state.fields.map((field) =>
            field.id === id ? { ...field, required } : field,
          ),
        })),
      removeField: (id: number) =>
        set((state) => ({
          fields: state.fields.filter((field) => field.id !== id),
        })),
    }),
  ),
)

export default function NewFormTemplate({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()

  const [name, description, setDescription, setName] = useNewFormTemplateStore(
    useShallow((s) => [
      s.templateName,
      s.templateDescription,
      s.setTemplateDescription,
      s.setTemplateName,
    ]),
  )

  function handleSaveForm() {
    const state = useNewFormTemplateStore.getState()
    fetcher.submit(
      {
        name: state.templateName,
        description: state.templateDescription,
        formFields: state.fields,
      },
      { method: "POST", encType: "application/json" },
    )

    console.log(state)
  }

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Novo template</h1>

        <Button onClick={handleSaveForm}>Salvar</Button>
      </header>

      <div>
        <div className="grid grid-cols-2 gap-4">
          <label>
            <span>Nome</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome..."
              type="text"
            />
          </label>

          <label>
            <span>Descrição</span>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descição..."
              type="text"
            />
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

const Fields = memo(() => {
  const [fields, addField] = useNewFormTemplateStore(
    useShallow((s) => [s.fields, s.addField]),
  )

  return (
    <div className="grid grid-cols-2 gap-12">
      <div>
        <h3 className="mb-4 font-semibold text-xl">Campos</h3>

        <div className="space-y-4">
          {fields.map((field) => (
            <Field key={field.id} id={field.id} />
          ))}
        </div>

        <Button className="mt-8" onClick={addField}>
          Adicionar campo
        </Button>
      </div>

      <div className="min-w-0">
        <h3 className="mb-4 font-semibold text-xl">Prévia</h3>

        <FormTemplatePreview />
      </div>
    </div>
  )
})

type FieldProps = { id: number }

const Field = memo(({ id }: FieldProps) => {
  const [field, setFieldRequired, removeField] = useNewFormTemplateStore(
    useShallow((s) => [
      s.fields.find((f) => f.id === id),
      s.setFieldRequired,
      s.removeField,
    ]),
  )

  if (!field) {
    return null
  }

  return (
    <div className="grid max-w-md grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 overflow-hidden rounded-sm border border-zinc-300 px-2 py-1 shadow-sm dark:border-zinc-800">
      <strong className="text-sm text-zinc-500 dark:text-zinc-400">
        Campo:
      </strong>

      <NameInput id={id} name={field.name} />

      <strong className="text-sm text-zinc-500 dark:text-zinc-400">
        Tipo:
      </strong>

      <div className="group flex items-center gap-2">
        <TypeSelect id={id} value={field.type} />
      </div>

      <strong className="text-sm text-zinc-500 dark:text-zinc-400">
        Obrigatório:
      </strong>
      <div className="flex items-center justify-between gap-2">
        <label className="flex w-fit select-none items-center gap-2 rounded-md px-2 py-0.5 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-800">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => setFieldRequired(id, e.target.checked)}
            className=""
          />
          {field.required ? "Sim" : "Não"}
        </label>

        <button
          type="button"
          onClick={() => removeField(id)}
          className="group flex cursor-pointer items-center gap-2 rounded-sm p-0.5 pl-2 text-red-400 text-sm transition-colors *:transition-all hover:bg-red-200 hover:text-red-700 dark:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-200"
        >
          <span className="opacity-0 transition group-hover:opacity-100">
            Remover
          </span>
          <Trash2Icon className="size-4" />
        </button>
      </div>
    </div>
  )
})

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
}

function TypeSelect({ id, value }: TypeSelectProps) {
  const setFieldType = useNewFormTemplateStore((s) => s.setFieldType)

  return (
    <Select.Root
      onValueChange={(value) => setFieldType(id, value as FormField["type"])}
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
}

function NameInput({ id, name }: NameInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const setFieldName = useNewFormTemplateStore((s) => s.setFieldName)

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        type="button"
        className="group flex min-w-0 max-w-full cursor-pointer items-center gap-2 rounded-md px-2 py-0.5 outline-0 hover:bg-zinc-300 focus-visible:bg-zinc-300 dark:focus-visible:bg-zinc-800 dark:hover:bg-zinc-800"
      >
        <span className="overflow-hidden overflow-ellipsis">{name}</span>
        <div>
          <PencilIcon className="size-0 transition-all group-hover:size-4" />
        </div>
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
          setFieldName(id, e.target.value)
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

function FormTemplatePreview() {
  const fields = useNewFormTemplateStore((s) => s.fields)

  return (
    <div className="w-lg space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="">
          <strong className="-mb-0.5 relative inline-block text-sm text-zinc-700 dark:text-zinc-400">
            <span className="overflow-hidden overflow-ellipsis">
              {field.name}
            </span>
            {field.required && (
              <AsteriskIcon className="-translate-y-1/6 absolute top-0 right-0 size-3.5 translate-x-4/5 text-red-500 dark:text-red-400" />
            )}
          </strong>
          <label>
            {(field.type === "text" && (
              <Input placeholder={`${field.name}...`} type="text" />
            )) ||
              (field.type === "number" && (
                <Input placeholder={`${field.name}...`} type="number" />
              )) ||
              (field.type === "textarea" && (
                <Textarea placeholder={`${field.name}...`} />
              )) ||
              (field.type === "date" && (
                <Input placeholder={`${field.name}...`} type="date" />
              )) ||
              (field.type === "checkbox" && (
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>{field.name}</span>
                </label>
              ))}
          </label>
        </div>
      ))}
    </div>
  )
}
