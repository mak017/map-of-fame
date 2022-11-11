<script>
import { Router } from "@roxi/routify";
import { routes } from "../../.routify/routes";

import { initApp } from "./init";
import { adjustVhProp } from "./utils/commonUtils";

adjustVhProp();

initApp();
</script>

<Router {routes} />
