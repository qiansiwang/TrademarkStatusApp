create schema tsdr_mobile;
use tsdr_mobile;

drop table if exists DEVICES;
CREATE TABLE DEVICES(
  id INT(11) NOT NULL AUTO_INCREMENT,
  app_id varchar(40) not null,
  push_id varchar(200) null,
  push_enabled tinyint(1) not null,
  aws_endpoint_arn varchar(150) null,
  device_type varchar(20) not null,
  device_os varchar(20) not null,
  create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=INNODB;

drop table if exists NOTEBOOKS;
CREATE TABLE NOTEBOOKS (
  notebook_id INT(11) NOT NULL AUTO_INCREMENT,
  device_id INT(11) NOT NULL,
  name varchar(30) not null,
  description varchar(50) null,
  create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notebook_id)
) ENGINE=INNODB;

drop table if exists BOOKMARKS;
CREATE TABLE BOOKMARKS (
  bookmark_id INT(11) NOT NULL AUTO_INCREMENT,
  device_id INT(11) NOT NULL,
  notebook_id INT(11) NOT NULL,
  mark_id varchar(20) NOT NULL,
  serial_number varchar(10) NOT NULL,
  registration_number varchar(10) NULL,
  title varchar(100) NOT NULL,
  status_code varchar(10) NOT NULL,
  status_date DATE NULL,
  previous_status_code varchar(10) NULL,
  previous_status_date DATE NULL,
  status_updated tinyint(1) not null default 0,
  filing_date DATE NULL,
  registration_date DATE NULL,
  create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (bookmark_id)
) ENGINE=INNODB;

drop table if exists STATUS_CODES;
CREATE TABLE STATUS_CODES(
  id INT(11) NOT NULL AUTO_INCREMENT,
  code varchar(10) NOT NULL,
  description varchar(300) NOT NULL,
  long_desc TEXT NULL,
  status_group_id int(11) NOT NULL,
  PRIMARY KEY (id)
)ENGINE=INNODB;

drop table if exists STATUS_GROUPS;
CREATE TABLE STATUS_GROUPS(
  id INT(11) NOT NULL AUTO_INCREMENT,
  code varchar(20) NOT NULL,
  label varchar(200) NOT NULL,
  long_desc TEXT NULL,
  PRIMARY KEY (id)
)ENGINE=INNODB;


drop table if exists PREFERRED_STATUS_GROUPS;
CREATE TABLE PREFERRED_STATUS_GROUPS(
  id INT(11) NOT NULL AUTO_INCREMENT,
  device_id int(11) not null,
  status_groups varchar(500) NOT NULL,
  PRIMARY KEY (id)
)ENGINE=INNODB;

drop table if exists DEVICE_NOTIFICATIONS;
CREATE TABLE DEVICE_NOTIFICATIONS(
  id INT(11) NOT NULL AUTO_INCREMENT,
  device_id int(11) not null,
  status_change_count int(3) not null default 0,
  message_delivered tinyint(1) not null default 0,
  create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
)ENGINE=INNODB;

drop table if exists DEVICE_SESSIONS;
CREATE TABLE DEVICE_SESSIONS(
  id INT(11) NOT NULL AUTO_INCREMENT,
  device_id int(11) not null,
  ip_address varchar(50) null,
  app_version varchar(6) not null,
  start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
)ENGINE=INNODB;

drop table if exists DEVICE_EVENTS;
CREATE TABLE DEVICE_EVENTS(
  id INT(11) NOT NULL AUTO_INCREMENT,
  device_id int(11) not null,
  event_type varchar(30) not null,
  event_data varchar(30) null,
  event_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
)ENGINE=INNODB;

load data local infile 'status_codes.csv' into table STATUS_CODES_TEST fields terminated by ','
enclosed by '"'
lines terminated by '\n'
(code, description, long_desc, status_group_id);

load data local infile 'status_groups.csv' into table STATUS_GROUPS_TEST fields terminated by ','
enclosed by '"'
lines terminated by '\n'
(id, label, long_desc, code);