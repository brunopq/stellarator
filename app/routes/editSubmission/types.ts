export type BaseFilledField = {
  templateFieldId: string
  fieldName: string
  fieldRequired: boolean
  order: number
}

export type FilledField = BaseFilledField &
  (
    | { type: "text"; value?: string }
    | { type: "textarea"; value?: string }
    | { type: "number"; value?: number }
    | { type: "date"; value?: Date }
    | { type: "checkbox"; value?: boolean }
  )
