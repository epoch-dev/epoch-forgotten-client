# Epoch: Forgotten - client

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
