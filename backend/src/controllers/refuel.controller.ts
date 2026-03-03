import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Refuel } from '../entities/Refuel';
import { Vehicle } from '../entities/Vehicle';
import { Maintenance } from '../entities/Maintenance';
import { alertService } from '../services/alert.service';
import fs from 'fs';
import path from 'path';

const refuelRepository = AppDataSource.getRepository(Refuel);
const vehicleRepository = AppDataSource.getRepository(Vehicle);
const maintenanceRepository = AppDataSource.getRepository(Maintenance);

export const getRefuels = async (req: Request, res: Response) => {
    try {
        const refuels = await refuelRepository.find({
            relations: ["vehiculo", "conductor"],
            order: { fecha: "DESC" }
        });
        res.json(refuels);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching refuels', error });
    }
};

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

export const updateRefuel = async (req: Request, res: Response) => {
    try {
        const refuel = await refuelRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!refuel) return res.status(404).json({ message: 'Refuel not found' });

        refuelRepository.merge(refuel, req.body);
        const result = await refuelRepository.save(refuel);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error updating refuel', error });
    }
};

export const deleteRefuel = async (req: Request, res: Response) => {
    try {
        const result = await refuelRepository.delete(req.params.id);
        if (result.affected === 0) return res.status(404).json({ message: 'Refuel not found' });
        res.json({ message: 'Refuel deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting refuel', error });
    }
};
