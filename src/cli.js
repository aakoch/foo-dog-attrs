import { fileURLToPath } from 'url';
import fs from 'fs'
import path from 'path';
import debugFunc from 'debug'
const debug = debugFunc('foo-dog-attrs:cli')
import chalk from 'chalk';
import util from 'util'
const __filename = fileURLToPath(import.meta.url);
import { AttrResolver, AttrsResolver } from './index.js'
import { parseArguments } from '@foo-dog/utils'

function printUsage() {
  const help = [''];
  const p = str => help.push(str ?? '')
  const b = str => help.push(chalk.bold(str))
  b("Foo-Dog Attrs")
  p()
  b('Usage')
  p(chalk.blue('node ' + path.basename(__filename) + ' [-h] [inFile] [outFile]'))
  p('inFile and outFile are both optional and will default to stdin and stdout if omitted.')
  p('You can also use "-" for inFile and outFile for their respective streams.')
  p()

  console.log(help.join('\n'))
}

const attrsResolver = new AttrsResolver()

function walk(arr) {
  debug('walk: arr=', util.inspect(arr, false, 10))
  if (Array.isArray(arr)) {
    attrsResolver.resolve(arr)
    arr.forEach(element => {
      debug('loop: element=', util.inspect(element, false, 10))
      if (element.hasOwnProperty('children')) {
        debug('loop: element has children=', util.inspect(element.children, false, 10))
        walk(element.children)
      }
    })
  }
  return arr
}


async function run() {
  const options = await parseArguments(process, printUsage)
  // console.log(options)
  try {
    if (options.in.name == 'stdin') {
      while(true) {
        let str = process.stdin.read();
        const inObj = JSON.parse(str)
        const obj = walk(inObj)
        let jsonString
        if (options.out == 'stdout') {
          jsonString = JSON.stringify(obj, null, '  ')
          process.stdout.write(jsonString)
        }
        else {
          jsonString = JSON.stringify(obj);
          fs.writeFileSync(options.out, jsonString)
        }
      }
    }
    else {
      const inObj = JSON.parse(fs.readFileSync(options.in.name, 'utf-8'))
      const obj = walk(inObj)
      if (options.out) {
        let str
        if (options.out.name == 'stdout') {
          str = JSON.stringify(obj, null, '  ')
          process.stdout.write(str)
        }
        else {
          str = JSON.stringify(obj);
          fs.writeFileSync(options.out.name, str)
        }
      }
    }
  } catch (e) {
    if (chalk.stderr.supportsColor) {
      console.error(chalk.stderr(chalk.red(e.message)))
      console.error(e)
    }
    else {
      console.error('*'.repeat(30) + '\n' + e.message)
      console.error(e)
    }
  }
}

run()