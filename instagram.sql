-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 28, 2025 at 12:01 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `instagram`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `text` text NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `post_id`, `user_id`, `text`, `parent_id`, `created_at`, `updated_at`) VALUES
(2, 1, 12, 'สวยมาก!', NULL, '2025-08-28 01:05:28', '2025-08-28 01:05:28'),
(3, 1, 12, 'สวยมาก!', NULL, '2025-08-28 01:07:32', '2025-08-28 01:07:32'),
(4, 1, 12, 'สวยมาก!', NULL, '2025-08-28 01:07:35', '2025-08-28 01:07:35'),
(5, 1, 12, 'สุดๆ', NULL, '2025-08-28 01:08:58', '2025-08-28 01:08:58'),
(6, 1, 12, 'สวยมาก!', NULL, '2025-08-28 01:09:10', '2025-08-28 01:09:10');

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE `follows` (
  `follower_id` bigint(20) UNSIGNED NOT NULL,
  `following_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `follows`
--

INSERT INTO `follows` (`follower_id`, `following_id`, `created_at`) VALUES
(13, 11, '2025-08-27 23:43:00'),
(14, 12, '2025-08-28 14:15:21'),
(15, 11, '2025-08-28 14:55:14');

-- --------------------------------------------------------

--
-- Table structure for table `follow_requests`
--

CREATE TABLE `follow_requests` (
  `follower_id` bigint(20) UNSIGNED NOT NULL,
  `following_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`user_id`, `post_id`, `created_at`) VALUES
(11, 4, '2025-08-28 14:37:50'),
(12, 4, '2025-08-28 14:51:25'),
(14, 4, '2025-08-28 14:38:46'),
(15, 4, '2025-08-28 14:41:47');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `actor_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('like','comment','follow') NOT NULL,
  `ref_id` bigint(20) UNSIGNED DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `actor_id`, `type`, `ref_id`, `message`, `is_read`, `created_at`) VALUES
(1, 11, 12, 'like', 1, 'liked your reel', 0, '2025-08-28 14:47:09'),
(2, 11, 12, 'like', 4, 'liked your post', 0, '2025-08-28 14:51:25'),
(3, 11, 15, 'follow', 11, 'started following you', 0, '2025-08-28 14:55:14'),
(4, 11, 14, 'follow', 11, 'started following you', 0, '2025-08-28 16:05:04'),
(5, 11, 14, 'follow', 11, 'started following you', 0, '2025-08-28 16:05:56'),
(6, 11, 14, 'follow', 11, 'started following you', 0, '2025-08-28 16:10:20'),
(7, 11, 14, 'follow', 11, 'started following you', 0, '2025-08-28 16:11:58'),
(8, 14, 11, 'follow', 11, 'accepted your follow request', 0, '2025-08-28 16:46:48');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `caption` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `caption`, `location`, `created_at`) VALUES
(1, 12, 'Sunset', NULL, '2025-08-28 00:18:23'),
(2, 12, 'Sunset', 'Bangkok', '2025-08-28 00:18:59'),
(3, 12, 'Sunset', 'UdonThani', '2025-08-28 00:26:06'),
(4, 11, 'How are you today?', 'Thailand', '2025-08-28 00:29:19');

-- --------------------------------------------------------

--
-- Table structure for table `post_media`
--

CREATE TABLE `post_media` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `media_url` varchar(500) NOT NULL,
  `media_type` enum('image','video') NOT NULL,
  `thumb_url` varchar(500) DEFAULT NULL,
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `duration_ms` int(11) DEFAULT NULL,
  `position` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post_media`
--

INSERT INTO `post_media` (`id`, `post_id`, `media_url`, `media_type`, `thumb_url`, `width`, `height`, `duration_ms`, `position`, `created_at`) VALUES
(1, 1, '/uploads/images/1756315103415-t3hbu45v9q.jpg', 'image', NULL, NULL, NULL, NULL, 0, '2025-08-28 00:18:23'),
(2, 2, '/uploads/images/1756315139800-zx7l4h2bafs.jpg', 'image', NULL, NULL, NULL, NULL, 0, '2025-08-28 00:18:59'),
(3, 3, '/uploads/images/1756315566442-teqxpr3tsm.jpg', 'image', NULL, NULL, NULL, NULL, 0, '2025-08-28 00:26:06'),
(4, 4, '/uploads/videos/1756315759547-vbws3scsu3a.mp4', 'video', NULL, NULL, NULL, NULL, 0, '2025-08-28 00:29:19');

-- --------------------------------------------------------

--
-- Table structure for table `reels`
--

CREATE TABLE `reels` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `video_url` varchar(500) NOT NULL,
  `thumb_url` varchar(500) DEFAULT NULL,
  `caption` text DEFAULT NULL,
  `duration_ms` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reels`
--

INSERT INTO `reels` (`id`, `user_id`, `video_url`, `thumb_url`, `caption`, `duration_ms`, `created_at`) VALUES
(1, 11, '/uploads/videos/1756366247538-n20xp39ygr9.mp4', NULL, 'อากาศดีมาก', NULL, '2025-08-28 14:30:47');

-- --------------------------------------------------------

--
-- Table structure for table `reel_likes`
--

CREATE TABLE `reel_likes` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `reel_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reel_likes`
--

INSERT INTO `reel_likes` (`user_id`, `reel_id`, `created_at`) VALUES
(11, 1, '2025-08-28 14:46:35'),
(12, 1, '2025-08-28 14:47:09');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token` varchar(500) NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `revoked_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token`, `revoked`, `created_at`, `revoked_at`) VALUES
(1, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzMDA1OTYsImV4cCI6MTc1ODg5MjU5Nn0.vsH1YupXQ_M5SFiddK2ZW5vaXbNYP-kFHS7Mn1ECBK0', 0, '2025-08-27 20:16:36', NULL),
(2, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMDExMzEsImV4cCI6MTc1ODg5MzEzMX0.hSQXH3Ml8A4kXHVcFg6m11XnmJufRqynI5ClDVd-tso', 1, '2025-08-27 20:25:31', '2025-08-27 23:04:53'),
(3, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMDEyMTksImV4cCI6MTc1ODg5MzIxOX0.OFOY6eBYSTkym9TU9FljQ_8yTQb5wOZwhgy-iOdmTZA', 1, '2025-08-27 20:26:59', '2025-08-27 23:04:53'),
(4, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMDE0MTEsImV4cCI6MTc1ODg5MzQxMX0.YV0mqRDy-CqRWejanw5ckVaDwF0SMz7jQeqHafjk9s8', 1, '2025-08-27 20:30:11', '2025-08-27 23:04:53'),
(5, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMDg1MzgsImV4cCI6MTc1ODkwMDUzOH0.I7W7X_vayw1luFaZ6mDlfp90Vgm1oKPYqt-gFKt89C4', 1, '2025-08-27 22:28:58', '2025-08-27 23:04:53'),
(6, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMDg1NDIsImV4cCI6MTc1ODkwMDU0Mn0.2Qw6wXtl7jKPEw-hB_KqJI7oh2Pof_2aO6UUCzvnuT0', 1, '2025-08-27 22:29:02', '2025-08-27 23:04:53'),
(7, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMDg1ODQsImV4cCI6MTc1ODkwMDU4NH0.7kTtl53XlzlCfLWCVh9NhX80InXQgJBk-NRo4I_8bCA', 1, '2025-08-27 22:29:44', '2025-08-27 23:04:53'),
(8, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMDg1ODYsImV4cCI6MTc1ODkwMDU4Nn0.q6zPzeJVIdvSdiNvgUsvWrUZ8ocg8ht__6AaA-OIrwo', 1, '2025-08-27 22:29:46', '2025-08-27 23:04:53'),
(9, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMDk3NzYsImV4cCI6MTc1ODkwMTc3Nn0.56b1YYWXx68aRLaZ5A4_tY5pfMvdDboBqrz76d3mnRM', 1, '2025-08-27 22:49:36', '2025-08-27 22:55:35'),
(10, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMDk4ODcsImV4cCI6MTc1ODkwMTg4N30.vP-IO2juBAR6LAbH4z4u8TBK0y2vKDwGPcCELHhyGFI', 1, '2025-08-27 22:51:27', '2025-08-27 23:04:53'),
(11, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTAxNTcsImV4cCI6MTc1ODkwMjE1N30.8A9vpHoL4jMjAX3IWJ48mR8ieajrm79ya7FzfixYGSk', 1, '2025-08-27 22:55:57', '2025-08-27 23:04:53'),
(12, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTAxNjUsImV4cCI6MTc1ODkwMjE2NX0.cWFQPD9UeU_PEq9vq91PFttIw2Hqdam389dwF7YZnB8', 1, '2025-08-27 22:56:05', '2025-08-27 22:56:21'),
(13, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTAxODcsImV4cCI6MTc1ODkwMjE4N30.EviUXgwPC_GStKOxKKHcz62HE-7gXOJx6vbp9v4QC7M', 1, '2025-08-27 22:56:27', '2025-08-27 23:04:53'),
(14, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTAzMjksImV4cCI6MTc1ODkwMjMyOX0.cdZQ6gyo9LVysO1rbHOY6eo9CJNhET0rr38oyd1vxW8', 1, '2025-08-27 22:58:49', '2025-08-27 23:04:53'),
(15, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTAzNTksImV4cCI6MTc1ODkwMjM1OX0.JnkIqdH6YiEq77oJ0NOMhmhQJH8pu4QAGEWF2Cw1HOQ', 1, '2025-08-27 22:59:19', '2025-08-27 23:04:53'),
(16, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTA1MzUsImV4cCI6MTc1ODkwMjUzNX0.gmrUwm40AZQPOyRYwlvt6hsJsfED4Rqw4YeuvbRILM4', 1, '2025-08-27 23:02:15', '2025-08-27 23:02:27'),
(17, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTA1NDcsImV4cCI6MTc1ODkwMjU0N30.vJ1SI3J32Fm39IKLIVDTYQZjCfQzvE5eGnlCZHAAuQo', 1, '2025-08-27 23:02:27', '2025-08-27 23:04:53'),
(18, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTA2MTcsImV4cCI6MTc1ODkwMjYxN30.S49uoR4RwTeHIFjJdHsrr7wYeT9WhdDYA29pMzymcsI', 1, '2025-08-27 23:03:37', '2025-08-27 23:04:53'),
(19, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTA2MTgsImV4cCI6MTc1ODkwMjYxOH0.M1SwzmqyQXr4kiPY8a3RbiG9h7yskQtcriS4sTsgRhI', 1, '2025-08-27 23:03:38', '2025-08-27 23:04:53'),
(20, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTE3NDUsImV4cCI6MTc1ODkwMzc0NX0.PCirrEGh94fJqsPgowlxnoq85k5btUstOdc0miEFExA', 0, '2025-08-27 23:22:25', NULL),
(21, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTIzNjEsImV4cCI6MTc1ODkwNDM2MX0.dE4hyFvj02BveqFd952nGIC3EURwV6PPLU6rtOKsGvQ', 0, '2025-08-27 23:32:41', NULL),
(22, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTI4MjQsImV4cCI6MTc1ODkwNDgyNH0.C2V9ANKuieXrA1BafIb9cqomK5rQZasfnMgf8xBGfg4', 0, '2025-08-27 23:40:24', NULL),
(23, 13, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEzLCJpYXQiOjE3NTYzMTI4OTMsImV4cCI6MTc1ODkwNDg5M30.5aL5Bc5sSkNwdb7f1OBFBczw68ofBaeeOluSkR5rPbE', 0, '2025-08-27 23:41:33', NULL),
(24, 13, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEzLCJpYXQiOjE3NTYzMTI5NTcsImV4cCI6MTc1ODkwNDk1N30.AJmn8AToZgTv7L04Fgp3rcOaQqbdyU1SZoZVAWTV6tM', 0, '2025-08-27 23:42:37', NULL),
(25, 13, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEzLCJpYXQiOjE3NTYzMTMyMjIsImV4cCI6MTc1ODkwNTIyMn0.ZmI97pjOLiOu338sQX86q3cSMPYDcsPKc3ZCqHR0404', 0, '2025-08-27 23:47:02', NULL),
(26, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzMTMzMjUsImV4cCI6MTc1ODkwNTMyNX0.zdESQ8qV4q-Wz42ZAJSwbWfE-5Aql4oQihNf8V0Pe2o', 0, '2025-08-27 23:48:45', NULL),
(27, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTM0MDksImV4cCI6MTc1ODkwNTQwOX0.IpQ68LAj0i5rIx5qkzbpFhyWrdM9X5kcCojzwx5TRFQ', 0, '2025-08-27 23:50:09', NULL),
(28, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTM2MjYsImV4cCI6MTc1ODkwNTYyNn0.7mrjXhZQcrSJlB9Xq9_y9y-ubCL4I5hFRk8M2fOdGPU', 0, '2025-08-27 23:53:46', NULL),
(29, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTQyMzIsImV4cCI6MTc1ODkwNjIzMn0.eSrWS2hfUwQ1i7yWF2KzOxnuFk0NUQ9ohw57RbAPw80', 0, '2025-08-28 00:03:52', NULL),
(30, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTQ3MjIsImV4cCI6MTc1ODkwNjcyMn0.cRfJVN_Ej3BGOBWxgidDBjGW4scZlX_43BJGj508kBo', 0, '2025-08-28 00:12:02', NULL),
(31, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzMTU0NzQsImV4cCI6MTc1ODkwNzQ3NH0.ko6VGZeJrlHzAPRE0ne5yOrlHLasXnjsa4uysEp-NyE', 0, '2025-08-28 00:24:34', NULL),
(32, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzMTU2MzYsImV4cCI6MTc1ODkwNzYzNn0.OSX9yzS_uM7vuxSXDU3vLHUcBna8jObR82b7GsyocD4', 0, '2025-08-28 00:27:16', NULL),
(33, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzMTY1NTMsImV4cCI6MTc1ODkwODU1M30.YWk5OsYzhZv8iSnQ4vqjtaUlxQNmOxmCu5Eg_6LtyiI', 0, '2025-08-28 00:42:33', NULL),
(34, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzMTY1NzgsImV4cCI6MTc1ODkwODU3OH0.O6MVQfTryelvw27i0syhvmjeokxn66bTQr-C_KDriTA', 0, '2025-08-28 00:42:58', NULL),
(35, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTY2MTMsImV4cCI6MTc1ODkwODYxM30.Q2wLrcZtymK4zv79UQcFTobts9SE1aCY0uED0R7xmxo', 0, '2025-08-28 00:43:33', NULL),
(36, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTc1MjMsImV4cCI6MTc1ODkwOTUyM30.otgc_0o275jYK8RuZ8MolqCP0F2dPUk4ov0XZIw1k6s', 0, '2025-08-28 00:58:43', NULL),
(37, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTc5ODMsImV4cCI6MTc1ODkwOTk4M30.Q571uPqikfKYshogyFg_l56E6YD5oH6TfoK9UBNJuwM', 0, '2025-08-28 01:06:23', NULL),
(38, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzNjM5NjIsImV4cCI6MTc1ODk1NTk2Mn0.S4LEj8ulCjbGTHZpMUbgQNiXSRQzZr217H9H8EcTwCA', 0, '2025-08-28 13:52:42', NULL),
(39, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNjQxNDgsImV4cCI6MTc1ODk1NjE0OH0.Vm3-Vi1H06jteR6x1Ic7Vlqu4bnSYQAAdg30JD-t6-g', 0, '2025-08-28 13:55:48', NULL),
(40, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzNjQ4MzgsImV4cCI6MTc1ODk1NjgzOH0.VnUc103fThCYs-SebZtWhCB2wqDu8B61WlOhU1Mm7Sc', 0, '2025-08-28 14:07:18', NULL),
(41, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzNjUxNzYsImV4cCI6MTc1ODk1NzE3Nn0.i9SOOO4M9o9TWkx_f6UT_jDxB5EGvwdb7JRk8fhUnYw', 0, '2025-08-28 14:12:56', NULL),
(42, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJpYXQiOjE3NTYzNjUyMjYsImV4cCI6MTc1ODk1NzIyNn0.W3IYhdM99G2FeDjM0wfRb0qSdQFs1lXW-2B8f1r-CxU', 0, '2025-08-28 14:13:46', NULL),
(43, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJpYXQiOjE3NTYzNjUyMzUsImV4cCI6MTc1ODk1NzIzNX0.GXjIox15Dqr0f9ZF663NI0AQe_oxiIIVYwJsyyy0Gsg', 0, '2025-08-28 14:13:55', NULL),
(44, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJpYXQiOjE3NTYzNjU0MzAsImV4cCI6MTc1ODk1NzQzMH0.3jN8y4oUIyF23xpo17Zjke7T7fIKE7M4rLp6PWmnmZ8', 0, '2025-08-28 14:17:10', NULL),
(45, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNjU2MzYsImV4cCI6MTc1ODk1NzYzNn0.8ivY-G2wHpRGqBBHWTDAs6PrBHXeOP3yi-UOiHswRS8', 0, '2025-08-28 14:20:36', NULL),
(46, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJpYXQiOjE3NTYzNjU5MDEsImV4cCI6MTc1ODk1NzkwMX0.vU7zyBk_zdfXlzu-Gk4wMyylZI3fq34CP7h-v_si42o', 0, '2025-08-28 14:25:01', NULL),
(47, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNjYyMzQsImV4cCI6MTc1ODk1ODIzNH0.9JFhQVKKYfVR6OWXbicvnaMOcrcjKbAp2ku-VbB2v2g', 0, '2025-08-28 14:30:34', NULL),
(48, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNjY1ODQsImV4cCI6MTc1ODk1ODU4NH0.6XQy36tgljARa-fYpfygwZ9It8qlXMtAccF5M9k-EbA', 0, '2025-08-28 14:36:24', NULL),
(49, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJpYXQiOjE3NTYzNjY3MDgsImV4cCI6MTc1ODk1ODcwOH0.zzSwfvbYfpAHwPoTh7UPc2sl3h99TuNsPd0hRvWxcNo', 0, '2025-08-28 14:38:28', NULL),
(50, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNjY3NTksImV4cCI6MTc1ODk1ODc1OX0.LXkKvwfNLul4ltnNdOPLimty3CLl9ZowguOYh-HTLzk', 0, '2025-08-28 14:39:19', NULL),
(51, 15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJpYXQiOjE3NTYzNjY4NzksImV4cCI6MTc1ODk1ODg3OX0.51wSRHBcSN4wt6Y_TT0DQiRvxQas5X-GCw5yhdStc0o', 0, '2025-08-28 14:41:19', NULL),
(52, 15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJpYXQiOjE3NTYzNjY4ODQsImV4cCI6MTc1ODk1ODg4NH0.BcSiYjWqIXXTijdFYqg6CuEFtpOQTZNlYuk46kCNKEo', 0, '2025-08-28 14:41:24', NULL),
(53, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNjY5MzEsImV4cCI6MTc1ODk1ODkzMX0.CcynlBdVIqq7lQRzBBXhETjbu0iY-D2AeWFA3RLuUY4', 0, '2025-08-28 14:42:11', NULL),
(54, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzNjcyMjAsImV4cCI6MTc1ODk1OTIyMH0.hehjNr_nbcNFxMHOQ_7UIG5qOgN69-8Eb7QAaxoSF-w', 0, '2025-08-28 14:47:00', NULL),
(55, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNjcyMzcsImV4cCI6MTc1ODk1OTIzN30._wq8QV8o10f67vPIWkyxCbQ4tIrWRtFRwv4_6nMck8Y', 0, '2025-08-28 14:47:17', NULL),
(56, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzNjc0NzYsImV4cCI6MTc1ODk1OTQ3Nn0.rgopH4rWvf1iELkERqv6K-jcoiPZ29vQ071ZIeRZU8U', 0, '2025-08-28 14:51:16', NULL),
(57, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNjc0OTAsImV4cCI6MTc1ODk1OTQ5MH0.kigIkaumsfE0NU0xdzVWCCzxyonK95fnqOrdBbSB28g', 0, '2025-08-28 14:51:30', NULL),
(58, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJpYXQiOjE3NTYzNjc2MjksImV4cCI6MTc1ODk1OTYyOX0.UQToC-mrXC3aVEswU6UKImsgy8rk6bySBCt6M-Zojy8', 0, '2025-08-28 14:53:49', NULL),
(59, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNjc2NzUsImV4cCI6MTc1ODk1OTY3NX0.e3VVXE06fQp7kUeHbaF-4EYgjcE6OP-k1b_5HIPCRBU', 0, '2025-08-28 14:54:35', NULL),
(60, 15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJpYXQiOjE3NTYzNjc2OTcsImV4cCI6MTc1ODk1OTY5N30.xykF-vCbwwcioBNBbudTp__LbpyMI-DmVjVtFrWjzd4', 0, '2025-08-28 14:54:57', NULL),
(61, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNjc3MjIsImV4cCI6MTc1ODk1OTcyMn0.hMiQQWGPsaC5cC040yPHZjfKo1skrH02WSuLi2r_eU8', 0, '2025-08-28 14:55:22', NULL),
(62, 15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJpYXQiOjE3NTYzNzE3MjYsImV4cCI6MTc1ODk2MzcyNn0.guwzpgb_7tC5pRCNgBEhl6yIoCkDCmw0xgf0e999EQk', 0, '2025-08-28 16:02:06', NULL),
(63, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJpYXQiOjE3NTYzNzE3ODQsImV4cCI6MTc1ODk2Mzc4NH0.3iRFt3DdAGHzsm9NNXlMKxw6qLle2Jwp0OdASydkHTQ', 0, '2025-08-28 16:03:04', NULL),
(64, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJpYXQiOjE3NTYzNzIzMDEsImV4cCI6MTc1ODk2NDMwMX0.1cowmlFdOIzw2ie5sxS5m7GS7gjiSv4hKAoSt1NkUFY', 0, '2025-08-28 16:11:41', NULL),
(65, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJpYXQiOjE3NTYzNzMzMzEsImV4cCI6MTc1ODk2NTMzMX0.qcNLcl7POuKPYWss_Y0UwsDsuXvEIRplGxTMoC7odjA', 0, '2025-08-28 16:28:51', NULL),
(66, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNzQxNDEsImV4cCI6MTc1ODk2NjE0MX0.fAHULnGADvSktA9FXRcGIuvXHzN6iUVByTAnUamc22k', 0, '2025-08-28 16:42:21', NULL),
(67, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNzQ1OTksImV4cCI6MTc1ODk2NjU5OX0.7DkYsgH00RdEXPS2eKDY__8YgJTrNHGy0OvRllkrMgY', 0, '2025-08-28 16:49:59', NULL),
(68, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNzQ2NDEsImV4cCI6MTc1ODk2NjY0MX0.XsAInsijKauGrdsEpMeDBUZVSIJUDDfbzFJctZ4cyXg', 0, '2025-08-28 16:50:41', NULL),
(69, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJpYXQiOjE3NTYzNzQ2NTEsImV4cCI6MTc1ODk2NjY1MX0.R8yetEFA1JaKmD-GiSHphdJJ_FLa9BCmTFBME5OzkTw', 0, '2025-08-28 16:50:51', NULL),
(70, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE3NTYzNzQ3NTAsImV4cCI6MTc1ODk2Njc1MH0._lCYeiMJ2zce5oTqSIxWPJ5aGgQU_13S6PhfZgTV9_g', 0, '2025-08-28 16:52:30', NULL),
(71, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJpYXQiOjE3NTYzNzUwMjIsImV4cCI6MTc1ODk2NzAyMn0.rdAvx0EoEu7PzUx76UMvSkYdmSBpGV9BrZ70O_KUxfM', 0, '2025-08-28 16:57:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stories`
--

CREATE TABLE `stories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `media_url` varchar(500) NOT NULL,
  `media_type` enum('image','video') NOT NULL,
  `thumb_url` varchar(500) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stories`
--

INSERT INTO `stories` (`id`, `user_id`, `media_url`, `media_type`, `thumb_url`, `expires_at`, `created_at`) VALUES
(1, 11, '/uploads/images/1756364747537-ryzq0kwj2tj.png', 'image', NULL, '2025-08-29 14:05:47', '2025-08-28 14:05:47'),
(2, 11, '/uploads/images/1756365806121-onih35cg03.png', 'image', NULL, '2025-08-29 14:23:26', '2025-08-28 14:23:26');

-- --------------------------------------------------------

--
-- Table structure for table `story_views`
--

CREATE TABLE `story_views` (
  `story_id` bigint(20) UNSIGNED NOT NULL,
  `viewer_id` bigint(20) UNSIGNED NOT NULL,
  `viewed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `story_views`
--

INSERT INTO `story_views` (`story_id`, `viewer_id`, `viewed_at`) VALUES
(1, 14, '2025-08-28 14:17:34');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(30) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `bio` varchar(150) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_private` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `name`, `email`, `phone`, `bio`, `avatar_url`, `website`, `password_hash`, `is_private`, `created_at`, `updated_at`) VALUES
(11, 'test', NULL, 'test@example.com', NULL, NULL, NULL, NULL, '$2b$12$qIUrJ7aFCQk3lJc3wRjCwec.50dmg.YUUsQC5IF4eizhncsQI1V/.', 1, '2025-08-27 20:16:36', '2025-08-28 16:32:44'),
(12, 'aim', 'Natee', 'aim@example.com', NULL, 'hello world', 'https://cdn.example.com/u/1.jpg', 'https://natee.dev', '$2b$12$M82gGbBEFRGCtqJwaQ65n.nD7DxXqOYg2/Sf6nY295gX7KMqHSXbm', 0, '2025-08-27 20:25:31', '2025-08-27 23:54:28'),
(13, 'mike', NULL, 'mkie@example.com', NULL, NULL, NULL, NULL, '$2b$12$aOnep/IToFu0pELBbARid.m9aWzNnGMOtaJfv0ht2ulf/8eEmg0t.', 0, '2025-08-27 23:41:33', '2025-08-27 23:41:33'),
(14, 'ais', NULL, 'ais@example.com', NULL, NULL, NULL, NULL, '$2b$12$boZ3gEn0iGISM.3zWqLJnunl7dSI80QOi4D5knxOe9hdaeo82ZpLm', 0, '2025-08-28 14:13:46', '2025-08-28 14:13:46'),
(15, 'join', NULL, 'join@example.com', NULL, NULL, NULL, NULL, '$2b$12$N595Z8aa6MxGFhiixS184O/9SXKlYJ7F2.KOfFz5HLUIsS0vDdeb.', 0, '2025-08-28 14:41:19', '2025-08-28 14:41:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_comments_user` (`user_id`),
  ADD KEY `fk_comments_parent` (`parent_id`),
  ADD KEY `idx_comments_post_created` (`post_id`,`created_at`);

--
-- Indexes for table `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`follower_id`,`following_id`),
  ADD KEY `idx_following` (`following_id`),
  ADD KEY `idx_follower` (`follower_id`);

--
-- Indexes for table `follow_requests`
--
ALTER TABLE `follow_requests`
  ADD PRIMARY KEY (`follower_id`,`following_id`),
  ADD KEY `idx_fr_following` (`following_id`),
  ADD KEY `idx_fr_follower` (`follower_id`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`user_id`,`post_id`),
  ADD KEY `idx_likes_post` (`post_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_actor` (`actor_id`),
  ADD KEY `idx_notif_user_created` (`user_id`,`created_at`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_posts_user_created` (`user_id`,`created_at`);

--
-- Indexes for table `post_media`
--
ALTER TABLE `post_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_media_post` (`post_id`);

--
-- Indexes for table `reels`
--
ALTER TABLE `reels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reels_user_created` (`user_id`,`created_at`);

--
-- Indexes for table `reel_likes`
--
ALTER TABLE `reel_likes`
  ADD PRIMARY KEY (`user_id`,`reel_id`),
  ADD KEY `fk_rl_reel` (`reel_id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rt_user` (`user_id`);

--
-- Indexes for table `stories`
--
ALTER TABLE `stories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stories_user` (`user_id`),
  ADD KEY `idx_stories_exp` (`expires_at`);

--
-- Indexes for table `story_views`
--
ALTER TABLE `story_views`
  ADD PRIMARY KEY (`story_id`,`viewer_id`),
  ADD KEY `fk_sv_user` (`viewer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `post_media`
--
ALTER TABLE `post_media`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reels`
--
ALTER TABLE `reels`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `stories`
--
ALTER TABLE `stories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `fk_follows_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_follows_following` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `follow_requests`
--
ALTER TABLE `follow_requests`
  ADD CONSTRAINT `fk_fr_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fr_following` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `fk_likes_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_media`
--
ALTER TABLE `post_media`
  ADD CONSTRAINT `fk_media_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reels`
--
ALTER TABLE `reels`
  ADD CONSTRAINT `fk_reels_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reel_likes`
--
ALTER TABLE `reel_likes`
  ADD CONSTRAINT `fk_rl_reel` FOREIGN KEY (`reel_id`) REFERENCES `reels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rl_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stories`
--
ALTER TABLE `stories`
  ADD CONSTRAINT `fk_stories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `story_views`
--
ALTER TABLE `story_views`
  ADD CONSTRAINT `fk_sv_story` FOREIGN KEY (`story_id`) REFERENCES `stories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sv_user` FOREIGN KEY (`viewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
