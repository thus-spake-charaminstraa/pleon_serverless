rm -rf ./dist/apps/mono-lambda
npx nest build --webpack mono-lambda
cd ./dist/apps/mono-lambda
zip main.js.zip main.js
cd ../../..
