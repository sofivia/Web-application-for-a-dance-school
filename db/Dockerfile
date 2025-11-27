FROM mongo:8.0.15-noble
EXPOSE 27017
WORKDIR db
COPY mongo/ /etc/mongo/
COPY setup/ /docker-entrypoint-initdb.d/
COPY healthcheck.sh .
RUN chmod u+x healthcheck.sh
