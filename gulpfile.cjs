/* USWDS Compile: Sass → CSS, plus fonts and images, into public/ for Vite. */
const uswds = require("@uswds/compile");

uswds.settings.version = 3;
uswds.settings.compile.browserslist = ["defaults", "not dead"];

uswds.paths.dist.theme = "./src/sass";
uswds.paths.src.projectSass = "./src/sass";
uswds.paths.dist.css = "./public/uswds/css";
uswds.paths.dist.fonts = "./public/uswds/fonts";
uswds.paths.dist.img = "./public/uswds/img";
uswds.paths.dist.js = "./public/uswds/js";
uswds.paths.dist.components = "./public/uswds/components";

exports.init = uswds.init;
exports.compile = uswds.compile;
exports.watch = uswds.watch;
exports.default = uswds.compile;
