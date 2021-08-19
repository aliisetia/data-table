import { FunctionComponent } from "react";
import { Route as PageRoute } from "react-router-dom";

export interface IRoute {
  path: string;
  component: FunctionComponent;
}

export const routeFactory = (routes: Array<IRoute>) => {
  return routes.map(({ path, component }) => (
    <PageRoute key={path} path={path} exact={true} component={component} />
  ));
};
