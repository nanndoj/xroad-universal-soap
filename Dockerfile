FROM keymetrics/pm2
WORKDIR /usr/src/app
COPY . ./
# INSTALA AS DEPENDECIAS 
RUN npm install
RUN npm run build
# Show current folder structure in logs
RUN ls -al -R

EXPOSE 5080
EXPOSE 5443
CMD [ "pm2-runtime", "start", "pm2.json" ]