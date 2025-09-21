### Overview
**`jmin`** is a lightweight JavaScript utility for transforming structured string data—like JSON—by replacing token identifiers using customizable key maps. It’s ideal for scenarios where you need to minify, obfuscate, or rewrite tokenized data streams.

---

### ✨ Features
- 🔄 Bidirectional key mapping via `getKeyMap`
- 🧠 Intelligent token parsing with escape and quote handling
- 🔧 Stream transformation with optional key/value replacement

---

### 📦 Installation

```bash
npm install jmin
```

---

### 🔧 Usage

```ts
import { transform, getKeyMap } from 'jmin';

const keyMap = {
  user: 'u1',
  admin: 'a1',
};

const reverseMap = getKeyMap(keyMap);

const input = '{"role": "user", "type": "admin"}';

const output = transform(input, keyMap, reverseMap);

console.log(output);
// Output: '{"role": "u1", "type": "a1"}'
```

---

### 🧩 API

#### `transform(data: string, km?: IKey, vm?: IKey): string`
Transforms the input string by replacing tokens using the provided key map (`km`) and value map (`vm`).

#### `getKeyMap(km: IKey): IKey`
Returns a reversed key map for value-to-key lookup.
