import "@fontsource/bitter/latin-400.css";
import "@fontsource/bitter/latin-700.css";
import { createRouter } from "./router";
import { showAgency, showStateLocal } from "./steps/agency";
import { showAbout, showStart } from "./steps/placeholders";
import { showWhere } from "./steps/where";
import { showWhatHappened } from "./steps/whatHappened";
import { showWhatYouNeed } from "./steps/whatYouNeed";
import { showReview } from "./steps/review";
import { showSend } from "./steps/send";

// Pages render into the reading column inside <main>.
const main = document.getElementById("page");
if (!main) throw new Error("Missing #page");

const router = createRouter(main, {
  start: showStart,
  about: showAbout,
  where: showWhere,
  agency: showAgency,
  "state-local": showStateLocal,
  "what-happened": showWhatHappened,
  "what-you-need": showWhatYouNeed,
  review: showReview,
  send: showSend,
});

router.start();
