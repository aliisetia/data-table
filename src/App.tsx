import { BrowserRouter, Switch, Route } from "react-router-dom";

import { TablePage } from "components/DataTable/page";
import { ZonkPage } from "components/Zonk/page";
import { IRoute as AppRoute, routeFactory } from "router/routeFactory";
import "./App.scss";

const ROUTES: Array<AppRoute> = [
  {
    path: "/",
    component: TablePage,
  },
  {
    path: "/zonk",
    component: ZonkPage,
  },
];

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: "90%", padding: 32 }} className="data-table">
          <BrowserRouter>
            <Switch>
              {routeFactory(ROUTES)}
              {/* 404 (not found path) will be redirected to Home page temporarily */}
              <Route component={TablePage} />
            </Switch>
          </BrowserRouter>
        </div>
      </header>
    </div>
  );
}

export default App;
