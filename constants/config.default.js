exports.snoowrap = {
  clientSecret: '',
  userAgent: ``,
  clientId: '',
  username: '',
  password: ''
};

exports.database = {
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'xyfir_market',
    dateStrings: true,
    connectionLimit: 100,
    supportBigNumbers: true,
    waitForConnections: true
  }
};

exports.environment = {
  type: 'dev'
};

exports.keys = {
  coinbase: {
    pub: '',
    prv: ''
  }
};

exports.ids = {
  coinbaseAccounts: {
    BTC: '',
    LTC: '',
    ETH: ''
  },
  addresses: {
    BTC: '',
    LTC: '',
    ETH: ''
  },
  reddit: {
    sub: '',
    user: ''
  }
};
