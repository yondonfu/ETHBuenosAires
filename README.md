# ETHBuenosAires Intro to dApp Development Workshop

## Build

```
git clone https://github.com/yondonfu/ETHBuenosAires
cd ETHBuenosAires
npm install

npm install -g truffle
npm install -g ganache-cli
```

## Test

```
truffle test
```

## Run

```
# Run ganache in deterministic mode to use same accounts
ganache-cli -d

# Deploy contracts
truffle migrate --network ganache

# Run client
npm run client

# Mine blocks
npm run mine
```

