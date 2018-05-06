-- phpMyAdmin SQL Dump
-- version 4.7.9
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 03, 2018 at 12:02 AM
-- Server version: 5.7.21
-- PHP Version: 5.6.35

DROP DATABASE IF EXISTS team5db;

CREATE DATABASE team5db;

use team5db;


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `team5db`
--

-- --------------------------------------------------------

--
-- Table structure for table `player`
--

DROP TABLE IF EXISTS `player`;
CREATE TABLE IF NOT EXISTS `player` (
  `Pname` varchar(50) NOT NULL,
  `Pemail` varchar(200) NOT NULL,
  `Ppassword` varchar(30) NOT NULL,
  `P_latest_score` int(10) DEFAULT '0',
  `P_high_score` int(10) DEFAULT '0',
  `P_total_score` int(10) DEFAULT '0',
  PRIMARY KEY (`Pname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `player_room`
--

DROP TABLE IF EXISTS `player_room`;
CREATE TABLE IF NOT EXISTS `player_room` (
  `Rname` varchar(100) NOT NULL,
  `P_name_fk` varchar(50) NOT NULL,
  `P_score` int(10) NOT NULL DEFAULT '0',
  KEY `P_name_fk` (`P_name_fk`),
  KEY `Rname` (`Rname`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
CREATE TABLE IF NOT EXISTS `room` (
  `Room_name` varchar(100) NOT NULL,
  PRIMARY KEY (`Room_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `player_room`
--
ALTER TABLE `player_room`
  ADD CONSTRAINT `player_room_ibfk_1` FOREIGN KEY (`P_name_fk`) REFERENCES `player` (`Pname`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `player_room_ibfk_2` FOREIGN KEY (`Rname`) REFERENCES `room` (`Room_name`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
