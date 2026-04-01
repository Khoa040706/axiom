CREATE DATABASE axiom_hrm;
CREATE USER axiom WITH PASSWORD 'axiom_password';
GRANT ALL PRIVILEGES ON DATABASE axiom_hrm TO axiom;
\connect axiom_hrm
GRANT ALL ON SCHEMA public TO axiom;
ALTER DATABASE axiom_hrm OWNER TO axiom;
