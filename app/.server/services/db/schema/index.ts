import * as templateSchema from "./template"
import * as submissionSchema from "./submission"
import * as fieldTypeSchema from "./fieldType"

export default {
  ...templateSchema,
  ...submissionSchema,
  ...fieldTypeSchema,
}
