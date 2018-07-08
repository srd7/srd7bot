import React                                      from "react";
import { Route }                                  from "react-router";

import InsideMain                                 from "app/front/component/inside/Main";

import Home                                       from "app/front/container/inside/Home";
import Counter                                    from "app/front/container/inside/Counter";
import Clients                                    from "app/front/container/inside/Clients";
import Accounts                                   from "app/front/container/inside/Accounts";
import BotJobs                                    from "app/front/container/inside/BotJobs";

import PNCMain                                    from "app/front/component/inside/pnc/Main";

import { initialize as initializeCounter }        from "app/front/action/CounterAction";
import { initialize as initializeTwitterClient }  from "app/front/action/TwitterClientAction";
import { initialize as initializeTwitterAccount } from "app/front/action/TwitterAccountAction";
import { initialize as initializeBotJob }         from "app/front/action/BotJobAction";

export default (
  <Route>
    <Route path="/" component={InsideMain}>
      <Route path="/"         components={{ content: Home }} />
      <Route path="/counter"  components={{ content: Counter }} action={initializeCounter} />
      <Route path="/clients"  components={{ content: Clients }} action={initializeTwitterClient} />
      <Route path="/accounts" components={{ content: Accounts }} action={initializeTwitterAccount} />
      <Route path="/actions"  components={{ content: BotJobs }} action={initializeBotJob} />
    </Route>
    <Route path="/pnc" component={PNCMain}>
    </Route>
  </Route>
);
