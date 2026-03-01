import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Refuel } from '../entities/Refuel';
import { Vehicle } from '../entities/Vehicle';
import { Maintenance } from '../entities/Maintenance';

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
        let { vehiculoId, kilometraje, litros, precioPorLitro, costeTotal, proveedor, tipoCombustible, conductorId } = req.body;

        // Ensure numbers
        vehiculoId = parseInt(vehiculoId.toString());
        kilometraje = parseInt(kilometraje.toString());
        litros = parseFloat(litros.toString());
        precioPorLitro = parseFloat(precioPorLitro.toString());
        costeTotal = parseFloat(costeTotal.toString());
        if (conductorId) conductorId = parseInt(conductorId.toString());

        const ticketImageUrl = req.file ? `uploads/${req.file.filename}` : undefined;

        const vehicle = await vehicleRepository.findOneBy({ id: vehiculoId });
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
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
