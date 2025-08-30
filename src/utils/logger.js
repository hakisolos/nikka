import chalk from "chalk"

const LOG = {
  process: (ctx) => {
    console.log(chalk.blue(ctx))
  },
  warn: (ctx) => {
    console.log(chalk.yellow(ctx))
  },
  success: (ctx) => {
    console.log(chalk.green(ctx))
  },
  fail: (ctx) => {
    console.log(chalk.red(ctx))
  }
}

export default LOG
