FROM mongo:8.0.15-noble
EXPOSE 27017
COPY mongo/ /etc/mongo/
COPY setup/ /docker-entrypoint-initdb.d/
HEALTHCHECK --interval="20s" --timeout=5s \
	CMD echo "hello"

