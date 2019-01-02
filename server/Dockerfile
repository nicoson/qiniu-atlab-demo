FROM xiaohui/node

MAINTAINER nixiaohui <nixiaohui@qiniu.com>

RUN apt-get update
RUN apt-get install vim
RUN mkdir /workspace
COPY ./ /workspace/server
WORKDIR /workspace/server                  
EXPOSE 3000
CMD ["npm start"]