import { fileURLToPath } from 'url';
import fs from 'fs'
import path from 'path';
import debugFunc from 'debug'
const debug = debugFunc('foo-dog-attrs:cliTransformer')
import chalk from 'chalk';
const __filename = fileURLToPath(import.meta.url);
import { AttrsResolver } from './index.js'
import { parseArguments } from '@foo-dog/utils'
import util from 'util'
import stream from 'stream'

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

class CliTransformer extends stream.Transform {
  constructor(stdin) {
    super({ decodeStrings: true, encoding: 'utf-8', objectMode: true })
    debug('constructor')
    this.stdin = stdin
  }
  stack = ''
  _transform(chunk, enc, callback) {
    try {
      chunk = chunk.toString()
      debug('chunk=', chunk)
      let str = this.stack + chunk
      if (str.trim().length) {
        if (str.endsWith('\n\n')) {
          this.stack = ''
          if (this.stdin)
            this.push('\nrestart> ')
        }
        else {
          let obj
          try {
            obj = JSON.parse(str)
            debug('walking obj=', obj)
            const returnObj = walk(obj) || '<nothing returned>';
            debug('returnObj=', returnObj)
            this.push(util.inspect(returnObj, false, 55) + '\n')
            this.stack = ''
            // if (this.stdin)
            //   this.push('start> ')
          }
          catch (e) {
              this.stack += chunk.toString()
              // console.error('this.stack=', this.stack)
              if (this.stdin)
                this.push('\n' + str + '\ncont> ')
          }
        }
      }
      // else {
        callback()
      // }
    }
    catch (e) {
      this.push(chunk)
        callback(e)
    }
  
  }
}

export default CliTransformer