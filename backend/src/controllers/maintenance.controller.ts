import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Maintenance } from '../entities/Maintenance';
import { Vehicle } from '../entities/Vehicle';
import { asyncHandler } from '../utils/asyncHandler';
import { alertService } from '../services/alert.service';

const maintenanceRepository = AppDataSource.getRepository(Maintenance);
const vehicleRepository = AppDataSource.getRepository(Vehicle);

export const getMaintenances = asyncHandler(async (req: Request, res: Response) => {
    const maintenances = await maintenanceRepository.find({
        relations: ["vehiculo", "conductor"],
        order: { fecha: "DESC" }
    });
    res.json(maintenances);
});

export const createMaintenance = asyncHandler(async (req: Request, res: Response) => {
    console.log('Creating maintenance with body:', req.body);
    const { vehiculoId, conductorId, fecha, tipo, costePieza, costeTaller, observaciones, kilometraje, proveedor } = req.body;

    const vId = parseInt(vehiculoId);
    // Tratar 0 como undefined para evitar errores de clave foránea si no se selecciona nada
    const cId = (conductorId && parseInt(conductorId) !== 0) ? parseInt(conductorId) : undefined;
    const km = parseInt(kilometraje) || 0;

    if (!vId || isNaN(vId)) {
        return res.status(400).json({ message: "Vehiculo ID es requerido y debe ser válido" });
    }

    const vehicle = await vehicleRepository.findOneBy({ id: vId });
    if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
    }

    const maintenance = maintenanceRepository.create({
        vehiculoId: vId,
        conductorId: cId,
        fecha: new Date(fecha),
        tipo,
        costePieza: parseFloat(costePieza) || 0,
        costeTaller: parseFloat(costeTaller) || 0,
        observaciones,
        kilometraje: km,
        proveedor,
        ticketImageUrl: req.file ? `uploads/${req.file.filename}` : undefined
    });

    await maintenanceRepository.save(maintenance);

    // Update vehicle mileage if this maintenance has higher mileage
    if (km > vehicle.kilometrajeActual) {
        vehicle.kilometrajeActual = km;
        await vehicleRepository.save(vehicle);
    }

    // Return with relations
    const fullMaintenance = await maintenanceRepository.findOne({
        where: { id: maintenance.id },
        relations: ["vehiculo", "conductor"]
    });

    // Check for alerts immediately
    await alertService.checkAndSendAlerts(vId);

    res.status(201).json(fullMaintenance);
});

export const updateMaintenance = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { vehiculoId, conductorId, fecha, tipo, costePieza, costeTaller, observaciones, kilometraje, proveedor } = req.body;

    let maintenance = await maintenanceRepository.findOneBy({ id: parseInt(id) });
    if (!maintenance) {
        return res.status(404).json({ message: "Maintenance not found" });
    }

    const km = parseInt(kilometraje) || 0;

    maintenance.vehiculoId = parseInt(vehiculoId);
    maintenance.conductorId = (conductorId && parseInt(conductorId) !== 0) ? parseInt(conductorId) : undefined;
    maintenance.fecha = new Date(fecha);
    maintenance.tipo = tipo;
    maintenance.costePieza = parseFloat(costePieza) || 0;
    maintenance.costeTaller = parseFloat(costeTaller) || 0;
    maintenance.observaciones = observaciones;
    maintenance.kilometraje = km;
    maintenance.proveedor = proveedor;

    if (req.file) {
        maintenance.ticketImageUrl = `/uploads/${req.file.filename}`;
    }

    await maintenanceRepository.save(maintenance);

    // Update vehicle mileage if needed
    const vehicle = await vehicleRepository.findOneBy({ id: maintenance.vehiculoId });
    if (vehicle && km > vehicle.kilometrajeActual) {
        vehicle.kilometrajeActual = km;
        await vehicleRepository.save(vehicle);
    }

    // Return with relations
    const fullMaintenance = await maintenanceRepository.findOne({
        where: { id: maintenance.id },
        relations: ["vehiculo", "conductor"]
    });

    // Check for alerts immediately
    await alertService.checkAndSendAlerts(maintenance.vehiculoId);

    res.json(fullMaintenance);
});

export const deleteMaintenance = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await maintenanceRepository.delete(id);

    if (result.affected === 0) {
        return res.status(404).json({ message: "Maintenance not found" });
    }

    res.status(204).send();
});
