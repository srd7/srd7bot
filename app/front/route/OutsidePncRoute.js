import React         from "react";
import { Route }     from "react-router";

import Main          from "app/front/component/outside/pnc/Main";
import MypageMain    from "app/front/component/outside/pnc/mypage/Main";

import MypageIndex   from "app/front/container/outside/pnc/mypage/Index";
import MypagePoint   from "app/front/container/outside/pnc/mypage/Point";

import { confirmAccessKey } from "app/front/action/PNCAccessKeyAction";
import { initialize as initializePNCPointLog } from "app/front/action/PNCPointLogAction";

export default (
  <Route>
    <Route path="/pnc" component={Main}>
      <Route path="index" />
    </Route>
    <Route path="/pnc/mypage/:accessKey" component={MypageMain} action={confirmAccessKey}>
      <Route path="index" components={{ content: MypageIndex }} />
      <Route path="point" components={{ content: MypagePoint }} action={initializePNCPointLog} />
    </Route>
  </Route>
);
