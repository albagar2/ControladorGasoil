import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Maintenance } from '../entities/Maintenance';
import { Vehicle } from '../entities/Vehicle';
import { Driver } from '../entities/Driver';

const maintenanceRepository = AppDataSource.getRepository(Maintenance);
const vehicleRepository = AppDataSource.getRepository(Vehicle);

export const getMaintenances = async (req: Request, res: Response) => {
    try {
        const maintenances = await maintenanceRepository.find({
            relations: ["vehiculo", "conductor"],
            order: { fecha: "DESC" }
        });
        res.json(maintenances);
    } catch (error) {
        res.status(500).json({ message: "Error fetching maintenances", error });
    }
};

export const createMaintenance = async (req: Request, res: Response) => {
    try {
        const { vehiculoId, conductorId, fecha, tipo, costePieza, costeTaller, observaciones, kilometraje, proveedor } = req.body;

        const vehicle = await vehicleRepository.findOneBy({ id: vehiculoId });
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        const maintenance = maintenanceRepository.create({
            vehiculoId,
            conductorId,
            fecha,
            tipo,
            costePieza,
            costeTaller,
            observaciones,
            kilometraje,
            proveedor,
            ticketImageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
        });

        await maintenanceRepository.save(maintenance);

        // Update vehicle mileage if this maintenance has higher mileage
        if (kilometraje > vehicle.kilometrajeActual) {
            vehicle.kilometrajeActual = kilometraje;
            await vehicleRepository.save(vehicle);
        }

        res.status(201).json(maintenance);
    } catch (error) {
        res.status(500).json({ message: "Error creating maintenance", error });
    }
};

export const updateMaintenance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { vehiculoId, conductorId, fecha, tipo, costePieza, costeTaller, observaciones, kilometraje, proveedor } = req.body;

        let maintenance = await maintenanceRepository.findOneBy({ id: parseInt(id) });
        if (!maintenance) {
            return res.status(404).json({ message: "Maintenance not found" });
        }

        maintenance.vehiculoId = vehiculoId;
        maintenance.conductorId = conductorId;
        maintenance.fecha = new Date(fecha);
        maintenance.tipo = tipo;
        maintenance.costePieza = costePieza;
        maintenance.costeTaller = costeTaller;
        maintenance.observaciones = observaciones;
        maintenance.kilometraje = kilometraje;
        maintenance.proveedor = proveedor;

        if (req.file) {
            maintenance.ticketImageUrl = `/uploads/${req.file.filename}`;
        }

        await maintenanceRepository.save(maintenance);

        res.json(maintenance);
    } catch (error) {
        res.status(500).json({ message: "Error updating maintenance", error });
    }
};

export const deleteMaintenance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await maintenanceRepository.delete(id);

        if (result.affected === 0) {
            return res.status(404).json({ message: "Maintenance not found" });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error deleting maintenance", error });
    }
};
