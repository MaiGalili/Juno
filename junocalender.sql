-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 23, 2025 at 09:32 AM
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

-- --------------------------------------------------------

--
-- Table structure for table `assigned`
--

CREATE TABLE `assigned` (
  `task_id` int(11) NOT NULL,
  `task_start_time` time NOT NULL,
  `task_end_time` time NOT NULL,
  `task_start_date` date NOT NULL,
  `task_end_date` date NOT NULL,
  `task_repeat` enum('none','daily','weekly','monthly','yearly') DEFAULT 'none',
  `repeat_until` date DEFAULT NULL,
  `task_all_day` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assigned`
--

INSERT INTO `assigned` (`task_id`, `task_start_time`, `task_end_time`, `task_start_date`, `task_end_date`, `task_repeat`, `repeat_until`, `task_all_day`) VALUES
(8, '08:00:00', '11:00:00', '2025-06-18', '2025-06-18', NULL, NULL, 0),
(19, '18:00:00', '19:00:00', '2025-07-23', '2025-07-23', 'none', NULL, 0),
(21, '10:00:00', '12:00:00', '2025-07-23', '2025-07-23', 'none', NULL, 0),
(24, '10:00:00', '12:00:00', '2025-07-25', '2025-07-25', 'none', NULL, 0);

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
(59, 'House', '#e01acf', 'maigalili@gmail.com'),
(60, 'Family', '#dddddd', 'maigalili@gmail.com'),
(61, 'Work', '#d5d5ff', 'Itay@gmail.com'),
(62, 'Home', '#e0ffe0', 'Itay@gmail.com'),
(63, 'Friends', '#fff0cc', 'Itay@gmail.com'),
(64, 'Work', '#21cb15', 'maigalili@gmail.com');

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
(2, 'Work', 'Ha-Tishbi St 100, Haifa, Israel', 32.80894800, 34.98385700, 'maigalili@gmail.com', '📍', '#146de1'),
(3, 'Home', 'HaHashmona\'im St 10, Haifa, Israel', 32.80510750, 34.99152800, 'maigalili@gmail.com', '🏠', '#ccc'),
(4, 'Store', 'Herzl St 30, Haifa, Israel', 32.80999480, 34.99857360, 'maigalili@gmail.com', '🏢', '#ccc'),
(6, 'Ori', 'Hess St 34, Haifa, Israel', 32.80585830, 34.99452210, 'maigalili@gmail.com', '🖥️', '#ccc');

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
  `series_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task`
--

INSERT INTO `task` (`task_id`, `task_title`, `task_duration`, `task_buffertime`, `email`, `task_note`, `location_id`, `custom_location_address`, `custom_location_latitude`, `custom_location_longitude`, `series_id`) VALUES
(8, 'Meeting with Aviel', '03:00:00', '00:00:10', 'maigalili@gmail.com', 'Zoom meeting for project', NULL, NULL, NULL, NULL, NULL),
(19, 'Visit Dad', '01:00:00', '00:00:10', 'maigalili@gmail.com', '', NULL, NULL, NULL, NULL, NULL),
(21, 'zoom with Lidor', '02:00:00', '00:20:00', 'maigalili@gmail.com', 'Need to send invite ', NULL, NULL, NULL, NULL, NULL),
(24, 'Cake With Ori', '02:00:00', '00:15:00', 'maigalili@gmail.com', 'Orange cake', 6, NULL, NULL, NULL, NULL);

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
(24, 59),
(24, 60);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `defult_buffer` time NOT NULL DEFAULT '00:10:00',
  `start_day_time` time NOT NULL DEFAULT '08:00:00',
  `end_day_time` time NOT NULL DEFAULT '21:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`email`, `password`, `defult_buffer`, `start_day_time`, `end_day_time`) VALUES
('Itay@gmail.com', '$2b$10$baHkElKUWnB4jgrfTiNNXu7ppq2HPiczpe1aozVgqsW30kpRs2F1y', '00:10:00', '08:00:00', '21:00:00'),
('maigalili@gmail.com', '$2b$10$xF5gUdeuJMJ8FB.Na89geOcA.zxVFhiQld.K77c0.CO.N6vi7Qwrm', '00:15:00', '09:00:00', '23:00:00');

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
  ADD PRIMARY KEY (`email`);

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
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `location`
--
ALTER TABLE `location`
  MODIFY `location_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `task`
--
ALTER TABLE `task`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

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
-- Constraints for table `waiting_list`
--
ALTER TABLE `waiting_list`
  ADD CONSTRAINT `waiting_list_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `task` (`task_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
