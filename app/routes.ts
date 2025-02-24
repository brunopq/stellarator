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
      route("edit/:id", "routes/editFormTemplate.tsx"),
    ]),
    ...prefix("fichas", [
      index("routes/fichas.tsx"),
      route("edit/:id", "routes/fillForm.tsx"),
    ]),
  ]),
] satisfies RouteConfig
