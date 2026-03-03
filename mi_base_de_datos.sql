-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: control_gasoil_familiar
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `dni` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','conductor','leader') NOT NULL DEFAULT 'conductor',
  `telefono` varchar(255) NOT NULL,
  `fecha_renovacion_carnet` date NOT NULL,
  `puntos` int(11) NOT NULL DEFAULT 15,
  `puntos_maximos` int(11) NOT NULL DEFAULT 15,
  `imagen_url` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `familyId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_9f4a68cc4ca16b7eb77125c776` (`dni`),
  UNIQUE KEY `IDX_d4cfc1aafe3a14622aee390edb` (`email`),
  KEY `FK_e63c42529307575873259454cff` (`familyId`),
  CONSTRAINT `FK_e63c42529307575873259454cff` FOREIGN KEY (`familyId`) REFERENCES `families` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (1,'Admin User','00000000A','admin@example.com','$2b$10$rWlS2jrX.B4Wu3uxRA8KXOeWsaBleX/BrujirORuM1rpunHpoJno6','admin','600000000','2030-01-01',15,15,NULL,'2026-02-16 13:24:36.042892','2026-02-16 13:24:36.042892',NULL),(2,'Alba Usuario','51183452B','alba@example.com','$2b$10$rWlS2jrX.B4Wu3uxRA8KXOeWsaBleX/BrujirORuM1rpunHpoJno6','conductor','606990974','2028-05-15',12,15,NULL,'2026-02-16 13:24:36.056034','2026-03-01 18:10:08.000000',1),(5,'Test User','12345678X','test@test.com','$2b$10$hkpT1d0jLVamzh3Jn1vU4.GjTPtBJGBRFkdvM3guem0AjKLkpBNAO','conductor','600112233','2026-03-01',15,15,NULL,'2026-03-01 13:31:15.745291','2026-03-01 13:31:15.745291',NULL),(6,'Alba García López','12345678A','baciapez@gmail.com','$2b$10$iBqtSfbXCgAUmOR2Abkh/O4DG4ASlvz60zLXft1FnT5ljuMAW0Zvm','conductor','606990974','2029-08-17',12,15,NULL,'2026-03-01 18:43:04.775213','2026-03-01 18:43:04.775213',NULL);
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `families`
--

DROP TABLE IF EXISTS `families`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `families` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `codigo` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_aa966d4a64c9d1fdc94ffa39db` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `families`
--

LOCK TABLES `families` WRITE;
/*!40000 ALTER TABLE `families` DISABLE KEYS */;
INSERT INTO `families` VALUES (1,'Familia García','GARCIA2024','2026-02-14 16:21:02.000000','2026-02-14 16:21:02.000000'),(2,'Familia Pérez','PEREZ2024','2026-02-14 16:21:02.000000','2026-02-14 16:21:02.000000'),(3,'Familia López','W7DAM8','2026-02-16 16:21:39.357600','2026-02-16 16:21:39.357600');
/*!40000 ALTER TABLE `families` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenances`
--

DROP TABLE IF EXISTS `maintenances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `kilometraje` int(11) NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `proveedor` varchar(255) DEFAULT NULL,
  `coste_pieza` decimal(10,2) NOT NULL,
  `coste_taller` decimal(10,2) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `vehiculo_id` int(11) NOT NULL,
  `conductor_id` int(11) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `ticket_image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_0653ed2a455168654b815433a85` (`vehiculo_id`),
  KEY `FK_7941c1447e1d516daaafc605b65` (`conductor_id`),
  CONSTRAINT `FK_0653ed2a455168654b815433a85` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_7941c1447e1d516daaafc605b65` FOREIGN KEY (`conductor_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenances`
--

LOCK TABLES `maintenances` WRITE;
/*!40000 ALTER TABLE `maintenances` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refuels`
--

DROP TABLE IF EXISTS `refuels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refuels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `kilometraje` int(11) NOT NULL,
  `litros` decimal(10,2) NOT NULL,
  `precio_por_litro` decimal(10,3) NOT NULL,
  `coste_total` decimal(10,2) NOT NULL,
  `proveedor` varchar(255) NOT NULL,
  `tipo_combustible` varchar(255) NOT NULL,
  `vehiculo_id` int(11) NOT NULL,
  `ticket_image_url` varchar(255) DEFAULT NULL,
  `conductor_id` int(11) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_6bd2db13dc270f0b9986e023e11` (`vehiculo_id`),
  KEY `FK_275d66b50a362459b13739c45cd` (`conductor_id`),
  CONSTRAINT `FK_275d66b50a362459b13739c45cd` FOREIGN KEY (`conductor_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_6bd2db13dc270f0b9986e023e11` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refuels`
--

LOCK TABLES `refuels` WRITE;
/*!40000 ALTER TABLE `refuels` DISABLE KEYS */;
/*!40000 ALTER TABLE `refuels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `matricula` varchar(255) NOT NULL,
  `modelo` varchar(255) NOT NULL,
  `combustible` enum('Gasolina','Diesel','Eléctrico','Híbrido','GLP','GNC') NOT NULL,
  `distintivo` enum('0','ECO','C','B') NOT NULL DEFAULT 'C',
  `seguro_compañia` varchar(255) NOT NULL,
  `seguro_numero_poliza` varchar(255) NOT NULL,
  `seguro_fecha_vencimiento` date NOT NULL,
  `seguro_cobertura` enum('Terceros','Terceros ampliado','Todo riesgo','Todo riesgo con franquicia') NOT NULL,
  `itv_estado` enum('Pasada','Pendiente','Caducada','Favorable','Desfavorable') NOT NULL DEFAULT 'Pendiente',
  `itv_fecha_caducidad` date NOT NULL,
  `itv_kilometraje` int(11) NOT NULL DEFAULT 0,
  `ano_matriculacion` int(11) NOT NULL,
  `kilometraje_actual` int(11) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `propietario_id` int(11) NOT NULL,
  `familyId` int(11) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fae85799a051b63e35e8c8efd7` (`matricula`),
  KEY `FK_33a6a19a1f3cacce1bbd1dfabd2` (`propietario_id`),
  KEY `FK_6d6652ff0fce3ff0673c9ca1365` (`familyId`),
  CONSTRAINT `FK_33a6a19a1f3cacce1bbd1dfabd2` FOREIGN KEY (`propietario_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_6d6652ff0fce3ff0673c9ca1365` FOREIGN KEY (`familyId`) REFERENCES `families` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (4,'4182HZR','Peugeot','Diesel','','','','0000-00-00','Terceros','Pendiente','0000-00-00',0,2026,0,NULL,1,NULL,'2026-03-01 18:09:04.865284','2026-03-01 18:09:04.865284'),(10,'4182HZL','PEUGEOT','Diesel','0','','','0000-00-00','Terceros','Pendiente','0000-00-00',0,2024,0,NULL,2,1,'2026-03-01 18:29:13.299990','2026-03-01 18:29:13.299990'),(12,'8562JKL','IBIZA','Diesel','B','','','0000-00-00','Terceros','Pendiente','0000-00-00',0,2020,5453642,NULL,6,NULL,'2026-03-02 11:53:44.918850','2026-03-02 11:53:44.918850');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-03 21:31:30
