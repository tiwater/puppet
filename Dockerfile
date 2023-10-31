FROM node:latest
RUN npm install pnpm -g

ENTRYPOINT [ "/bin/bash", "-l", "-c" ]
