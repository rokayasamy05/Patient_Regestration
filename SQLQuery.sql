CREATE DATABASE Patient_Regestration;

USE Patient_Regestration;

CREATE TABLE patients (
    p_number INT PRIMARY KEY,
    p_name VARCHAR(30) NOT NULL,
    p_phone CHAR(11) NOT NULL,
    p_national_id CHAR(14) UNIQUE,
    p_adress VARCHAR(100),
    p_birthday DATE
);

CREATE TABLE appointments (
    app_id INT PRIMARY KEY IDENTITY(1,1),
    department VARCHAR(30),
    doctor VARCHAR(30),
    app_date DATE,
    p_number INT FOREIGN KEY REFERENCES patients(p_number)
);
