import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Refuel } from '../entities/Refuel';
import { Vehicle } from '../entities/Vehicle';
import { Maintenance } from '../entities/Maintenance';
import { asyncHandler } from '../utils/asyncHandler';
import { alertService } from '../services/alert.service';
import { DriveService } from '../services/drive.service';
import fs from 'fs';
import path from 'path';

const refuelRepository = AppDataSource.getRepository(Refuel);
const vehicleRepository = AppDataSource.getRepository(Vehicle);
const maintenanceRepository = AppDataSource.getRepository(Maintenance);

const sanitizeRefuelData = (data: any) => {
    const sanitized = { ...data };

    // Convert empty strings to null
    for (const key in sanitized) {
        if (sanitized[key] === '') {
            sanitized[key] = null;
        }
    }

    // Ensure numbers are really numbers
    if (sanitized.vehiculoId !== undefined && sanitized.vehiculoId !== null) sanitized.vehiculoId = parseInt(sanitized.vehiculoId.toString());
    if (sanitized.kilometraje !== undefined && sanitized.kilometraje !== null) sanitized.kilometraje = parseInt(sanitized.kilometraje.toString());
    if (sanitized.litros !== undefined && sanitized.litros !== null) sanitized.litros = parseFloat(sanitized.litros.toString());
    if (sanitized.precioPorLitro !== undefined && sanitized.precioPorLitro !== null) sanitized.precioPorLitro = parseFloat(sanitized.precioPorLitro.toString());
    if (sanitized.costeTotal !== undefined && sanitized.costeTotal !== null) sanitized.costeTotal = parseFloat(sanitized.costeTotal.toString());

    // ConductorId 0 -> null
    if (sanitized.conductorId) {
        const cId = parseInt(sanitized.conductorId.toString());
        sanitized.conductorId = cId !== 0 ? cId : null;
    }

    // Explicit Date Parsing
    if (typeof sanitized.fecha === 'string' && sanitized.fecha.trim() !== '') {
        sanitized.fecha = new Date(sanitized.fecha);
    } else if (!sanitized.fecha) {
        sanitized.fecha = new Date();
    }

    return sanitized;
};

export const getRefuels = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId } = req.user;

    const query = refuelRepository.createQueryBuilder("refuel")
        .leftJoinAndSelect("refuel.vehiculo", "vehicle")
        .leftJoinAndSelect("refuel.conductor", "driver")
        .orderBy("refuel.fecha", "DESC");

    if (role !== 'admin') {
        if (!familyId) return res.json([]);
        query.where("vehicle.familyId = :familyId", { familyId });
    }

    const refuels = await query.getMany();
    res.json(refuels);
});

export const createRefuel = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId } = req.user;

    const refuelData = sanitizeRefuelData(req.body);
    const { vehiculoId, kilometraje, litros, precioPorLitro, conductorId, fecha } = refuelData;
    let { tipoCombustible, proveedor } = refuelData;

    const vehicle = await vehicleRepository.findOneBy({ id: vehiculoId });
    if (!vehicle) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Vehicle not found" });
    }

    // Default values if missing
    if (!tipoCombustible || tipoCombustible.trim() === '') {
        tipoCombustible = vehicle.combustible || 'Diesel';
    }
    if (!proveedor) {
        proveedor = 'Desconocido';
    }

    // Security Check
    if (role !== 'admin' && vehicle.familyId !== familyId) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: "Forbidden: Vehicle belongs to another family" });
    }

    let ticketImageUrl = undefined;
    if (req.file) {
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;

        const cleanMatricula = vehicle.matricula.replace(/\s+/g, '').toUpperCase();
        const fileName = `${timestamp}_${cleanMatricula}${path.extname(req.file.originalname)}`;

        // Upload to Google Drive
        const publicUrl = await DriveService.uploadFile(req.file.path, fileName);
        if (publicUrl) {
            ticketImageUrl = publicUrl;
        } else {
            // Fallback to local if Drive fails (though it will be ephemeral)
            ticketImageUrl = `uploads/${req.file.filename}`;
        }
    }

    const newRefuel = refuelRepository.create({
        ...refuelData,
        tipoCombustible,
        proveedor,
        ticketImageUrl
    });

    const savedRefuel = await refuelRepository.save(newRefuel);

    // Update Vehicle Mileage
    if (kilometraje > vehicle.kilometrajeActual) {
        vehicle.kilometrajeActual = kilometraje;
        await vehicleRepository.save(vehicle);
    }

    // Maintenance Alert Logic
    const lastMaintenance = await maintenanceRepository.findOne({
        where: { vehiculoId: vehiculoId, tipo: 'Aceite' },
        order: { kilometraje: 'DESC' }
    });

    let maintenanceAlert = false;
    if (lastMaintenance) {
        if ((kilometraje - lastMaintenance.kilometraje) >= 15000) {
            maintenanceAlert = true;
        }
    } else if (kilometraje > 15000) {
        maintenanceAlert = true;
    }

    // Check for alerts immediately (Wrapped in try-catch to satisfy approved plan)
    try {
        await alertService.checkAndSendAlerts(vehiculoId);
    } catch (error) {
        console.error(`[AlertService] Failed to send alerts for vehicle ${vehiculoId}:`, error);
    }

    res.status(201).json({ ...savedRefuel, maintenanceAlert });
});

export const updateRefuel = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId } = req.user;
    const refuel = await refuelRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ["vehiculo"]
    });

    if (!refuel) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Refuel not found' });
    }

    // Security Check
    if (role !== 'admin' && refuel.vehiculo.familyId !== familyId) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'Forbidden' });
    }

    const refuelData = sanitizeRefuelData(req.body);

    // Handle File Upload if present
    if (req.file) {
        const vehicle = refuel.vehiculo;
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;

        const cleanMatricula = vehicle.matricula.replace(/\s+/g, '').toUpperCase();
        const fileName = `${timestamp}_${cleanMatricula}${path.extname(req.file.originalname)}`;

        // Upload to Google Drive
        const publicUrl = await DriveService.uploadFile(req.file.path, fileName);
        if (publicUrl) {
            refuelData.ticketImageUrl = publicUrl;
        } else {
            refuelData.ticketImageUrl = `uploads/${req.file.filename}`;
        }
    }

    refuelRepository.merge(refuel, refuelData);
    const savedRefuel = await refuelRepository.save(refuel);

    // Update Vehicle Mileage (fetch the vehicle of the SAVED refuel to ensure it's the correct one)
    const activeVehicle = await vehicleRepository.findOneBy({ id: savedRefuel.vehiculoId });
    if (activeVehicle && savedRefuel.kilometraje > activeVehicle.kilometrajeActual) {
        activeVehicle.kilometrajeActual = savedRefuel.kilometraje;
        await vehicleRepository.save(activeVehicle);
    }

    // Return with relations
    const fullRefuel = await refuelRepository.findOne({
        where: { id: savedRefuel.id },
        relations: ["vehiculo", "conductor"]
    });

    // Check for alerts in background (non-blocking)
    alertService.checkAndSendAlerts(savedRefuel.vehiculoId).catch(error => {
        console.error(`[AlertService] Failed to send alerts for vehicle ${savedRefuel.vehiculoId}:`, error);
    });

    res.json(fullRefuel);
});

export const deleteRefuel = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId } = req.user;
    const refuel = await refuelRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ["vehiculo"]
    });

    if (!refuel) return res.status(404).json({ message: 'Refuel not found' });

    // Security Check
    if (role !== 'admin' && refuel.vehiculo.familyId !== familyId) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    await refuelRepository.remove(refuel);
    res.json({ message: 'Refuel deleted successfully' });
});
