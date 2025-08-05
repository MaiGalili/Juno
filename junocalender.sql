-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 05, 2025 at 01:59 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `juno_calendar`
--
CREATE DATABASE IF NOT EXISTS `juno_calendar` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `juno_calendar`;

-- --------------------------------------------------------

--
-- Table structure for table `assigned`
--

CREATE TABLE `assigned` (
  `task_id` int(11) NOT NULL,
  `task_start_time` time NOT NULL,
  `task_end_time` time NOT NULL,
  `task_start_date` date NOT NULL,
  `task_end_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assigned`
--

INSERT INTO `assigned` (`task_id`, `task_start_time`, `task_end_time`, `task_start_date`, `task_end_date`) VALUES
(57, '09:30:00', '12:05:00', '2025-08-04', '2025-08-04'),
(85, '16:00:00', '16:30:00', '2025-08-05', '2025-08-05'),
(86, '18:00:00', '21:00:00', '2025-08-04', '2025-08-04'),
(87, '18:00:00', '21:00:00', '2025-08-06', '2025-08-06'),
(88, '12:00:00', '14:00:00', '2025-08-09', '2025-08-09'),
(89, '18:30:00', '19:30:00', '2025-08-03', '2025-08-03'),
(90, '18:30:00', '19:30:00', '2025-08-07', '2025-08-07'),
(91, '12:30:00', '13:00:00', '2025-08-07', '2025-08-07'),
(92, '14:15:00', '18:00:00', '2025-08-07', '2025-08-07'),
(93, '13:30:00', '14:00:00', '2025-08-08', '2025-08-08'),
(94, '16:15:00', '18:00:00', '2025-08-03', '2025-08-03'),
(95, '21:30:00', '22:00:00', '2025-08-03', '2025-08-03'),
(96, '21:30:00', '22:00:00', '2025-08-04', '2025-08-04'),
(97, '21:30:00', '22:00:00', '2025-08-05', '2025-08-05'),
(98, '21:30:00', '22:00:00', '2025-08-06', '2025-08-06'),
(99, '21:30:00', '22:00:00', '2025-08-07', '2025-08-07'),
(100, '21:30:00', '22:00:00', '2025-08-08', '2025-08-08'),
(109, '07:40:00', '08:25:00', '2025-08-03', '2025-08-03'),
(110, '07:40:00', '08:25:00', '2025-08-04', '2025-08-04'),
(111, '07:40:00', '08:25:00', '2025-08-05', '2025-08-05'),
(112, '07:40:00', '08:25:00', '2025-08-06', '2025-08-06'),
(113, '07:40:00', '08:25:00', '2025-08-07', '2025-08-07'),
(114, '07:40:00', '08:25:00', '2025-08-08', '2025-08-08'),
(115, '08:50:00', '11:30:00', '2025-08-07', '2025-08-07'),
(116, '17:30:00', '18:00:00', '2025-08-05', '2025-08-05'),
(117, '22:15:00', '22:30:00', '2025-08-03', '2025-08-03'),
(118, '22:15:00', '22:30:00', '2025-08-04', '2025-08-04'),
(119, '22:15:00', '22:30:00', '2025-08-05', '2025-08-05'),
(120, '22:15:00', '22:30:00', '2025-08-06', '2025-08-06'),
(121, '22:15:00', '22:30:00', '2025-08-07', '2025-08-07'),
(122, '22:15:00', '22:30:00', '2025-08-08', '2025-08-08'),
(123, '19:30:00', '20:00:00', '2025-08-05', '2025-08-05'),
(124, '09:00:00', '17:00:00', '2025-08-06', '2025-08-06'),
(125, '09:00:00', '12:30:00', '2025-08-05', '2025-08-05'),
(126, '14:00:00', '15:00:00', '2025-08-05', '2025-08-05'),
(127, '14:00:00', '17:00:00', '2025-08-04', '2025-08-04'),
(128, '12:30:00', '14:00:00', '2025-08-04', '2025-08-04'),
(129, '13:00:00', '14:00:00', '2025-08-06', '2025-08-06'),
(130, '09:15:00', '15:45:00', '2025-08-03', '2025-08-03');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `category_color` varchar(50) DEFAULT NULL,
  `user_email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`category_id`, `category_name`, `category_color`, `user_email`) VALUES
(59, 'House', '#e40101', 'maigalili@gmail.com'),
(60, 'Family', '#ea7210', 'maigalili@gmail.com'),
(61, 'Work', '#d5d5ff', 'Itay@gmail.com'),
(62, 'Home', '#e0ffe0', 'Itay@gmail.com'),
(63, 'Friends', '#fff0cc', 'Itay@gmail.com'),
(64, 'Work', '#f2e12c', 'maigalili@gmail.com'),
(65, 'School', '#27f019', 'maigalili@gmail.com'),
(66, 'Friends', '#1f79ef', 'maigalili@gmail.com'),
(67, 'Pet', '#4a4ecf', 'maigalili@gmail.com'),
(68, 'Me', '#eb0fb0', 'maigalili@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

CREATE TABLE `location` (
  `location_id` int(11) NOT NULL,
  `location_name` varchar(100) NOT NULL,
  `location_address` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `icon` varchar(10) DEFAULT '?',
  `color` varchar(10) DEFAULT '#ccc'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `location`
--

INSERT INTO `location` (`location_id`, `location_name`, `location_address`, `latitude`, `longitude`, `user_email`, `icon`, `color`) VALUES
(10, 'Home', 'Ha-Asif St 5, Haifa, Israel', 32.79975070, 34.99494470, 'maigalili@gmail.com', '🏠', '#ccc'),
(11, 'Work Davka', 'Al-Marin St, Haifa, Israel', 32.81686500, 34.99908600, 'maigalili@gmail.com', '🏢', '#ccc'),
(12, 'Work Matnas', 'HaRav Mashash Yosef St 1א, Haifa, Israel', 32.79360540, 35.01997090, 'maigalili@gmail.com', '🏢', '#ccc'),
(13, 'Grandma', 'Ha-Tishbi St 79, Haifa, Israel', 32.81102700, 34.98236200, 'maigalili@gmail.com', '🏠', '#ccc'),
(14, 'Itay', 'Albert Einstein St 121, Haifa, Israel', 32.77896800, 34.99828000, 'maigalili@gmail.com', '🏠', '#ccc'),
(15, 'Technion School', 'Haifa, 3200003, Israel', 32.79404630, 34.98957100, 'maigalili@gmail.com', '🖥️', '#ccc');

-- --------------------------------------------------------

--
-- Table structure for table `task`
--

CREATE TABLE `task` (
  `task_id` int(11) NOT NULL,
  `task_title` varchar(255) NOT NULL,
  `task_duration` time DEFAULT NULL,
  `task_buffertime` time DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `task_note` varchar(160) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `custom_location_address` varchar(255) DEFAULT NULL,
  `custom_location_latitude` double DEFAULT NULL,
  `custom_location_longitude` double DEFAULT NULL,
  `series_id` varchar(36) DEFAULT NULL,
  `task_repeat` enum('none','daily','weekly','monthly','yearly') DEFAULT 'none',
  `repeat_until` date DEFAULT NULL,
  `task_all_day` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task`
--

INSERT INTO `task` (`task_id`, `task_title`, `task_duration`, `task_buffertime`, `email`, `task_note`, `location_id`, `custom_location_address`, `custom_location_latitude`, `custom_location_longitude`, `series_id`, `task_repeat`, `repeat_until`, `task_all_day`) VALUES
(57, 'Pyton exam', '02:35:00', '00:35:00', 'maigalili@gmail.com', '', 15, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(70, 'Bake birthday cake', '02:00:00', '00:30:00', 'maigalili@gmail.com', 'cake for grandmas 92 birthday ', 10, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(71, 'Clean home', '02:00:00', '01:00:00', 'maigalili@gmail.com', 'Clean before mom arrives', 10, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(85, 'Final Project 80%', '00:30:00', '00:20:00', 'maigalili@gmail.com', 'Show Evgenia my Juno Project', 15, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(86, 'Teach class', '03:00:00', '00:20:00', 'maigalili@gmail.com', '', 11, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(87, 'Teach Class', '03:00:00', '00:20:00', 'maigalili@gmail.com', '', 11, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(88, 'Grandma 92 Birthday lunch', '02:00:00', '00:10:00', 'maigalili@gmail.com', '', 13, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(89, 'Visit Gramdma', '01:00:00', '00:05:00', 'maigalili@gmail.com', '', 13, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(90, 'Visit Gramdma', '01:00:00', '00:05:00', 'maigalili@gmail.com', '', 13, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(91, 'React presentation', '00:30:00', '00:25:00', 'maigalili@gmail.com', '', 15, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(92, 'Free Private Lesson for Kobi', '03:45:00', '00:10:00', 'maigalili@gmail.com', 'free private lesson on wheel for Kobi', 12, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(93, 'Pick mom from Airport', '00:30:00', '00:15:00', 'maigalili@gmail.com', 'Mom is arriving ', 14, '7015001, Israel', 32.0004465, 34.8706095, NULL, 'none', NULL, 0),
(94, 'Work reclaiming Clay', '01:45:00', '00:10:00', 'maigalili@gmail.com', '', 12, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(95, 'Night walk Coucus', '00:30:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, 'f2a3a94d-8d00-4d20-944e-9a3949c0d0f0', 'daily', '2025-08-08', 0),
(96, 'Night walk Coucus', '00:30:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, 'f2a3a94d-8d00-4d20-944e-9a3949c0d0f0', 'daily', '2025-08-08', 0),
(97, 'Night walk Coucus', '00:30:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, 'f2a3a94d-8d00-4d20-944e-9a3949c0d0f0', 'daily', '2025-08-08', 0),
(98, 'Night walk Coucus', '00:30:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, 'f2a3a94d-8d00-4d20-944e-9a3949c0d0f0', 'daily', '2025-08-08', 0),
(99, 'Night walk Coucus', '00:30:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, 'f2a3a94d-8d00-4d20-944e-9a3949c0d0f0', 'daily', '2025-08-08', 0),
(100, 'Night walk Coucus', '00:30:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, 'f2a3a94d-8d00-4d20-944e-9a3949c0d0f0', 'daily', '2025-08-08', 0),
(109, 'Morning walk Cocus', '00:45:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '5c224287-232c-4b07-bab2-9f1d58ca4cc9', 'daily', '2025-08-08', 0),
(110, 'Morning walk Cocus', '00:45:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '5c224287-232c-4b07-bab2-9f1d58ca4cc9', 'daily', '2025-08-08', 0),
(111, 'Morning walk Cocus', '00:45:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '5c224287-232c-4b07-bab2-9f1d58ca4cc9', 'daily', '2025-08-08', 0),
(112, 'Morning walk Cocus', '00:45:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '5c224287-232c-4b07-bab2-9f1d58ca4cc9', 'daily', '2025-08-08', 0),
(113, 'Morning walk Cocus', '00:45:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '5c224287-232c-4b07-bab2-9f1d58ca4cc9', 'daily', '2025-08-08', 0),
(114, 'Morning walk Cocus', '00:45:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '5c224287-232c-4b07-bab2-9f1d58ca4cc9', 'daily', '2025-08-08', 0),
(115, 'Reclaiming Clay', '02:40:00', '00:15:00', 'maigalili@gmail.com', '', 12, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(116, 'Buy new bottle for Tom ', '00:30:00', '00:15:00', 'maigalili@gmail.com', 'new cantigo bottle', 14, 'Khorev St 15, Haifa, Israel', 32.7845699, 34.9871187, NULL, 'none', NULL, 0),
(117, 'Night water garden', '00:15:00', '00:00:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '8b52a691-953d-492d-95f1-dec079d3b91f', 'daily', '2025-08-08', 0),
(118, 'Night water garden', '00:15:00', '00:00:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '8b52a691-953d-492d-95f1-dec079d3b91f', 'daily', '2025-08-08', 0),
(119, 'Night water garden', '00:15:00', '00:00:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '8b52a691-953d-492d-95f1-dec079d3b91f', 'daily', '2025-08-08', 0),
(120, 'Night water garden', '00:15:00', '00:00:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '8b52a691-953d-492d-95f1-dec079d3b91f', 'daily', '2025-08-08', 0),
(121, 'Night water garden', '00:15:00', '00:00:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '8b52a691-953d-492d-95f1-dec079d3b91f', 'daily', '2025-08-08', 0),
(122, 'Night water garden', '00:15:00', '00:00:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, '8b52a691-953d-492d-95f1-dec079d3b91f', 'daily', '2025-08-08', 0),
(123, 'Visit Grandma', '00:30:00', '00:10:00', 'maigalili@gmail.com', '', 13, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(124, 'Go over React Project ', '08:00:00', '00:05:00', 'maigalili@gmail.com', '', 10, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(125, 'Go over Juno Project', '03:30:00', '00:05:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(126, 'Lunch', '01:00:00', '00:15:00', 'maigalili@gmail.com', '', 10, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(127, 'Final Project', '03:00:00', '00:15:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(128, 'Lunch', '01:30:00', '00:15:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(129, 'Lunch', '01:00:00', '00:15:00', 'maigalili@gmail.com', '', 10, NULL, NULL, NULL, NULL, 'none', NULL, 0),
(130, 'Studying for Pyton', '06:30:00', '00:15:00', 'maigalili@gmail.com', '', 14, NULL, NULL, NULL, NULL, 'none', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `task_category`
--

CREATE TABLE `task_category` (
  `task_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_category`
--

INSERT INTO `task_category` (`task_id`, `category_id`) VALUES
(71, 59),
(70, 59),
(70, 60),
(86, 64),
(87, 64),
(88, 60),
(91, 65),
(90, 60),
(93, 60),
(94, 64),
(89, 60),
(92, 64),
(92, 66),
(85, 65),
(95, 67),
(96, 67),
(97, 67),
(98, 67),
(99, 67),
(100, 67),
(109, 67),
(110, 67),
(111, 67),
(112, 67),
(113, 67),
(114, 67),
(115, 64),
(116, 60),
(117, 59),
(118, 59),
(119, 59),
(120, 59),
(121, 59),
(122, 59),
(123, 60),
(124, 65),
(125, 65),
(127, 65),
(129, 68),
(130, 65),
(57, 65),
(128, 68),
(126, 68);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `defult_buffer` time NOT NULL DEFAULT '00:10:00',
  `start_day_time` time NOT NULL DEFAULT '08:00:00',
  `end_day_time` time NOT NULL DEFAULT '21:00:00',
  `waiting_list_max` int(11) NOT NULL DEFAULT 10,
  `default_location_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`email`, `password`, `defult_buffer`, `start_day_time`, `end_day_time`, `waiting_list_max`, `default_location_id`) VALUES
('Itay@gmail.com', '$2b$10$baHkElKUWnB4jgrfTiNNXu7ppq2HPiczpe1aozVgqsW30kpRs2F1y', '00:10:00', '08:00:00', '21:00:00', 10, NULL),
('maigalili@gmail.com', '$2b$10$xF5gUdeuJMJ8FB.Na89geOcA.zxVFhiQld.K77c0.CO.N6vi7Qwrm', '00:15:00', '09:00:00', '23:00:00', 3, 14);

-- --------------------------------------------------------

--
-- Table structure for table `waiting_list`
--

CREATE TABLE `waiting_list` (
  `task_id` int(11) NOT NULL,
  `task_duedate` date DEFAULT NULL,
  `task_duetime` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `waiting_list`
--

INSERT INTO `waiting_list` (`task_id`, `task_duedate`, `task_duetime`) VALUES
(70, '2025-08-07', '15:00:00'),
(71, '2025-08-07', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assigned`
--
ALTER TABLE `assigned`
  ADD PRIMARY KEY (`task_id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `category_name` (`category_name`,`user_email`),
  ADD KEY `fk_user_email` (`user_email`);

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`location_id`),
  ADD UNIQUE KEY `location_name` (`location_name`,`user_email`),
  ADD KEY `user_email` (`user_email`);

--
-- Indexes for table `task`
--
ALTER TABLE `task`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `email` (`email`),
  ADD KEY `fk_task_location` (`location_id`);

--
-- Indexes for table `task_category`
--
ALTER TABLE `task_category`
  ADD KEY `task_id` (`task_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`email`),
  ADD KEY `fk_users_default_location` (`default_location_id`);

--
-- Indexes for table `waiting_list`
--
ALTER TABLE `waiting_list`
  ADD PRIMARY KEY (`task_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `location`
--
ALTER TABLE `location`
  MODIFY `location_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `task`
--
ALTER TABLE `task`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assigned`
--
ALTER TABLE `assigned`
  ADD CONSTRAINT `assigned_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `task` (`task_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `category`
--
ALTER TABLE `category`
  ADD CONSTRAINT `fk_user_email` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE;

--
-- Constraints for table `location`
--
ALTER TABLE `location`
  ADD CONSTRAINT `location_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE;

--
-- Constraints for table `task`
--
ALTER TABLE `task`
  ADD CONSTRAINT `fk_task_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `task_ibfk_2` FOREIGN KEY (`email`) REFERENCES `users` (`email`);

--
-- Constraints for table `task_category`
--
ALTER TABLE `task_category`
  ADD CONSTRAINT `task_category_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `task` (`task_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_category_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_default_location` FOREIGN KEY (`default_location_id`) REFERENCES `location` (`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `waiting_list`
--
ALTER TABLE `waiting_list`
  ADD CONSTRAINT `waiting_list_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `task` (`task_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
