import tap from 'tap'
import { AttrResolver, AttrsResolver } from '../src/index.js'

tap.test('empty object', t => {
  const resolver = new AttrsResolver()
  const actual = resolver.resolve([{}])
  t.same(actual, [{}])
  t.end()
})

tap.test('simple', t => {
  const resolver = new AttrResolver('var i = 1')
  const actual = resolver.resolve({ name: 'someAttr', val: 'i' })
  t.same(actual, { name: 'someAttr', val: 1 })
  t.end()
})

tap.test('simple arr', t => {
  const resolver = new AttrsResolver()
  const actual = resolver.resolve([{ attrs: [{ code: 'var i = 1', name: 'someAttr', val: 'i' }] }])
  t.same(actual, [{ attrs: [{ name: 'someAttr', val: 1 }] }])
  t.end()
})

tap.test('attr-es2015', t => {
  const resolver = new AttrsResolver()
  const actual = resolver.resolve([
    { 
      "source": "../lexing-transformer/test/pug/attr-es2015.pug", "type": "code", "val": "var avatar = '219b77f9d21de75e81851b6b886057c7'", "lineNumber": 1 },
    { 
      "source": "../lexing-transformer/test/pug/attr-es2015.pug", "name": "div", "type": "tag", "attrs": [{ "name": "class", "val": "\"avatar-div\"" }, { "name": "style", "val": "`background-image: url(https://www.gravatar.com/avatar/${avatar})`" }], "lineNumber": 3 }])
  t.same(actual, [
    {
      "source": "../lexing-transformer/test/pug/attr-es2015.pug",
      "name": "div",
      "type": "tag",
      "attrs": [
        {
          "name": "someAttr",
          "val": 1,
          "name": "class",
          "val": "avatar-div",
        },
        {
          "name": "style",
          "val": "background-image: url(https://www.gravatar.com/avatar/219b77f9d21de75e81851b6b886057c7)",
        },
      ],
      "lineNumber": 3,
    },
  ])
  t.end()
})

tap.test('attrs-data', t => {
  const resolver = new AttrResolver()
  const actual = resolver.resolve({ name: 'data-epoc', val: 'new Date(0)' })
  t.same(actual, { name: 'data-epoc', val: '1970-01-01T00:00:00.000Z' })
  t.end()
})

tap.test('include-with-text', t => {
  const resolver = new AttrResolver()
  const actual = resolver.resolve({"name":"src","val":"'/app.js'"})
  t.same(actual, { name: 'src', val: '/app.js' })
  t.end()
})

tap.test('include-with-text 2', t => {
  const resolver = new AttrsResolver()
  const actual = resolver.resolve([{"attrs": [
    {
      "name": "src",
      "val": "'/app.js'"
    }
  ]}])
  t.same(actual, [{ attrs: [{ name: 'src', val: '/app.js' }]}])
  t.end()
})

tap.test('tag with nothing to resolve', t => {
  const resolver = new AttrsResolver()
  const givenAndExpected = [{ type: 'tag', name: 'html' }]
  const actual = resolver.resolve(givenAndExpected)
  t.same(actual, givenAndExpected)
  t.end()
})

tap.test('attributes with nothing to resolve', t => {
  const resolver = new AttrsResolver()
  const given = [{ type: 'tag', name: 'html', 'attrs': [{name: 'class', val: '"aclass"', mustEscape: false}] }]
  const actual = resolver.resolve(given)
  t.same(actual,[
       {
        "type": "tag",
        "name": "html",
        "attrs":  [
           {
            "name": "class",
            "val": "aclass",
            "mustEscape": false,
          },
        ],
      },
    ])
  t.end()
})

tap.test('attributes with something to resolve', t => {
  const resolver = new AttrsResolver()
  const given = [
    { type: 'unbuf_code', val: 'var needsResolved = "candy"' },
    { type: 'tag', name: 'html', 'attrs': [{name: 'class', val: 'needsResolved', mustEscape: false}] }
  ]
  const actual = resolver.resolve(given)
  t.same(actual,[
       {
        "type": "tag",
        "name": "html",
        "attrs":  [
           {
            "name": "class",
            "val": "candy",
            "mustEscape": false,
          },
        ],
      },
    ])
  t.end()
})

tap.test(`[ { name: 'href', val: "'/contact'" } ]`, t => {
  const resolver = new AttrsResolver()
  const given = [ { name: 'href', val: "'/contact'" } ]
  const actual = resolver.resolve(given)
  t.same(actual,[
       {
        "name": "href",
        "val": "'/contact'"
      },
    ])
  t.end()
})

tap.test('Test an object passed to AttrsResolver throws error', t => {
  const resolver = new AttrsResolver()
  t.throws(() => resolver.resolve({}))
  t.end()
})

tap.test('Test attrs as something other than an array throws error', t => {
  const resolver = new AttrsResolver()
  t.throws(() => resolver.resolve([{attrs: {}}]))
  t.end()
})

// tap.test('pug runtime', t => {

//   // const lexed= [
// //   {
// //     type: 'tag',
// //     loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
// //     val: 'p'
// //   },
// //   {
// //     type: 'text',
// //     loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 15 } },
// //     val: 'Hello world!'
// //   },
// //   {
// //     type: 'eos',
// //     loc: { start: { line: 1, column: 15 }, end: { line: 1, column: 15 } }
// //   }
// // ]

// const lexed =     [{
//   type: 'start-attributes',
//   loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 3 } }
// },
// {
//   type: 'attribute',
//   loc: { start: { line: 2, column: 3 }, end: { line: 2, column: 16 } },
//   name: 'class',
//   val: 'someVar',
//   mustEscape: true
// },
// {
//   type: 'end-attributes',
//   loc: { start: { line: 2, column: 16 }, end: { line: 2, column: 17 } }
// },
// {
//   type: 'eos',
//   loc: { start: { line: 2, column: 27 }, end: { line: 2, column: 27 } }
// }]

//   // const lexed = lex('- var someVar = "test"\np(class=someVar) Test para')
//   // console.log('lexed=', inspect(lexed, false, 20, true));
//   const parsed = parse(lexed)
//   console.log('parsed=', inspect(parsed, false, 20, true));
//   var funcStr = generateCode(parsed);
//   //=> 'function helloWorld(locals) { ... }'

//   console.log('funcStr=\n', funcStr, '\n***********************');
//     var func = wrap(funcStr, 'template');
//     console.log('func=\n', func.toString());
//     console.log('func()=', func());
//     console.log('runtime=', runtime);
//   t.end()
// })

// function wrap(template, templateName = 'template') {
//   return Function(
//     'pug',
//     template + '\n' + 'return ' + templateName + ';'
//   )(runtime);
// }


