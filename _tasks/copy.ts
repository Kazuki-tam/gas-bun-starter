const file = Bun.file("src/appsscript.json");
await Bun.write("dist/appsscript.json", file);
