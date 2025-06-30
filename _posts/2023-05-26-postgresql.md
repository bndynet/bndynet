---
title: PostgreSQL
categories: [Backend,Databases]
tags: [Backend,Databases]
---

[https://www.notion.so/PostgreSQL-70ae56c4eee7438f956b90839b363e68](https://www.notion.so/PostgreSQL-70ae56c4eee7438f956b90839b363e68)


## Installing


[bookmark](https://hub.docker.com/_/postgres)


```shell
# default
docker run --name my-postgres -e POSTGRES_PASSWORD=your-pass -d postgres

# advance
docker run -d --name my-postgres \
	-v /my-dockers/my-postgres/my-postgres.conf:/etc/postgresql/postgresql.conf  \
	-v /my-dockers/my-postgres/data:/var/lib/postgresql/data \
	-e PGDATA=/var/lib/postgresql/data/pgdata \
	-e POSTGRES_PASSWORD=your-pass \
	-e POSTGRES_USER=postgres  \
	-e POSTGRES_DB=my-db  \
	-c ssl=on \
	-p 5432:5432 \
	postgres -c 'config_file=/etc/postgresql/postgresql.conf'
```


via **psql:**


```shell
$ docker run -it --rm --network some-network postgres psql -h my-postgres -U postgres
psql (14.3)
Type "help" for help.

postgres=# SELECT 1;
 ?column? 
----------
        1
(1 row)
```


## **Generate SSL Certificates for PostgreSQL server**

1. Go to data folder

	```shell
	cd /var/lib/postgresql/data/pgdata
	```

2. Generate a private key by entering a pass phrase:

	```shell
	openssl genrsa -des3 -out server.key 2048
	```

3. Remove the pass phrase to automatically start up the server using the following command

	```shell
	openssl rsa -in server.key -out server.key
	```

4. Run the following command to remove group and other’s permission from the private key file

	```shell
	chmod og-rwx server.key
	```

5. Run the following command to create a self-signed certificate

	```shell
	openssl req -new -key server.key -days 3650 -out server.crt -x509
	```


	Note that: You will be asked to enter information that will be incorporated into your certificate request. For some fields, there will be a default value. If you enter ‘.’, the field will be left blank.


	```shell
	Country Name (2 letter code) [XX]:IN
	State or Province Name (full name) []:.
	Locality Name (eg, city) [Default City]:CH
	Organization Name (eg, company) [Default Company Ltd]:francium tech Organizational Unit Name (eg, section) []:.
	Common Name (eg, your name or your server's hostname) []:.
	Email Address []:kumaresan@francium.tech
	```

6. For self-signed certificates, use the server certificate as the trusted root certificate:

	```shell
	cp server.crt root.crt
	```


## **Prepare PostgreSQL standalone for SSL authentication**

1. Edit the postgresql.conf file to activate SSL:

	```shell
	cd /usr/local/var/postgres
	vi postgresql.conf
	```

2. Uncomment and change the following parameters:

	```shell
	ssl = on
	ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL'
	ssl_prefer_server_ciphers = on
	ssl_cert_file = 'server.crt'
	ssl_key_file = 'server.key'
	ssl_ca_file = 'root.crt'
	ssl_crl_file = ''
	```

3. Add the following entry to the client machine in **/var/lib/postgresql/data/pgdata/pg_hba.conf** file:

	```shell
	local       all            all                              trust
	hostssl     all            all             127.0.0.1/32     cert
	hostnossl   all            all             0.0.0.0/0        reject
	hostnossl   all            all             ::/0             reject
	```


4. To verify if SSL is enabled on standalone Postgres, run the following command:


	```shell
	psql 'host=<hostname> port=5432 dbname=<name> user=<user> sslmode=verify-full sslcert=/tmp/postgresql.crt sslkey=/tmp/postgresql.key sslrootcert=/tmp/root.crt'
	```


5. Once the database has restarted, login by specifying localhost to make sure the database is being connected over TCP/IP:


	```shell
	psql -h localhost -U postgres
	```

