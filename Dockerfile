FROM node
WORKDIR /usr/src/app
COPY . ./
# INSTALA AS DEPENDECIAS 
RUN npm install 
RUN npm start
RUN npm run startup
EXPOSE 5991
