import routes                     from "app/front/route/OutsidePncRoute";
import configureStore             from "app/front/store/OutsidePncStore";
import createClient               from "app/entry/createClient";

createClient(routes, configureStore);
