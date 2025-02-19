import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes"

export default [
  layout("layouts/maxWidth.tsx", [
    index("routes/home.tsx"),
    route("form-templates/new", "routes/newFormTemplate.tsx"),
  ]),
] satisfies RouteConfig
