# Foo-Dog Attributes

## TODO
- fix classnames: [&quot;class1&quot;,&quot;class2&quot;]

```
for f in $(ls test/json/*.json); do node src/cli $f build/$f 2> $f.err; done
find build/ -size 0c -exec rm {} \;
mv build/test/json/*.json ../generator/test/json/
```

More recent:
```
cd foo-dog-attrs
rm -rf build/ && mkdir build && cp -R ../pug-lexing-transformer/build/*.json build
for f in $(ls build/*.json); do node src/cli $f build/$f 2> $f.err; done
```