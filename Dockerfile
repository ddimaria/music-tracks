FROM ubuntu:17.10

RUN apt-get update && apt-get upgrade -y

# Install gdal
RUN apt-get install -y \
  build-essential \
  language-pack-en* \
  curl \
  git \
  sqlite3 \
  libsqlite3-dev \
  libz-dev

# Install node
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
  apt-get install -y nodejs

# Get application
RUN mkdir /app /output

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8000

ENTRYPOINT ["npm", "run"]
