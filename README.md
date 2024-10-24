# conspirafy

`conspirafy` helps your text get a lot more ~~paranoid~~ credible

## Usage

Install

```sh
npm i conspirafy
```

Consume as an ESM module

```typescript
import { conspirafy } from 'conspirafy';

const conspirafiedText = conspirafy('What about her emails?');

console.log(conspirafiedText);
// > wHaT ABouT hER EmAIls?
```

Or on the command line

```sh
npx conspirafy "Fluoride is mind control"
> fLUoriDE IS mInD COntRoL
```

You can also stream in and out of `conspirafy` using the `--stdin` (`-s` for short) and the `>` operator

```sh
cat ./a-text-file.txt | conspirafy -s > mYmAnifesto.txt
```
