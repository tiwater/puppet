# Puppet service

## Main feature:
Provide in puppet service based on @juzi/wechaty.

## How to run
Apply for a 7-day free trial token at https://tss.juzibot.com/ and put your token in 'PUPPET_TOKENS' in .env.

run: 
```
pnpm install
pnpm build
pnpm start
```
or 
```
pnpm install
pnpm dev
```
for development mode.

Then you can access the service on localhost:7000.

## Run with docker

First make sure the folder node_modules is deleted.
Then execute the command below to generate the docker image.
```
./builddocker.sh
```

Now call the script below to run: 
```
./startdocker.sh
```

