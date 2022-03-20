import debugFunc from 'debug'
import util from 'util'

class AttrsResolver {
  debug
  attrResolver
  constructor() {
    this.debug = debugFunc('AttrsResolver')
    this.attrResolver = new AttrResolver()
  }
  isCode(obj) {
    // debug('isCode(): obj=', obj)
    return obj.hasOwnProperty('type') && (obj.type === 'code' || obj.type === 'unbuf_code')
  }
  isNotCode(obj) {
    this.debug('isNotCode(): this=', this)
    return !this.isCode(obj)
  }
  resolve(arr) {

    if (!Array.isArray(arr)) {
      throw new Error('AttrsResolver expects an array. Did you mean to call AttrResolver?')
    }

    const code = arr.filter(this.isCode).map(obj => {
      return obj.val ?? ''
    }).join('\n')
    this.debug('code=', code)
    return arr.filter(obj => !this.isCode.call(this, obj)).map(obj => {
      this.debug('start obj=', util.inspect(obj, false, 10))
      if (obj.hasOwnProperty('attrs')) {
        this.debug('obj has attrs')
        if (Array.isArray(obj.attrs)) {
          this.debug('obj.attrs is array')
          obj.attrs = obj.attrs.map(attr => {
            return this.attrResolver.resolve(attr, code)
            // return this.attrResolver.resolve.call(this.attrResolver, attr)
          })
        } 
        else {
          throw new Error('attributes should be an array')
        }
      }
      this.debug('end obj=', util.inspect(obj, false, 10))
      return obj
    })
  }
}

class AttrResolver {
  code
  debug = debugFunc('AttrResolver')
  constructor(code) {
    this.code = code
  }
  resolve(obj, codeParam) {
    this.debug('resolve(): obj=', util.inspect(obj, true, 5))
    this.debug('resolve(): typeof obj=' + typeof obj)

    if (Array.isArray(obj)) {
      throw new Error('AttrResolver expects an object. Did you mean to call AttrsResolver?')
    }

    // if (!obj.hasOwnProperty('name')) {
    //   throw new Error('AttrResolver expects an attribute object but this object doesn\'t have a name field')
    // }

    if (!obj.hasOwnProperty('val')) {
      obj.val = true
      // throw new Error('AttrResolver expects an attribute object but this object doesn\'t have a val field')
    }
    // let newAttrs = {}

      try {
        const code = (obj.code ?? '') + '\n' + (this.code ?? '') + '\n' + (codeParam ?? '')

        const func = Function(code + '; return ' + obj.val);

        this.debug('func=', func.toString())

        const newAttrVal = func()
        this.debug('newAttrVal=', newAttrVal)
        this.debug('typeof newAttrVal=', typeof newAttrVal)

        if (util.types.isDate(newAttrVal)) {
          this.debug('newAttrVal is a date')
          obj.val = newAttrVal.toISOString()
        }
        else if (newAttrVal.hasOwnProperty('toString')) {
          this.debug('newAttrVal.hasOwnProperty()')
          obj.val = newAttrVal.toString()
        }
        else if (typeof newAttrVal === 'object') {
          obj.val = JSON.stringify(newAttrVal)
        }
        else {
          obj.val = newAttrVal
        }

        delete obj.code

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