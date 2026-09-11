# cky-editor demo

An Angular 21 application that showcases `cky-editor`. It installs the library from `../dist/cky-editor`, so it exercises the same build that is published to npm.

## Running

Build the library first, from the repository root:

```bash
npm install
npm run build
```

Then start the demo:

```bash
cd demo
npm install
npm start
```

Open `http://localhost:4200`. After changing library code, run `npm run build` in the repository root again and restart the demo.
