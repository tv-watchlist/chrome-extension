# ChromeExtension

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.6.

Below was used to generate the scaffold:
ng new chrome-extension --style=scss --skip-tests=true --prefix=tvq --routing=true

According to [Angular CLI Stories](https://github.com/angular/angular-cli/wiki/stories-disk-serve)

## Development server

Tested on Nodejs v8.1.2

npm install

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

To run as chrome extension open two cmd window and run below in each.

ng build --watch

lite-server --baseDir="dist" (node_modules/.bin/lite-server --baseDir="dist")

Troubleshoot:
Make sure that global angular-cli version matches with package.json (if global packages are installed)

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
