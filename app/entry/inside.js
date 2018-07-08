import routes                     from "app/front/route/InsideRoute";
import configureStore             from "app/front/store/InsideStore";
import createClient               from "app/entry/createClient";

createClient(routes, configureStore);
