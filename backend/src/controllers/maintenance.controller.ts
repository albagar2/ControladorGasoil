import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Maintenance } from '../entities/Maintenance';
import { Vehicle } from '../entities/Vehicle';
import { asyncHandler } from '../utils/asyncHandler';
import { alertService } from '../services/alert.service';
import { DriveService } from '../services/drive.service';
import path from 'path';

const maintenanceRepository = AppDataSource.getRepository(Maintenance);
const vehicleRepository = AppDataSource.getRepository(Vehicle);

export const getMaintenances = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role, familyId } = req.user;

    const query = maintenanceRepository.createQueryBuilder("maintenance")
        .leftJoinAndSelect("maintenance.vehiculo", "vehicle")
        .leftJoinAndSelect("maintenance.conductor", "driver")
        .orderBy("maintenance.fecha", "DESC");

    if (role !== 'admin') {
        if (!familyId) return res.json([]);
        query.where("vehicle.familyId = :familyId", { familyId });
    }

    const maintenances = await query.getMany();
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

    // Security Check
    // @ts-ignore
    const { role, familyId } = req.user;
    if (role !== 'admin' && vehicle.familyId !== familyId) {
        return res.status(403).json({ message: "Forbidden: Vehicle belongs to another family" });
    }

    let ticketImageUrl = undefined;
    if (req.file) {
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
        const cleanMatricula = vehicle.matricula.replace(/\s+/g, '').toUpperCase();
        const fileName = `MNT_${timestamp}_${cleanMatricula}${path.extname(req.file.originalname)}`;
        ticketImageUrl = await DriveService.uploadFile(req.file.path, fileName) || undefined;
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
        ticketImageUrl: ticketImageUrl
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

    let maintenance = await maintenanceRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["vehiculo"]
    });
    if (!maintenance) {
        return res.status(404).json({ message: "Maintenance not found" });
    }

    // Security Check
    // @ts-ignore
    const { role, familyId } = req.user;
    if (role !== 'admin' && maintenance.vehiculo.familyId !== familyId) {
        return res.status(403).json({ message: "Forbidden" });
    }

    const km = parseInt(kilometraje) || 0;
    const vId = parseInt(vehiculoId);

    // If changing vehicle, check new vehicle too
    if (vId !== maintenance.vehiculoId) {
        const newVehicle = await vehicleRepository.findOneBy({ id: vId });
        if (!newVehicle || (role !== 'admin' && newVehicle.familyId !== familyId)) {
            return res.status(403).json({ message: "Forbidden: Target vehicle belongs to another family" });
        }
    }

    maintenance.vehiculoId = vId;
    maintenance.conductorId = (conductorId && parseInt(conductorId) !== 0) ? parseInt(conductorId) : undefined;
    maintenance.fecha = new Date(fecha);
    maintenance.tipo = tipo;
    maintenance.costePieza = parseFloat(costePieza) || 0;
    maintenance.costeTaller = parseFloat(costeTaller) || 0;
    maintenance.observaciones = observaciones;
    maintenance.kilometraje = km;
    maintenance.proveedor = proveedor;

    if (req.file) {
        const vehicle = await vehicleRepository.findOneBy({ id: maintenance.vehiculoId });
        const cleanMatricula = vehicle ? vehicle.matricula.replace(/\s+/g, '').toUpperCase() : vId.toString();
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
        const fileName = `MNT_UPD_${timestamp}_${cleanMatricula}${path.extname(req.file.originalname)}`;
        maintenance.ticketImageUrl = await DriveService.uploadFile(req.file.path, fileName) || undefined;
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
    // @ts-ignore
    const { role, familyId } = req.user;

    const maintenance = await maintenanceRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["vehiculo"]
    });

    if (!maintenance) {
        return res.status(404).json({ message: "Maintenance not found" });
    }

    // Security Check
    if (role !== 'admin' && maintenance.vehiculo.familyId !== familyId) {
        return res.status(403).json({ message: "Forbidden" });
    }

    await maintenanceRepository.remove(maintenance);
    res.status(204).send();
});
