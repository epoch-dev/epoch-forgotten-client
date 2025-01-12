# Epoch: Forgotten - client

[![Deploy Epoch Forgotten client to Pages](https://github.com/epoch-dev/epoch-forgotten-client/actions/workflows/deployment.yaml/badge.svg)](https://github.com/epoch-dev/epoch-forgotten-client/actions/workflows/deployment.yaml)

## Installation

1. Get client generated in the service repo by moving `./generated` folder to `./src/common/api`.
2. Fetch `public` folder with static assets from the storage submodule with:

```
git submodule update --init --recursive
```

## Running

### Dev

Start locally:
```bash
yarn dev
```

### Stage

Start locally with staging server connection:
```bash
yarn stage
```

## Building

### Stage

To build for `stage` environment:
```bash
yarn build:stage
```

### Production

To build for `production` environment:
```bash
yarn build
```

## Troubleshooting

-   in case TS server don't picks up generated return types from api client reset it/reload window
