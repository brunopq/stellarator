import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes"

export default [
  layout("layouts/maxWidth.tsx", [
    ...prefix("form-templates", [
      index("routes/formTemplates.tsx"),
      route("new", "routes/newFormTemplate.tsx"),
    ]),
    ...prefix("submissions", [
      index("routes/submissions.tsx"),
      route("fill/:id", "routes/fillForm.tsx"),
    ]),
  ]),
] satisfies RouteConfig
