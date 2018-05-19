SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `xyfir_market`
--

-- --------------------------------------------------------

--
-- Table structure for table `autobuy_items`
--

CREATE TABLE `autobuy_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `thread` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `item` text NOT NULL,
  `added` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `orderId` bigint(20) UNSIGNED NOT NULL,
  `user` varchar(20) NOT NULL,
  `userType` tinyint(3) UNSIGNED NOT NULL,
  `feedback` tinytext NOT NULL,
  `feedbackType` tinyint(4) NOT NULL,
  `given` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` tinyint(3) UNSIGNED NOT NULL,
  `thread` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `buyer` varchar(20) NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed` datetime NOT NULL,
  `status` tinyint(3) UNSIGNED NOT NULL,
  `escrow` tinyint(1) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `amount` decimal(19,18) UNSIGNED NOT NULL,
  `transaction` tinytext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `sales_threads`
--

CREATE TABLE `sales_threads` (
  `id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `author` varchar(20) NOT NULL,
  `data` text NOT NULL,
  `created` int(10) UNSIGNED NOT NULL,
  `approved` tinyint(1) NOT NULL,
  `removed` tinyint(1) NOT NULL,
  `unstructured` tinyint(1) NOT NULL,
  `promoted` datetime NOT NULL,
  `dateRemoved` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `trades`
--

CREATE TABLE `trades` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `trader1` varchar(20) NOT NULL,
  `trader2` varchar(20) NOT NULL,
  `item1` tinytext NOT NULL,
  `item2` tinytext NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed` datetime NOT NULL,
  `confirmed` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `name` varchar(20) NOT NULL,
  `joined` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `statsThread` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `statsThreadExpires` datetime NOT NULL,
  `ignored` tinyint(1) NOT NULL,
  `contacted` tinyint(1) NOT NULL,
  `verifiedProfiles` text NOT NULL,
  `baseRep` tinytext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `autobuy_items`
--
ALTER TABLE `autobuy_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_autobuy_items__thread` (`thread`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD UNIQUE KEY `orderId` (`orderId`,`user`),
  ADD KEY `fk_feedback__user` (`user`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orders__thread` (`thread`),
  ADD KEY `fk_orders_buyer` (`buyer`);

--
-- Indexes for table `sales_threads`
--
ALTER TABLE `sales_threads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sales_threads__author` (`author`);

--
-- Indexes for table `trades`
--
ALTER TABLE `trades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_trader1_name` (`trader1`),
  ADD KEY `fk_trader2_name` (`trader2`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `autobuy_items`
--
ALTER TABLE `autobuy_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50450;

--
-- AUTO_INCREMENT for table `trades`
--
ALTER TABLE `trades`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `autobuy_items`
--
ALTER TABLE `autobuy_items`
  ADD CONSTRAINT `fk_autobuy_items__thread` FOREIGN KEY (`thread`) REFERENCES `sales_threads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `fk_feedback__orderId` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_feedback__user` FOREIGN KEY (`user`) REFERENCES `users` (`name`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders__thread` FOREIGN KEY (`thread`) REFERENCES `sales_threads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_buyer` FOREIGN KEY (`buyer`) REFERENCES `users` (`name`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales_threads`
--
ALTER TABLE `sales_threads`
  ADD CONSTRAINT `fk_sales_threads__author` FOREIGN KEY (`author`) REFERENCES `users` (`name`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trades`
--
ALTER TABLE `trades`
  ADD CONSTRAINT `fk_trader1_name` FOREIGN KEY (`trader1`) REFERENCES `users` (`name`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_trader2_name` FOREIGN KEY (`trader2`) REFERENCES `users` (`name`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
