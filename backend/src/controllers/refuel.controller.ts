import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Refuel } from '../entities/Refuel';
import { Vehicle } from '../entities/Vehicle';
import { Maintenance } from '../entities/Maintenance';
import { asyncHandler } from '../utils/asyncHandler';
import { alertService } from '../services/alert.service';
import fs from 'fs';
import path from 'path';

const refuelRepository = AppDataSource.getRepository(Refuel);
const vehicleRepository = AppDataSource.getRepository(Vehicle);
const maintenanceRepository = AppDataSource.getRepository(Maintenance);

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

export const createRefuel = async (req: Request, res: Response) => {
    try {
        console.log('Creating refuel with body:', req.body);
        let { vehiculoId, kilometraje, litros, precioPorLitro, costeTotal, proveedor, tipoCombustible, conductorId } = req.body;

        // Ensure numbers
        vehiculoId = parseInt(vehiculoId.toString());
        kilometraje = parseInt(kilometraje.toString());
        litros = parseFloat(litros.toString());
        precioPorLitro = parseFloat(precioPorLitro.toString());
        costeTotal = parseFloat(costeTotal.toString());

        // Tratar 0 como undefined para evitar errores de FK
        if (conductorId) {
            const cId = parseInt(conductorId.toString());
            conductorId = cId !== 0 ? cId : undefined;
        } else {
            conductorId = undefined;
        }

        const vehicle = await vehicleRepository.findOneBy({ id: vehiculoId });
        if (!vehicle) {
            // Limpiar archivo si el vehículo no existe
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "Vehicle not found" });
        }

        // Security Check: Vehicle must belong to same family
        // @ts-ignore
        const { role, familyId } = req.user;
        if (role !== 'admin' && vehicle.familyId !== familyId) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(403).json({ message: "Forbidden: Vehicle belongs to another family" });
        }

        let ticketImageUrl = undefined;
        if (req.file) {
            const now = new Date();
            const timestamp = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0') + '_' +
                now.getHours().toString().padStart(2, '0') +
                now.getMinutes().toString().padStart(2, '0');

            // Limpiar matrícula de espacios y caracteres raros
            const cleanMatricula = vehicle.matricula.replace(/\s+/g, '').toUpperCase();
            const newFileName = `${timestamp}_${cleanMatricula}${path.extname(req.file.originalname)}`;
            const newPath = path.join('uploads', newFileName);

            try {
                fs.renameSync(req.file.path, newPath);
                ticketImageUrl = `uploads/${newFileName}`;
            } catch (err) {
                console.error('Error renaming file', err);
                ticketImageUrl = `uploads/${req.file.filename}`;
            }
        }

        const newRefuel = refuelRepository.create({
            vehiculoId,
            kilometraje,
            litros,
            precioPorLitro,
            costeTotal,
            proveedor,
            tipoCombustible,
            conductorId,
            ticketImageUrl
        });

        const savedRefuel = await refuelRepository.save(newRefuel);

        // Update Vehicle Mileage
        if (kilometraje > vehicle.kilometrajeActual) {
            vehicle.kilometrajeActual = kilometraje;
            await vehicleRepository.save(vehicle);
        }

        // Check for Maintenance Alert (e.g., Oil change every 15000km)
        const lastMaintenance = await maintenanceRepository.findOne({
            where: { vehiculoId: vehiculoId, tipo: 'Aceite' },
            order: { kilometraje: 'DESC' }
        });

        let maintenanceAlert = false;
        if (lastMaintenance) {
            if ((kilometraje - lastMaintenance.kilometraje) >= 15000) {
                maintenanceAlert = true;
            }
        } else {
            // If no maintenance record, assumes 15k limit from 0? or just ignore. 
            // Let's assume if mileage > 15000 and no record, alert.
            if (kilometraje > 15000) maintenanceAlert = true;
        }

        // Check for alerts immediately
        await alertService.checkAndSendAlerts(vehiculoId);

        res.status(201).json({ ...savedRefuel, maintenanceAlert });

    } catch (error) {
        res.status(400).json({ message: 'Error creating refuel', error });
    }
};

export const updateRefuel = asyncHandler(async (req: Request, res: Response) => {
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

    refuelRepository.merge(refuel, req.body);
    await refuelRepository.save(refuel);

    // Return with relations
    const fullRefuel = await refuelRepository.findOne({
        where: { id: refuel.id },
        relations: ["vehiculo", "conductor"]
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
