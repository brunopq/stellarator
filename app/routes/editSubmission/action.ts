import type { Route } from "./+types"
import { z } from "zod"

import { submittedFieldSchema } from "~/.server/services/db/schema/submission"
import SubmissionService from "~/.server/services/SubmissionService"

const submittedFieldSchema2 = submittedFieldSchema.extend({
  dateValue: z.coerce.date({ coerce: true }).nullable(),
})

export async function action({ request, params }: Route.ActionArgs) {
  const submissionId = params.id

  const json = await request.json()

  console.log(json)

  const parsed = z.array(submittedFieldSchema2).parse(json)

  const updated = await SubmissionService.syncSubmittedFields(
    submissionId,
    parsed,
  )

  return updated
}
