export interface IKey {
  [key: string]: string;
}

export interface IOpt {
  newData: string;
  token: string;
  tokenFinished: boolean;
  isEscaped: boolean;
  isQuotes: boolean;
  isReserved: boolean;
}

export const getKeyMap = (km: IKey) => {
  const newMap: IKey = {};
  Object.keys(km).forEach((key) => {
    newMap[km[key]] = key;
  });
  return newMap;
};

export const transformStream = (
  data: string,
  opt: IOpt,
  km: IKey | null = null,
  vm: IKey | null = null
) => {
  const pushToken = (char: string) => {
    opt.token += char;
  };

  const mergeToken = (type: number, char: string | null = null) => {
    char !== null && pushToken(char);
    let preToken = opt.token;
    let tokenID = opt.token.match(/"(.*?)"/)?.[1];
    if (tokenID !== undefined) {
      const replacer = type == 0 ? km?.[tokenID] : vm?.[tokenID];
      if (replacer !== undefined) {
        preToken = preToken.replace(tokenID, replacer);
      }
    }
    opt.newData += preToken;
    opt.token = "";
    opt.tokenFinished = false;
    opt.isReserved = false;
  };

  const preMerge = (type: number, char: string) => {
    if (!opt.isQuotes) {
      mergeToken(type, char);
    } else {
      pushToken(char);
    }
  };

  const prePush = (char: string) => {
    opt.isQuotes && pushToken(char);
  };

  for (let i = 0; i < data.length; i++) {
    const char = data[i];

    if (opt.isEscaped) {
      opt.isEscaped = false;
      pushToken(char);
      continue;
    }

    switch (char) {
      case '"': {
        if (opt.tokenFinished) {
          mergeToken(0);
        }
        if (opt.isQuotes) {
          opt.isQuotes = false;
          opt.tokenFinished = true;
        } else {
          opt.isQuotes = true;
          opt.tokenFinished = false;
        }
        pushToken(char);
        break;
      }
      case ",": {
        preMerge(1, char);
        break;
      }
      case "}": {
        preMerge(1, char);
        break;
      }
      case "]": {
        preMerge(1, char);
        break;
      }
      case "{": {
        preMerge(0, char);
        break;
      }
      case "[": {
        preMerge(0, char);
        break;
      }
      case " ": {
        if (opt.isQuotes) {
          pushToken(char);
        }
        break;
      }
      case "\\":
        opt.isEscaped = !opt.isEscaped;
        pushToken(char);
        break;
      case "\n":
        prePush("\\n");
        break;
      case "\r":
        prePush("\\r");
        break;
      case "\t":
        prePush("\\t");
        break;
      case "\b":
        prePush("\\b");
        break;
      case "\f":
        prePush("\\f");
        break;
      default: {
        if (!opt.isQuotes && !opt.isReserved) {
          mergeToken(0, char);
          opt.isReserved = true;
        } else {
          pushToken(char);
        }
        break;
      }
    }
  }

  mergeToken(1);

  return opt;
};

export const transform = (
  data: string,
  km: IKey | null = null,
  vm: IKey | null = null
) => {
  const opt: IOpt = {
    newData: "",
    token: "",
    tokenFinished: false,
    isEscaped: false,
    isQuotes: false,
    isReserved: false,
  };
  transformStream(data, opt, km, vm);
  return opt.newData;
};

export default {
  getKeyMap,
  transformStream,
  transform
};