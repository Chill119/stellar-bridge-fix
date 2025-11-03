export interface StellarToken {
  code: string;
  name: string;
  issuer?: string;
  sorobanContract?: string;
  isNative?: boolean;
}

export const STELLAR_TOKENS: StellarToken[] = [
  {
    code: "XLM",
    name: "Stellar Lumens",
    sorobanContract: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA",
    isNative: true,
  },
  {
    code: "DBTK",
    name: "DBTK Token",
    issuer: "GCXOBFWSCCEVETJD4RODO465BRTVHHZKYBA6QXHJTSGOWDUE33LOJVCO",
    sorobanContract: "CDVMWOSNI7VRZTGILOGJXCGJ3URUENAGBCBKAZUVKGN7D4TMS77Y4E4X",
  },
  {
    code: "BUCK",
    name: "BUCK Token",
    issuer: "GDZGJY4YNJVU34BJCKASDMV735EBUDCI5F52BQVB2LDMFYGZBZN7X2B4",
    sorobanContract: "CBCR3AQSSYV2GWOQHSQ6HIFQYWOZTOPZT4JRQY5AIRZKMHET5UBD4WQA",
  },
  {
    code: "DIME",
    name: "DIME Token",
    issuer: "GCFB3RNT7VRO2IYX4QHISAOTK2FRJLR4MZLTZC4JRX37NRINLP5CBUNJ",
    sorobanContract: "CDSJPARJXWJB4LUSGHL26LPWNCGUXTJ5VVKUR27WEDPPKJUIOIMCUKUZ",
  },
  {
    code: "DGBP",
    name: "DGBP Token",
    issuer: "GBI7OH3AQ4AA2CBYJVPN6EIWV3GJPAVUVDNF3I7XPFVPOJBWK7LRI6BH",
  },
  {
    code: "USDC",
    name: "USD Coin",
    sorobanContract: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
  },
  {
    code: "PYPL",
    name: "PYPL Token",
  },
  {
    code: "JPMD",
    name: "JPMD Token",
  },
];

export const getTokenByCode = (code: string): StellarToken | undefined => {
  return STELLAR_TOKENS.find(token => token.code === code);
};
