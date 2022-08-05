rm -rf ./dist/apps/mono-lambda
npx nest build --webpack mono-lambda
cd ./dist/apps/mono-lambda
zip main.js.zip main.js
cd ../../..

rm -rf ./dist/apps/noti-lambda
npx nest build --webpack noti-lambda
cd ./dist/apps/noti-lambda
zip main.js.zip main.js
cd ../../..
