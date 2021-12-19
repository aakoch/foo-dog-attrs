import debugFunc from 'debug'
import compileAttrs from 'pug-attrs';
import pugRuntime from 'pug-runtime';
const debug = debugFunc('foo-dog-attrs')

class AttrsResolver {
  constructor() {
  }
  isCode(obj) {
    debug('isCode(): obj=', obj)
    return obj.hasOwnProperty('type') && (obj.type === 'code' || obj.type === 'unbuf_code')
  }
  isNotCode(obj) {
    debug('isNotCode(): this=', this)
    return !this.isCode(obj)
  }
  resolve(arr) {
    const code = arr.filter(this.isCode).map(obj => {
      return obj.val ?? ''
    }).join('\n')
    debug('code=', code)
    const resolver = new AttrResolver(code)
    return arr.filter(obj => !this.isCode.call(this, obj)).map(obj => {
      debug('start obj=', obj)
      if (obj.hasOwnProperty('attrs')) {
        if (Array.isArray(obj.attrs)) {
          obj.attrs = obj.attrs.map(attr => resolver.resolve.call(resolver, attr))
        } 
        else {
          throw new Error('attributes should be an array')
        }
      }
      debug('end obj=', obj)
      return obj
    })
  }
}

class AttrResolver {
  code
  constructor(code) {
    this.code = code
  }
  resolve(obj) {

    // let newAttrs = {}

      try {
        debug('this=', this)
        const code = (obj.code ?? '') + '\n' + (this.code ?? '')

        const func = Function(code + '; return ' + obj.val);

        console.log('func=', func.toString())

        const newAttrVal = func()
        console.log('newAttrVal=', newAttrVal)
        obj.val = newAttrVal

        delete obj.code

      //   debug('callAttrs: attrs=', obj.attrs)
    
      //   var result, finalResult;
      //   // HTML MODE
      //   result = compileAttrs([{ name: 'unbuf_code', val: 'var needsResolved = "candy"', mustEscape: false }], {
      //     terse:   true,
      //     format:  'object',
      //     runtime: function (name) { return 'pugRuntime.' + name; }
      //   });

      //   // result = compileAttrs(obj.attrs, {
      //   //   terse:   true,
      //   //   format:  'html',
      //   //   runtime: function (name) { return 'pugRuntime.' + name; }
      //   // });
      //   //=> '" foo=\\"bar\\"" + pugRuntime.attr("baz", getBaz(), true, true) + " quux"'
      //   debug('result=', result)
    
      //   finalResult = Function('pugRuntime', 'user', 'id', 'bar', 'baz', 'object', 'answer', 'return (' + result + ');' );
      //   debug('finalResult=', finalResult.toString())
    
      //   let attResult = finalResult(pugRuntime, obj).trim();
      //   // => ' foo="bar" baz="baz&lt;&gt;" quux'
      //   debug('attResult=', attResult)
      //   return attResult

        // const js = 'var needsResolved = "candy"'
        // const attrs = [{name: 'class', val: 'needsResolved'}]
        
        // const func = Function('param1', obj. + '; return ' + attrs[0].val);
        // console.log(func.toString())
        // const newAttrVal = func()
        // newAttrs[attrs.name] = newAttrVal

      } 
      catch (e) {
        console.error(e)
      }

    return obj
  }
}

export { 
  AttrResolver,
  AttrsResolver
}