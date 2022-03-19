import tap from 'tap'
import generator from '../../generator/src/index.js'
import { simpleProjectRootDir } from '@foo-dog/utils'
import fs from 'fs'
import path from 'path'
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const root = simpleProjectRootDir()

function readFiles(testName) {
  const expected = fs.readFileSync(path.resolve(root, `test/html/${testName}.expected.html`), 'utf8')
  const input = fs.readFileSync(path.resolve(root, `test/json/${testName}.json`), 'utf8')
  return [input, expected]
}

function runTest(testName, t) {
  try {
    const [input, expected] = readFiles(testName)
    // console.log('input=', input)
    const actual = generator.fromString(input)
    fs.writeFileSync(path.resolve(root, `build/${testName}.actual.html`), actual)
    t.equal(actual, expected, testName + " failed")
  }
  catch (e) {
    console.error('Test "' + testName + '" errored: ' + e.message)
  }
}


tap.test('checkbox', t=> {
  const input = [{"source":"/Users/aakoch/projects/new-foo/workspaces/lexing-transformer/test/pug/html5.pug","type":"doctype","val":"html","lineNumber":1},{"source":"/Users/aakoch/projects/new-foo/workspaces/lexing-transformer/test/pug/html5.pug","name":"input","type":"tag","attrs":[{"name":"type","val":"checkbox"},{"name":"checked","val":true}],"lineNumber":2},{"source":"/Users/aakoch/projects/new-foo/workspaces/lexing-transformer/test/pug/html5.pug","name":"input","type":"tag","attrs":[{"name":"type","val":"checkbox"},{"name":"checked","val":true}],"lineNumber":3},{"source":"/Users/aakoch/projects/new-foo/workspaces/lexing-transformer/test/pug/html5.pug","name":"input","type":"tag","attrs":[{"name":"type","val":"checkbox"},{"name":"checked","val":false}],"lineNumber":4}]
  const actual = generator.fromObject(input)
  t.equal(actual, '<!DOCTYPE html><input type="checkbox" checked><input type="checkbox" checked><input type="checkbox">', "checkbox test failed")
  t.end()
})
