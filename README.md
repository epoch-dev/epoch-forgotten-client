# Epoch: Forgotten - client

[![PR check](https://github.com/epoch-dev/epoch-forgotten-client/actions/workflows/deployment.yaml/badge.svg?event=pull_request)](https://github.com/epoch-dev/epoch-forgotten-client/actions/workflows/deployment.yaml)
[![Deploy Epoch Forgotten client to Pages](https://github.com/epoch-dev/epoch-forgotten-client/actions/workflows/deployment.yaml/badge.svg)](https://github.com/epoch-dev/epoch-forgotten-client/actions/workflows/deployment.yaml)

### Installation

1. Get client generated in the service repo by moving `./generated` folder to `./src/common/api`.
2. Fetch `public` folder with static assets from the storage submodule with:

```
git submodule update --init --recursive
```

### Running

Start locally with:

```
yarn dev
```

### Troubleshooting

-   in case TS server don't picks up generated return types from api client reset it/reload window
