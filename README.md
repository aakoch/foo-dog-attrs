
```
for f in $(ls test/json/*.json); do node src/cli $f build/$f 2> $f.err; done
find test/json/ -size 0c -exec rm {} \;
mv build/test/json/*.json ../generator/test/json/
```