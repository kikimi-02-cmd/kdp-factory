const [, , cmd, ...rest] = process.argv;

function help() {
  console.log(`kdp-factory CLI

  generate --category <name> --count <n>    Generate N books in category
  list-categories                            Show available categories
  --help                                     Show this help
`);
}

async function main() {
  switch (cmd) {
    case "list-categories":
      console.log(["sudoku", "word-search", "coloring", "journal", "crossword"].join("\n"));
      return;
    case "generate":
      console.log("generate: not yet implemented (Phase 1 milestone M+3)");
      console.log("args:", rest);
      process.exit(0);
    case undefined:
    case "--help":
    case "-h":
      help();
      return;
    default:
      console.error(`Unknown command: ${cmd}`);
      help();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
