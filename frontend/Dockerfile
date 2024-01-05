FROM ubuntu
ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /app
RUN apt-get update && apt install -y npm curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash \
    && apt install -y nodejs

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD npm run dev